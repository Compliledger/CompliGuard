/**
 * Chainlink Proof of Reserve Feed Reader
 *
 * Reads live reserve data from the Chainlink AggregatorV3 PoR feed:
 * Contract: 0x9A709B7B69EA42D5eeb1ceBC48674C69E1569eC6 (Ethereum Mainnet)
 *
 * latestRoundData() returns:
 *   (roundId, answer, startedAt, updatedAt, answeredInRound)
 *   - answer:    reserve value (scaled by 10^decimals)
 *   - updatedAt: Unix timestamp of last attestation
 */

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { ReserveData, Asset, AssetRiskLevel } from '../core/types';
import { sha256 } from '../utils/hash';

// WBTC Proof of Reserve feed (AggregatorV3Interface) — Ethereum Mainnet
// Returns the total BTC held in reserve backing WBTC
const POR_FEED_ADDRESS = '0xa81FE04086865e63E12dD3776978E49DEEa2ea4e' as `0x${string}`;

// BTC/USD price feed — used to convert BTC reserves to USD
const BTC_USD_FEED_ADDRESS = '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c' as `0x${string}`;

// AggregatorV3Interface — minimal ABI needed
const AGGREGATOR_V3_ABI = [
  {
    name: 'latestRoundData',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'roundId',         type: 'uint80'  },
      { name: 'answer',          type: 'int256'  },
      { name: 'startedAt',       type: 'uint256' },
      { name: 'updatedAt',       type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80'  }
    ]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  },
  {
    name: 'description',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  }
] as const;

// Use mainnet RPC — prefer env var, fall back to public nodes
const MAINNET_RPC_URL =
  process.env.ETHEREUM_MAINNET_RPC_URL ||
  process.env.ETHEREUM_RPC_URL ||
  'https://eth.llamarpc.com';

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(MAINNET_RPC_URL)
});

export interface ChainlinkPoRData {
  reserveValue: number;       // USD value of reserves
  attestationTimestamp: Date; // when the feed was last updated
  roundId: string;
  description: string;
  decimals: number;
  rawAnswer: bigint;
}

/**
 * Fetch the latest round data from the Chainlink PoR feed.
 * Returns null if the RPC call fails.
 */
export async function fetchChainlinkPoR(): Promise<ChainlinkPoRData | null> {
  try {
    // Fetch PoR feed + BTC/USD price feed in parallel
    const [roundData, decimals, description, btcPriceData, btcDecimals] = await Promise.all([
      mainnetClient.readContract({
        address: POR_FEED_ADDRESS,
        abi: AGGREGATOR_V3_ABI,
        functionName: 'latestRoundData'
      }),
      mainnetClient.readContract({
        address: POR_FEED_ADDRESS,
        abi: AGGREGATOR_V3_ABI,
        functionName: 'decimals'
      }),
      mainnetClient.readContract({
        address: POR_FEED_ADDRESS,
        abi: AGGREGATOR_V3_ABI,
        functionName: 'description'
      }),
      mainnetClient.readContract({
        address: BTC_USD_FEED_ADDRESS,
        abi: AGGREGATOR_V3_ABI,
        functionName: 'latestRoundData'
      }),
      mainnetClient.readContract({
        address: BTC_USD_FEED_ADDRESS,
        abi: AGGREGATOR_V3_ABI,
        functionName: 'decimals'
      })
    ]);

    const [roundId, answer, , updatedAt] = roundData as [bigint, bigint, bigint, bigint, bigint];
    const dec = Number(decimals);

    // PoR answer is BTC count scaled by 10^decimals
    const reserveBtc = Number(answer) / Math.pow(10, dec);

    // BTC/USD price
    const [, btcPrice] = btcPriceData as [bigint, bigint, bigint, bigint, bigint];
    const btcDec = Number(btcDecimals);
    const btcUsdPrice = Number(btcPrice) / Math.pow(10, btcDec);

    // Reserve value in USD
    const reserveValue = reserveBtc * btcUsdPrice;

    return {
      reserveValue,
      attestationTimestamp: new Date(Number(updatedAt) * 1000),
      roundId: roundId.toString(),
      description: description as string,
      decimals: dec,
      rawAnswer: answer as bigint
    };
  } catch (err) {
    console.error('[ChainlinkPoR] Failed to fetch feed data:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Convert Chainlink PoR feed data into a ReserveData object
 * compatible with the ComplianceEngine.
 *
 * Since the PoR feed returns a single aggregate reserve value (not
 * a per-asset breakdown), we model it as one SAFE asset representing
 * 100% of reserves. The liabilities value must be provided separately
 * (e.g. from circulating supply data).
 */
export async function buildReserveDataFromChainlink(): Promise<ReserveData | null> {
  const por = await fetchChainlinkPoR();
  if (!por) return null;

  const { reserveValue, attestationTimestamp, description, roundId } = por;

  const asset: Asset = {
    id:         'chainlink-por-reserve',
    name:       description || 'Chainlink PoR Reserve',
    symbol:     'RESERVE',
    value:      reserveValue,
    riskLevel:  AssetRiskLevel.SAFE,
    percentage: 100
  };

  const hashInput = { roundId, reserveValue, updatedAt: attestationTimestamp.toISOString() };

  return {
    totalValue:           reserveValue,
    assets:               [asset],
    attestationTimestamp,
    attestationHash:      `0x${sha256(hashInput).substring(0, 64)}`,
    source:               `chainlink-por:${POR_FEED_ADDRESS}`
  };
}

export const POR_FEED_INFO = {
  porFeedAddress:    POR_FEED_ADDRESS,
  btcUsdFeedAddress: BTC_USD_FEED_ADDRESS,
  network:           'mainnet',
  explorerUrl:       `https://etherscan.io/address/${POR_FEED_ADDRESS}`
};
