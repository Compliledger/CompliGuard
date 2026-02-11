/**
 * AI Reasoning Agent Tests
 */

import {
  AIReasoningAgent,
  ComplianceEngine,
  ComplianceStatus,
  AssetRiskLevel,
  EvaluationInput
} from '../../src/core';

describe('AIReasoningAgent', () => {
  let engine: ComplianceEngine;
  let agent: AIReasoningAgent;

  beforeEach(() => {
    engine = new ComplianceEngine();
    agent = new AIReasoningAgent();
  });

  const createInput = (overrides: Partial<{
    reserveMultiplier: number;
    attestationHoursAgo: number;
    includeDisallowed: boolean;
    riskyPercentage: number;
    concentrationPercentage: number;
  }> = {}): EvaluationInput => {
    const {
      reserveMultiplier = 1.05,
      attestationHoursAgo = 2,
      includeDisallowed = false,
      riskyPercentage = 15,
      concentrationPercentage = 50
    } = overrides;

    const baseValue = 100_000_000;
    const reserveValue = baseValue * reserveMultiplier;
    const attestationTime = new Date();
    attestationTime.setHours(attestationTime.getHours() - attestationHoursAgo);

    const assets = [];
    let remaining = 100;

    if (riskyPercentage > 0) {
      assets.push({
        id: 'risky-1', name: 'Corporate Bonds', symbol: 'CORP',
        value: reserveValue * (riskyPercentage / 100),
        riskLevel: AssetRiskLevel.RISKY, percentage: riskyPercentage
      });
      remaining -= riskyPercentage;
    }

    if (includeDisallowed) {
      assets.push({
        id: 'disallowed-1', name: 'Restricted Asset', symbol: 'RESTRICTED',
        value: reserveValue * 0.05,
        riskLevel: AssetRiskLevel.DISALLOWED, percentage: 5
      });
      remaining -= 5;
    }

    const primaryPct = Math.min(concentrationPercentage, remaining);
    assets.push({
      id: 'safe-1', name: 'US Treasury Bills', symbol: 'T-BILLS',
      value: reserveValue * (primaryPct / 100),
      riskLevel: AssetRiskLevel.SAFE, percentage: primaryPct
    });
    remaining -= primaryPct;

    if (remaining > 0) {
      assets.push({
        id: 'safe-2', name: 'Cash', symbol: 'CASH',
        value: reserveValue * (remaining / 100),
        riskLevel: AssetRiskLevel.SAFE, percentage: remaining
      });
    }

    return {
      reserves: {
        totalValue: reserveValue,
        assets,
        attestationTimestamp: attestationTime,
        attestationHash: '0xabc123',
        source: 'test'
      },
      liabilities: {
        totalValue: baseValue,
        circulatingSupply: baseValue,
        timestamp: new Date(),
        source: 'test'
      }
    };
  };

  describe('generateReasoning', () => {
    it('should produce HIGH confidence reasoning for GREEN result', () => {
      const input = createInput();
      const result = engine.evaluate(input, true);
      const reasoning = agent.generateReasoning(result);

      expect(reasoning.confidence).toBe('HIGH');
      expect(reasoning.summary).toContain('COMPLIANT');
      expect(reasoning.controlAnalysis).toHaveLength(4);
      expect(reasoning.remediation).toHaveLength(0);
      expect(reasoning.regulatoryContext).toContain('GENIUS Act');
    });

    it('should produce remediation for YELLOW result', () => {
      const input = createInput({ reserveMultiplier: 1.01 });
      const result = engine.evaluate(input, true);
      const reasoning = agent.generateReasoning(result);

      expect(reasoning.summary).toContain('AT RISK');
      expect(reasoning.remediation.length).toBeGreaterThan(0);
    });

    it('should produce CRITICAL findings for RED result', () => {
      const input = createInput({ reserveMultiplier: 0.95 });
      const result = engine.evaluate(input, true);
      const reasoning = agent.generateReasoning(result);

      expect(reasoning.summary).toContain('NON-COMPLIANT');
      const critical = reasoning.controlAnalysis.filter(a => a.severity === 'CRITICAL');
      expect(critical.length).toBeGreaterThan(0);
      expect(reasoning.regulatoryContext).toContain('compliance violation');
    });

    it('should never modify the compliance status', () => {
      const input = createInput({ reserveMultiplier: 0.95 });
      const result = engine.evaluate(input, true);
      const reasoning = agent.generateReasoning(result);

      // AI cannot change the overall status
      const statuses = reasoning.controlAnalysis.map(a => a.status);
      const engineStatuses = result.controls.map(c => c.status);
      expect(statuses).toEqual(engineStatuses);
    });
  });

  describe('graceful degradation', () => {
    it('should return fallback reasoning when disabled', () => {
      const disabledAgent = new AIReasoningAgent({ enabled: false });
      const input = createInput();
      const result = engine.evaluate(input, true);
      const reasoning = disabledAgent.generateReasoning(result);

      expect(reasoning.confidence).toBe('LOW');
      expect(reasoning.summary).toContain('fallback');
    });
  });

  describe('generateExplanation', () => {
    it('should produce a string explanation', () => {
      const input = createInput();
      const result = engine.evaluate(input, true);
      const explanation = agent.generateExplanation(result);

      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
      expect(explanation).toContain('Control Analysis');
    });

    it('should respect maxLength config', () => {
      const shortAgent = new AIReasoningAgent({ maxLength: 100 });
      const input = createInput({ reserveMultiplier: 0.95 });
      const result = engine.evaluate(input, true);
      const explanation = shortAgent.generateExplanation(result);

      expect(explanation.length).toBeLessThanOrEqual(100);
    });
  });
});
