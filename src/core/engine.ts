/**
 * CompliGuard Policy Engine
 * 
 * Core compliance evaluation engine that orchestrates rule evaluation
 * and produces deterministic compliance outcomes.
 */

import crypto from 'crypto';
import {
  ComplianceStatus,
  ComplianceResult,
  ControlResult,
  PolicyConfig,
  EvaluationInput,
  EvidenceRecord,
  DEFAULT_POLICY_CONFIG
} from './types';
import {
  evaluateReserveRatio,
  evaluateProofFreshness,
  evaluateAssetQuality,
  evaluateAssetConcentration
} from './rules';

export class ComplianceEngine {
  private config: PolicyConfig;
  private evaluationHistory: EvidenceRecord[] = [];

  constructor(config: Partial<PolicyConfig> = {}) {
    this.config = { ...DEFAULT_POLICY_CONFIG, ...config };
  }

  /**
   * Evaluate compliance based on input data.
   * Applies worst-of aggregation rule.
   */
  evaluate(input: EvaluationInput): ComplianceResult {
    const evaluationTimestamp = new Date();
    const controls: ControlResult[] = [];

    // Evaluate all controls
    controls.push(evaluateReserveRatio(
      { reserves: input.reserves, liabilities: input.liabilities },
      this.config
    ));

    controls.push(evaluateProofFreshness(
      { reserves: input.reserves },
      this.config
    ));

    controls.push(evaluateAssetQuality(
      { reserves: input.reserves },
      this.config
    ));

    controls.push(evaluateAssetConcentration(
      { reserves: input.reserves },
      this.config
    ));

    // Apply worst-of aggregation
    const overallStatus = this.aggregateStatus(controls);

    // Generate evidence hash
    const evidenceHash = this.generateEvidenceHash(input, controls, evaluationTimestamp);

    // Generate human-readable explanation
    const explanation = this.generateExplanation(controls, overallStatus);

    const result: ComplianceResult = {
      overallStatus,
      controls,
      policyVersion: this.config.version,
      evaluationTimestamp,
      evidenceHash,
      explanation
    };

    // Record evidence for audit trail
    this.recordEvidence(input, result);

    return result;
  }

  /**
   * Worst-of aggregation: RED > YELLOW > GREEN
   */
  private aggregateStatus(controls: ControlResult[]): ComplianceStatus {
    const hasRed = controls.some(c => c.status === ComplianceStatus.RED);
    const hasYellow = controls.some(c => c.status === ComplianceStatus.YELLOW);

    if (hasRed) return ComplianceStatus.RED;
    if (hasYellow) return ComplianceStatus.YELLOW;
    return ComplianceStatus.GREEN;
  }

  /**
   * Generate cryptographic hash of evaluation evidence.
   * This hash is safe to expose on-chain without revealing sensitive data.
   */
  private generateEvidenceHash(
    input: EvaluationInput,
    controls: ControlResult[],
    timestamp: Date
  ): string {
    const evidenceData = {
      reserveHash: this.hashSensitiveData(input.reserves),
      liabilityHash: this.hashSensitiveData(input.liabilities),
      controlStatuses: controls.map(c => ({
        type: c.controlType,
        status: c.status
      })),
      timestamp: timestamp.toISOString(),
      policyVersion: this.config.version
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(evidenceData))
      .digest('hex');
  }

  /**
   * Hash sensitive data to create a commitment without exposing values.
   */
  private hashSensitiveData(data: object): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Generate human-readable explanation of compliance status.
   * This explanation is safe to expose publicly.
   */
  private generateExplanation(
    controls: ControlResult[],
    overallStatus: ComplianceStatus
  ): string {
    const statusEmoji = {
      [ComplianceStatus.GREEN]: '🟢',
      [ComplianceStatus.YELLOW]: '🟡',
      [ComplianceStatus.RED]: '🔴'
    };

    const lines: string[] = [
      `${statusEmoji[overallStatus]} Overall Status: ${overallStatus}`,
      '',
      'Control Summary:'
    ];

    for (const control of controls) {
      lines.push(`  ${statusEmoji[control.status]} ${control.controlType}: ${control.status}`);
    }

    lines.push('');

    const failedControls = controls.filter(c => c.status !== ComplianceStatus.GREEN);
    if (failedControls.length > 0) {
      lines.push('Issues Detected:');
      for (const control of failedControls) {
        lines.push(`  - ${control.message}`);
      }
    } else {
      lines.push('All compliance controls passed.');
    }

    return lines.join('\n');
  }

  /**
   * Record evidence for audit trail.
   */
  private recordEvidence(input: EvaluationInput, result: ComplianceResult): void {
    const record: EvidenceRecord = {
      evaluationId: crypto.randomUUID(),
      timestamp: result.evaluationTimestamp,
      inputHash: this.hashSensitiveData(input),
      resultHash: result.evidenceHash,
      policyVersion: result.policyVersion,
      controlResults: result.controls
    };

    this.evaluationHistory.push(record);

    // Keep only last 1000 evaluations in memory
    if (this.evaluationHistory.length > 1000) {
      this.evaluationHistory = this.evaluationHistory.slice(-1000);
    }
  }

  /**
   * Get evaluation history for audit purposes.
   */
  getEvaluationHistory(): EvidenceRecord[] {
    return [...this.evaluationHistory];
  }

  /**
   * Get current policy configuration.
   */
  getConfig(): PolicyConfig {
    return { ...this.config };
  }

  /**
   * Update policy configuration.
   */
  updateConfig(config: Partial<PolicyConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance for convenience
export const complianceEngine = new ComplianceEngine();
