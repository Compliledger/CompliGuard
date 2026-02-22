/**
 * Proof Freshness Compliance Rule
 * 
 * Evaluates the age of the reserve attestation.
 * Stale proofs indicate potential data reliability issues.
 * 
 * Thresholds:
 * - GREEN:  ≤ 6 hours
 * - YELLOW: 6–24 hours
 * - RED:    > 24 hours
 */

import {
  ComplianceStatus,
  ControlType,
  ControlResult,
  PolicyConfig,
  ReserveData
} from '../types';

export interface ProofFreshnessInput {
  reserves: ReserveData;
  currentTime?: Date;
}

export function evaluateProofFreshness(
  input: ProofFreshnessInput,
  config: PolicyConfig
): ControlResult {
  const { reserves, currentTime = new Date() } = input;
  const { greenMaxAgeHours, yellowMaxAgeHours } = config.proofFreshness;

  const attestationTime = new Date(reserves.attestationTimestamp);
  const ageMs = currentTime.getTime() - attestationTime.getTime();
  // Ensure non-negative (future timestamps treated as 0 age)
  const ageHours = Math.max(0, ageMs / (1000 * 60 * 60));

  let status: ComplianceStatus;
  let message: string;

  if (ageHours <= greenMaxAgeHours) {
    status = ComplianceStatus.GREEN;
    message = `Proof attestation is ${ageHours.toFixed(1)} hours old, within the ${greenMaxAgeHours}-hour freshness window.`;
  } else if (ageHours <= yellowMaxAgeHours) {
    // Edge case: ageHours === 24 must PASS (YELLOW, not RED)
    status = ComplianceStatus.YELLOW;
    message = `Proof attestation is ${ageHours.toFixed(1)} hours old, approaching the ${yellowMaxAgeHours}-hour maximum.`;
  } else {
    status = ComplianceStatus.RED;
    message = `STALE: Proof attestation is ${ageHours.toFixed(1)} hours old, exceeding the ${yellowMaxAgeHours}-hour maximum.`;
  }

  return {
    controlType: ControlType.PROOF_FRESHNESS,
    status,
    value: ageHours,
    threshold: status === ComplianceStatus.GREEN ? greenMaxAgeHours : yellowMaxAgeHours,
    message,
    timestamp: new Date()
  };
}
