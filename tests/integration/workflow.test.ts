/**
 * Integration & Failure-Mode Tests
 *
 * Tests the full workflow pipeline and verifies graceful degradation
 * under failure conditions (stale data, API timeout, AI failure).
 */

import {
  ComplianceEngine,
  ComplianceStatus,
  AssetRiskLevel,
  EvaluationInput,
  AIReasoningAgent,
  AuditLogger
} from '../../src/core';
import { NodeHttpClient } from '../../src/cre/http';
import { ReserveApiClient, LiabilityApiClient } from '../../src/api/clients';

describe('Integration: Full Pipeline', () => {
  let engine: ComplianceEngine;
  let agent: AIReasoningAgent;
  let audit: AuditLogger;

  beforeEach(() => {
    engine = new ComplianceEngine();
    agent = new AIReasoningAgent();
    audit = new AuditLogger();
  });

  const greenInput: EvaluationInput = {
    reserves: {
      totalValue: 105_000_000,
      assets: [
        { id: 's1', name: 'T-Bills', symbol: 'TBILL', value: 78_750_000, riskLevel: AssetRiskLevel.SAFE, percentage: 75 },
        { id: 's2', name: 'Cash', symbol: 'CASH', value: 26_250_000, riskLevel: AssetRiskLevel.SAFE, percentage: 25 }
      ],
      attestationTimestamp: new Date(),
      attestationHash: '0xabc',
      source: 'integration-test'
    },
    liabilities: {
      totalValue: 100_000_000,
      circulatingSupply: 100_000_000,
      timestamp: new Date(),
      source: 'integration-test'
    }
  };

  const redInput: EvaluationInput = {
    reserves: {
      totalValue: 90_000_000,
      assets: [
        { id: 's1', name: 'T-Bills', symbol: 'TBILL', value: 90_000_000, riskLevel: AssetRiskLevel.SAFE, percentage: 100 }
      ],
      attestationTimestamp: new Date(),
      attestationHash: '0xdef',
      source: 'integration-test'
    },
    liabilities: {
      totalValue: 100_000_000,
      circulatingSupply: 100_000_000,
      timestamp: new Date(),
      source: 'integration-test'
    }
  };

  describe('end-to-end pipeline', () => {
    it('should evaluate → reason → audit for GREEN state', () => {
      const result = engine.evaluate(greenInput, true);
      expect(result.overallStatus).toBe(ComplianceStatus.GREEN);

      const reasoning = agent.generateReasoning(result);
      expect(reasoning.confidence).toBe('HIGH');
      expect(reasoning.summary).toContain('COMPLIANT');

      const entry = audit.record('integration-green', result);
      expect(entry.overallStatus).toBe(ComplianceStatus.GREEN);
      expect(audit.verifyChain().valid).toBe(true);
    });

    it('should evaluate → reason → audit for RED state', () => {
      const result = engine.evaluate(redInput, true);
      expect(result.overallStatus).toBe(ComplianceStatus.RED);

      const reasoning = agent.generateReasoning(result);
      expect(reasoning.summary).toContain('NON-COMPLIANT');
      expect(reasoning.remediation.length).toBeGreaterThan(0);

      const entry = audit.record('integration-red', result);
      expect(entry.overallStatus).toBe(ComplianceStatus.RED);
      expect(audit.verifyChain().valid).toBe(true);
    });

    it('should handle GREEN → RED transition with audit trail', () => {
      const r1 = engine.evaluate(greenInput, true);
      audit.record('eval-green', r1);

      const r2 = engine.evaluate(redInput, true);
      audit.record('eval-red', r2);

      expect(audit.length).toBe(2);
      const log = audit.getLog();
      expect(log[0].overallStatus).toBe(ComplianceStatus.GREEN);
      expect(log[1].overallStatus).toBe(ComplianceStatus.RED);
      expect(log[1].previousHash).toBe(log[0].entryHash);
      expect(audit.verifyChain().valid).toBe(true);
    });
  });

  describe('failure modes', () => {
    it('should handle stale attestation data gracefully', () => {
      const staleInput: EvaluationInput = {
        ...greenInput,
        reserves: {
          ...greenInput.reserves,
          attestationTimestamp: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48h old
        }
      };

      const result = engine.evaluate(staleInput, true);
      expect(result.overallStatus).toBe(ComplianceStatus.RED);

      const reasoning = agent.generateReasoning(result);
      expect(reasoning.controlAnalysis.some(
        a => a.controlType === 'PROOF_FRESHNESS' && a.severity === 'CRITICAL'
      )).toBe(true);
    });

    it('should handle AI reasoning failure with graceful degradation', () => {
      const brokenAgent = new AIReasoningAgent({ enabled: false });
      const result = engine.evaluate(greenInput, true);
      const reasoning = brokenAgent.generateReasoning(result);

      expect(reasoning.confidence).toBe('LOW');
      expect(reasoning.summary).toContain('fallback');
      // Engine result is unaffected
      expect(result.overallStatus).toBe(ComplianceStatus.GREEN);
    });

    it('should handle API client with unreachable server', async () => {
      const badHttp = new NodeHttpClient('http://localhost:99999', 'key');
      const client = new ReserveApiClient(badHttp, { retries: 0, backoffMs: 10 });

      const response = await client.getReserveData();
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should handle multiple concurrent failures without crashing', () => {
      const badInput: EvaluationInput = {
        reserves: {
          totalValue: 80_000_000,
          assets: [
            { id: 'd1', name: 'Restricted', symbol: 'R', value: 40_000_000, riskLevel: AssetRiskLevel.DISALLOWED, percentage: 50 },
            { id: 'r1', name: 'Risky', symbol: 'RK', value: 40_000_000, riskLevel: AssetRiskLevel.RISKY, percentage: 50 }
          ],
          attestationTimestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 72h old
          attestationHash: '0xbad',
          source: 'test'
        },
        liabilities: {
          totalValue: 100_000_000,
          circulatingSupply: 100_000_000,
          timestamp: new Date(),
          source: 'test'
        }
      };

      const result = engine.evaluate(badInput, true);
      expect(result.overallStatus).toBe(ComplianceStatus.RED);

      const redControls = result.controls.filter(c => c.status === ComplianceStatus.RED);
      expect(redControls.length).toBeGreaterThanOrEqual(3);

      // AI reasoning still works
      const reasoning = agent.generateReasoning(result);
      expect(reasoning.confidence).toBe('HIGH');
      expect(reasoning.remediation.length).toBeGreaterThan(0);

      // Audit still works
      const entry = audit.record('multi-failure', result);
      expect(entry.entryHash).toBeDefined();
    });
  });

  describe('privacy enforcement', () => {
    it('should never expose raw values in evidence hash', () => {
      const result = engine.evaluate(greenInput, true);
      expect(result.evidenceHash).not.toContain('105000000');
      expect(result.evidenceHash).not.toContain('100000000');
    });

    it('should never expose raw values in audit entries', () => {
      const result = engine.evaluate(greenInput, true);
      const entry = audit.record('privacy-test', result);
      const json = JSON.stringify(entry);

      expect(json).not.toContain('105000000');
      expect(json).not.toContain('100000000');
      expect(json).not.toContain('T-Bills');
    });

    it('should only expose safe data in AI reasoning output', () => {
      const result = engine.evaluate(greenInput, true);
      const reasoning = agent.generateReasoning(result);
      const json = JSON.stringify(reasoning);

      expect(json).not.toContain('105000000');
      expect(json).not.toContain('100000000');
    });
  });
});
