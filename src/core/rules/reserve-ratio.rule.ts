/**
 * Reserve Ratio Compliance Rule
 * 
 * Evaluates whether reserves adequately cover liabilities.
 * reserve_ratio = reserves / liabilities
 * 
 * Thresholds:
 * - GREEN:  ≥ 1.02 (102%+ coverage)
 * - YELLOW: 1.00–1.019 (100-101.9% coverage)
 * - RED:    < 1.00 (undercollateralized)
 */

import {
  ComplianceStatus,
  ControlType,
  ControlResult,
  PolicyConfig,
  ReserveData,
  LiabilityData
} from '../types';

export interface ReserveRatioInput {
  reserves: ReserveData;
  liabilities: LiabilityData;
}

export function evaluateReserveRatio(
  input: ReserveRatioInput,
  config: PolicyConfig
): ControlResult {
  const { reserves, liabilities } = input;
  const { greenThreshold, yellowThreshold } = config.reserveRatio;

  if (liabilities.totalValue === 0) {
    return {
      controlType: ControlType.RESERVE_RATIO,
      status: ComplianceStatus.GREEN,
      value: Infinity,
      threshold: greenThreshold,
      message: 'No liabilities reported; reserve ratio is infinite.',
      timestamp: new Date()
    };
  }

  // Round to 10 decimal places to avoid floating point precision issues
  // e.g. 1.0000000000000002 should be treated as 1.00 (YELLOW, not RED)
  const ratio = Math.round((reserves.totalValue / liabilities.totalValue) * 1e10) / 1e10;

  let status: ComplianceStatus;
  let message: string;

  if (ratio >= greenThreshold) {
    status = ComplianceStatus.GREEN;
    message = `Reserve ratio of ${ratio.toFixed(3)}x meets the ${greenThreshold.toFixed(2)}x threshold.`;
  } else if (ratio >= yellowThreshold) {
    // Edge case: ratio === 1.00 must PASS (YELLOW, not RED)
    status = ComplianceStatus.YELLOW;
    message = `Reserve ratio of ${ratio.toFixed(3)}x is below optimal but above minimum threshold.`;
  } else {
    status = ComplianceStatus.RED;
    message = `CRITICAL: Reserve ratio of ${ratio.toFixed(3)}x is below 1.00x. System is undercollateralized.`;
  }

  return {
    controlType: ControlType.RESERVE_RATIO,
    status,
    value: ratio,
    threshold: status === ComplianceStatus.GREEN ? greenThreshold : yellowThreshold,
    message,
    timestamp: new Date()
  };
}
