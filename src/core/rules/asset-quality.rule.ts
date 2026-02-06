/**
 * Asset Quality Compliance Rule
 * 
 * Evaluates the quality of assets in the reserve portfolio.
 * Detects disallowed assets and excessive risky asset allocation.
 * 
 * Rules:
 * - Any disallowed assets → RED
 * - Risky assets > 30% → RED
 * - Otherwise → GREEN
 */

import {
  ComplianceStatus,
  ControlType,
  ControlResult,
  PolicyConfig,
  ReserveData,
  AssetRiskLevel
} from '../types';

export interface AssetQualityInput {
  reserves: ReserveData;
}

export interface AssetQualityDetails {
  disallowedAssets: string[];
  riskyPercentage: number;
  safePercentage: number;
}

export function evaluateAssetQuality(
  input: AssetQualityInput,
  config: PolicyConfig
): ControlResult & { details?: AssetQualityDetails } {
  const { reserves } = input;
  const { maxRiskyPercentage } = config.assetQuality;

  const disallowedAssets = reserves.assets
    .filter(a => a.riskLevel === AssetRiskLevel.DISALLOWED)
    .map(a => a.symbol);

  const riskyPercentage = reserves.assets
    .filter(a => a.riskLevel === AssetRiskLevel.RISKY)
    .reduce((sum, a) => sum + a.percentage, 0);

  const safePercentage = reserves.assets
    .filter(a => a.riskLevel === AssetRiskLevel.SAFE)
    .reduce((sum, a) => sum + a.percentage, 0);

  const details: AssetQualityDetails = {
    disallowedAssets,
    riskyPercentage,
    safePercentage
  };

  let status: ComplianceStatus;
  let message: string;

  if (disallowedAssets.length > 0) {
    status = ComplianceStatus.RED;
    message = `VIOLATION: Disallowed assets detected in reserves: ${disallowedAssets.join(', ')}.`;
  } else if (riskyPercentage > maxRiskyPercentage) {
    status = ComplianceStatus.RED;
    message = `VIOLATION: Risky assets at ${riskyPercentage.toFixed(1)}% exceed the ${maxRiskyPercentage}% maximum.`;
  } else {
    status = ComplianceStatus.GREEN;
    message = `Asset quality compliant. Safe assets: ${safePercentage.toFixed(1)}%, Risky assets: ${riskyPercentage.toFixed(1)}%.`;
  }

  return {
    controlType: ControlType.ASSET_QUALITY,
    status,
    value: riskyPercentage,
    threshold: maxRiskyPercentage,
    message,
    timestamp: new Date(),
    details
  };
}
