/**
 * On-Chain Contract Reader
 * 
 * Reads compliance reports directly from the deployed Sepolia smart contract.
 * This provides REAL blockchain verification of compliance status.
 */

import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

// Contract configuration
const CONTRACT_ADDRESS = '0xf9BaAE04C412c23BC750E79C84A19692708E71b9' as `0x${string}`;
const RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

// Contract ABI (JSON format for complex return types)
const CONTRACT_ABI = [
  {
    name: 'receiveReport',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_status', type: 'uint8' },
      { name: '_evidenceHash', type: 'bytes32' },
      { name: '_policyVersion', type: 'string' },
      { name: '_timestamp', type: 'uint256' },
      { name: '_controlCount', type: 'uint8' }
    ],
    outputs: []
  },
  {
    name: 'getReportCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'getLatestStatus',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  },
  {
    name: 'latestReport',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'status', type: 'uint8' },
      { name: 'evidenceHash', type: 'bytes32' },
      { name: 'policyVersion', type: 'string' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'controlCount', type: 'uint8' }
    ]
  },
  {
    name: 'getReport',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'status', type: 'uint8' },
          { name: 'evidenceHash', type: 'bytes32' },
          { name: 'policyVersion', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'controlCount', type: 'uint8' }
        ]
      }
    ]
  },
  {
    name: 'hasReport',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_evidenceHash', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

// Status mapping
const STATUS_LABELS = ['GREEN', 'YELLOW', 'RED'] as const;

export interface OnChainReport {
  status: 'GREEN' | 'YELLOW' | 'RED';
  statusCode: number;
  evidenceHash: string;
  policyVersion: string;
  timestamp: Date;
  controlCount: number;
}

export interface OnChainSummary {
  contractAddress: string;
  network: string;
  chainId: number;
  reportCount: number;
  latestReport: OnChainReport | null;
  explorerUrl: string;
}

// Create public client
const client = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL)
});

/**
 * Get total number of reports stored on-chain
 */
export async function getReportCount(): Promise<number> {
  const count = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getReportCount'
  });
  return Number(count);
}

/**
 * Get latest compliance status from on-chain
 */
export async function getLatestStatus(): Promise<'GREEN' | 'YELLOW' | 'RED'> {
  const status = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getLatestStatus'
  });
  return STATUS_LABELS[Number(status)] || 'GREEN';
}

/**
 * Get the latest full report from on-chain
 */
export async function getLatestReport(): Promise<OnChainReport | null> {
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'latestReport'
    }) as [number, `0x${string}`, string, bigint, number];

    const [statusCode, evidenceHash, policyVersion, timestamp, controlCount] = result;

    // Check if there's actually a report (timestamp > 0)
    if (Number(timestamp) === 0) {
      return null;
    }

    return {
      status: STATUS_LABELS[statusCode] || 'GREEN',
      statusCode,
      evidenceHash: evidenceHash,
      policyVersion,
      timestamp: new Date(Number(timestamp) * 1000),
      controlCount
    };
  } catch (error) {
    console.error('Error reading latest report:', error);
    return null;
  }
}

/**
 * Get a specific report by index
 */
export async function getReportByIndex(index: number): Promise<OnChainReport | null> {
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getReport',
      args: [BigInt(index)]
    }) as { status: number; evidenceHash: `0x${string}`; policyVersion: string; timestamp: bigint; controlCount: number };

    return {
      status: STATUS_LABELS[result.status] || 'GREEN',
      statusCode: result.status,
      evidenceHash: result.evidenceHash,
      policyVersion: result.policyVersion,
      timestamp: new Date(Number(result.timestamp) * 1000),
      controlCount: result.controlCount
    };
  } catch (error) {
    console.error(`Error reading report ${index}:`, error);
    return null;
  }
}

/**
 * Get recent reports from on-chain (last N reports)
 */
export async function getRecentReports(limit: number = 10): Promise<OnChainReport[]> {
  const count = await getReportCount();
  const reports: OnChainReport[] = [];
  
  const start = Math.max(0, count - limit);
  for (let i = count - 1; i >= start; i--) {
    const report = await getReportByIndex(i);
    if (report) {
      reports.push(report);
    }
  }
  
  return reports;
}

/**
 * Check if a specific evidence hash exists on-chain
 */
export async function hasReport(evidenceHash: string): Promise<boolean> {
  const hash = evidenceHash.startsWith('0x') ? evidenceHash : `0x${evidenceHash}`;
  const exists = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasReport',
    args: [hash as `0x${string}`]
  });
  return exists as boolean;
}

/**
 * Get full on-chain summary
 */
export async function getOnChainSummary(): Promise<OnChainSummary> {
  const [reportCount, latestReport] = await Promise.all([
    getReportCount(),
    getLatestReport()
  ]);

  return {
    contractAddress: CONTRACT_ADDRESS,
    network: 'sepolia',
    chainId: sepolia.id,
    reportCount,
    latestReport,
    explorerUrl: `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`
  };
}

// Export contract info for reference
export const CONTRACT_INFO = {
  address: CONTRACT_ADDRESS,
  network: 'sepolia',
  chainId: 11155111,
  explorerUrl: `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`
};
