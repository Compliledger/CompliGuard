/**
 * Asset Concentration Compliance Rule
 * 
 * Evaluates portfolio diversification.
 * High concentration in a single asset increases systemic risk.
 * 
 * Rules:
 * - Single asset > 75% → YELLOW (concentration warning)
 * - Otherwise → GREEN (well diversified)
 */

import {
  ComplianceStatus,
  ControlType,
  ControlResult,
  PolicyConfig,
  ReserveData
} from '../types';

export interface AssetConcentrationInput {
  reserves: ReserveData;
}

export interface ConcentrationDetails {
  highestConcentration: number;
  highestConcentrationAsset: string;
  assetCount: number;
}

export function evaluateAssetConcentration(
  input: AssetConcentrationInput,
  config: PolicyConfig
): ControlResult & { details?: ConcentrationDetails } {
  const { reserves } = input;
  const { maxSingleAssetPercentage } = config.assetConcentration;

  if (reserves.assets.length === 0) {
    return {
      controlType: ControlType.ASSET_CONCENTRATION,
      status: ComplianceStatus.RED,
      value: 0,
      threshold: maxSingleAssetPercentage,
      message: 'No assets in reserve portfolio.',
      timestamp: new Date()
    };
  }

  const sortedAssets = [...reserves.assets].sort((a, b) => b.percentage - a.percentage);
  const highestAsset = sortedAssets[0];

  const details: ConcentrationDetails = {
    highestConcentration: highestAsset.percentage,
    highestConcentrationAsset: highestAsset.symbol,
    assetCount: reserves.assets.length
  };

  let status: ComplianceStatus;
  let message: string;

  if (highestAsset.percentage > maxSingleAssetPercentage) {
    status = ComplianceStatus.YELLOW;
    message = `Concentration warning: ${highestAsset.symbol} represents ${highestAsset.percentage.toFixed(1)}% of reserves (threshold: ${maxSingleAssetPercentage}%).`;
  } else {
    status = ComplianceStatus.GREEN;
    message = `Portfolio diversification adequate. Highest concentration: ${highestAsset.symbol} at ${highestAsset.percentage.toFixed(1)}%.`;
  }

  return {
    controlType: ControlType.ASSET_CONCENTRATION,
    status,
    value: highestAsset.percentage,
    threshold: maxSingleAssetPercentage,
    message,
    timestamp: new Date(),
    details
  };
}
