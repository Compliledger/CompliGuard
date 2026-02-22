/**
 * Asset Concentration Compliance Rule
 *
 * Evaluates portfolio diversification by checking the largest single-asset percentage.
 *
 * Rules:
 * - maxAssetPercentage <= 60  → GREEN
 * - maxAssetPercentage <= 75  → YELLOW  (edge case: exactly 75 must PASS as YELLOW)
 * - maxAssetPercentage >  75  → RED
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
  const { greenMaxPercentage, yellowMaxPercentage } = config.assetConcentration;

  if (reserves.assets.length === 0) {
    return {
      controlType: ControlType.ASSET_CONCENTRATION,
      status: ComplianceStatus.RED,
      value: 0,
      threshold: yellowMaxPercentage,
      message: 'No assets in reserve portfolio.',
      timestamp: new Date()
    };
  }

  const maxPercentage = Math.max(...reserves.assets.map(a => a.percentage));
  const highestAsset = reserves.assets.find(a => a.percentage === maxPercentage)!;

  const details: ConcentrationDetails = {
    highestConcentration: maxPercentage,
    highestConcentrationAsset: highestAsset.symbol,
    assetCount: reserves.assets.length
  };

  let status: ComplianceStatus;
  let message: string;

  if (maxPercentage <= greenMaxPercentage) {
    status = ComplianceStatus.GREEN;
    message = `Portfolio well diversified. Highest concentration: ${highestAsset.symbol} at ${maxPercentage.toFixed(1)}%.`;
  } else if (maxPercentage <= yellowMaxPercentage) {
    // Edge case: exactly 75 must PASS (YELLOW, not RED)
    status = ComplianceStatus.YELLOW;
    message = `Concentration warning: ${highestAsset.symbol} at ${maxPercentage.toFixed(1)}% exceeds the ${greenMaxPercentage}% optimal threshold.`;
  } else {
    status = ComplianceStatus.RED;
    message = `VIOLATION: ${highestAsset.symbol} at ${maxPercentage.toFixed(1)}% exceeds the ${yellowMaxPercentage}% maximum concentration limit.`;
  }

  return {
    controlType: ControlType.ASSET_CONCENTRATION,
    status,
    value: maxPercentage,
    threshold: status === ComplianceStatus.GREEN ? greenMaxPercentage : yellowMaxPercentage,
    message,
    timestamp: new Date(),
    details
  };
}
