/**
 * Asset Quality Compliance Rule
 *
 * Evaluates the quality of assets in the reserve portfolio.
 * Restricted asset presence is a structural breach — no YELLOW state.
 *
 * Rules:
 * - Any asset with riskLevel in restrictedAssetLevels → RED
 * - Otherwise → GREEN
 */

import {
  ComplianceStatus,
  ControlType,
  ControlResult,
  PolicyConfig,
  ReserveData
} from '../types';

export interface AssetQualityInput {
  reserves: ReserveData;
}

export interface AssetQualityDetails {
  restrictedAssets: string[];
  safePercentage: number;
}

export function evaluateAssetQuality(
  input: AssetQualityInput,
  config: PolicyConfig
): ControlResult & { details?: AssetQualityDetails } {
  const { reserves } = input;
  const { restrictedAssetLevels } = config.assetQuality;

  const restrictedAssets = reserves.assets
    .filter(a => restrictedAssetLevels.includes(a.riskLevel))
    .map(a => a.symbol);

  const safePercentage = reserves.assets
    .filter(a => !restrictedAssetLevels.includes(a.riskLevel))
    .reduce((sum, a) => sum + a.percentage, 0);

  const details: AssetQualityDetails = {
    restrictedAssets,
    safePercentage
  };

  let status: ComplianceStatus;
  let message: string;

  if (restrictedAssets.length > 0) {
    status = ComplianceStatus.RED;
    message = `VIOLATION: Restricted assets detected in reserves: ${restrictedAssets.join(', ')}.`;
  } else {
    status = ComplianceStatus.GREEN;
    message = `Asset quality compliant. No restricted assets detected. Safe holdings: ${safePercentage.toFixed(1)}%.`;
  }

  return {
    controlType: ControlType.ASSET_QUALITY,
    status,
    value: restrictedAssets.length,
    threshold: 0,
    message,
    timestamp: new Date(),
    details
  };
}
