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

  const ratio = reserves.totalValue / liabilities.totalValue;

  let status: ComplianceStatus;
  let message: string;

  if (ratio >= greenThreshold) {
    status = ComplianceStatus.GREEN;
    message = `Reserve ratio of ${(ratio * 100).toFixed(2)}% meets the ${(greenThreshold * 100).toFixed(0)}% threshold.`;
  } else if (ratio >= yellowThreshold) {
    status = ComplianceStatus.YELLOW;
    message = `Reserve ratio of ${(ratio * 100).toFixed(2)}% is below optimal but above minimum threshold.`;
  } else {
    status = ComplianceStatus.RED;
    message = `CRITICAL: Reserve ratio of ${(ratio * 100).toFixed(2)}% is below 100%. System is undercollateralized.`;
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
