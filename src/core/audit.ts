/**
 * Tamper-Proof Audit Logging
 *
 * Provides an append-only, hash-chained audit log for compliance evaluations.
 * Each entry includes a chain hash linking it to the previous entry,
 * making tampering detectable.
 *
 * Privacy: Only hashes and statuses are stored — never raw sensitive data.
 */

import crypto from 'crypto';
import { ComplianceResult, ComplianceStatus, ControlType } from './types';

/**
 * A single audit log entry
 */
export interface AuditEntry {
  /** Sequential entry ID */
  entryId: number;
  /** ISO timestamp */
  timestamp: string;
  /** Unique evaluation ID */
  evaluationId: string;
  /** Overall compliance status */
  overallStatus: ComplianceStatus;
  /** Per-control status summary (no sensitive values) */
  controlSummary: { type: ControlType; status: ComplianceStatus }[];
  /** Policy version used */
  policyVersion: string;
  /** Evidence hash from the engine */
  evidenceHash: string;
  /** Hash of this entry's content */
  entryHash: string;
  /** Hash of the previous entry (chain link) */
  previousHash: string;
}

/**
 * Hash-chained, append-only audit logger.
 * Detects tampering via chain verification.
 */
export class AuditLogger {
  private log: AuditEntry[] = [];
  private previousHash: string = '0'.repeat(64); // genesis hash

  /**
   * Record a compliance evaluation result.
   * Only safe, non-sensitive data is stored.
   */
  record(evaluationId: string, result: ComplianceResult): AuditEntry {
    const entryId = this.log.length;
    const timestamp = new Date().toISOString();

    const controlSummary = result.controls.map(c => ({
      type: c.controlType as ControlType,
      status: c.status
    }));

    const contentToHash = JSON.stringify({
      entryId,
      timestamp,
      evaluationId,
      overallStatus: result.overallStatus,
      controlSummary,
      policyVersion: result.policyVersion,
      evidenceHash: result.evidenceHash,
      previousHash: this.previousHash
    });

    const entryHash = crypto
      .createHash('sha256')
      .update(contentToHash)
      .digest('hex');

    const entry: AuditEntry = {
      entryId,
      timestamp,
      evaluationId,
      overallStatus: result.overallStatus,
      controlSummary,
      policyVersion: result.policyVersion,
      evidenceHash: result.evidenceHash,
      entryHash,
      previousHash: this.previousHash
    };

    this.log.push(entry);
    this.previousHash = entryHash;

    return entry;
  }

  /**
   * Verify the integrity of the entire audit chain.
   * Returns true if no tampering is detected.
   */
  verifyChain(): { valid: boolean; brokenAt?: number; reason?: string } {
    let prevHash = '0'.repeat(64);

    for (let i = 0; i < this.log.length; i++) {
      const entry = this.log[i];

      // Check chain link
      if (entry.previousHash !== prevHash) {
        return {
          valid: false,
          brokenAt: i,
          reason: `Chain broken at entry ${i}: expected previousHash ${prevHash.substring(0, 16)}..., got ${entry.previousHash.substring(0, 16)}...`
        };
      }

      // Recompute entry hash
      const contentToHash = JSON.stringify({
        entryId: entry.entryId,
        timestamp: entry.timestamp,
        evaluationId: entry.evaluationId,
        overallStatus: entry.overallStatus,
        controlSummary: entry.controlSummary,
        policyVersion: entry.policyVersion,
        evidenceHash: entry.evidenceHash,
        previousHash: entry.previousHash
      });

      const expectedHash = crypto
        .createHash('sha256')
        .update(contentToHash)
        .digest('hex');

      if (entry.entryHash !== expectedHash) {
        return {
          valid: false,
          brokenAt: i,
          reason: `Entry ${i} hash mismatch: content has been tampered with`
        };
      }

      prevHash = entry.entryHash;
    }

    return { valid: true };
  }

  /**
   * Get the full audit log (read-only copy)
   */
  getLog(): ReadonlyArray<AuditEntry> {
    return [...this.log];
  }

  /**
   * Get log length
   */
  get length(): number {
    return this.log.length;
  }

  /**
   * Export log as JSON (for external audit)
   */
  exportJSON(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      chainValid: this.verifyChain().valid,
      entries: this.log
    }, null, 2);
  }
}
