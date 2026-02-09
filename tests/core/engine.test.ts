/**
 * ComplianceEngine Tests
 */

import { 
  ComplianceEngine, 
  ComplianceStatus, 
  AssetRiskLevel,
  ReserveData,
  LiabilityData,
  EvaluationInput
} from '../../src/core';

describe('ComplianceEngine', () => {
  let engine: ComplianceEngine;

  beforeEach(() => {
    engine = new ComplianceEngine();
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
        id: 'risky-1',
        name: 'Corporate Bonds',
        symbol: 'CORP',
        value: reserveValue * (riskyPercentage / 100),
        riskLevel: AssetRiskLevel.RISKY,
        percentage: riskyPercentage
      });
      remaining -= riskyPercentage;
    }

    if (includeDisallowed) {
      const pct = 5;
      assets.push({
        id: 'disallowed-1',
        name: 'Sanctioned',
        symbol: 'SANC',
        value: reserveValue * (pct / 100),
        riskLevel: AssetRiskLevel.DISALLOWED,
        percentage: pct
      });
      remaining -= pct;
    }

    const primaryPct = Math.min(concentrationPercentage, remaining);
    assets.push({
      id: 'safe-1',
      name: 'T-Bills',
      symbol: 'TBILL',
      value: reserveValue * (primaryPct / 100),
      riskLevel: AssetRiskLevel.SAFE,
      percentage: primaryPct
    });
    remaining -= primaryPct;

    if (remaining > 0) {
      assets.push({
        id: 'safe-2',
        name: 'Cash',
        symbol: 'CASH',
        value: reserveValue * (remaining / 100),
        riskLevel: AssetRiskLevel.SAFE,
        percentage: remaining
      });
    }

    const reserves: ReserveData = {
      totalValue: reserveValue,
      assets,
      attestationTimestamp: attestationTime,
      attestationHash: '0xtest',
      source: 'test'
    };

    const liabilities: LiabilityData = {
      totalValue: baseValue,
      circulatingSupply: baseValue,
      timestamp: new Date(),
      source: 'test'
    };

    return { reserves, liabilities };
  };

  describe('evaluate', () => {
    it('should return GREEN when all controls pass', () => {
      const input = createInput();
      const result = engine.evaluate(input, true);

      expect(result.overallStatus).toBe(ComplianceStatus.GREEN);
      expect(result.controls).toHaveLength(4);
      expect(result.evidenceHash).toBeDefined();
      expect(result.explanation).toContain('GREEN');
    });

    it('should return YELLOW for low reserve ratio (1.00-1.019)', () => {
      const input = createInput({ reserveMultiplier: 1.01 });
      const result = engine.evaluate(input, true);

      expect(result.overallStatus).toBe(ComplianceStatus.YELLOW);
      const ratioControl = result.controls.find(c => c.controlType === 'RESERVE_RATIO');
      expect(ratioControl?.status).toBe(ComplianceStatus.YELLOW);
    });

    it('should return RED for undercollateralization (<1.00)', () => {
      const input = createInput({ reserveMultiplier: 0.95 });
      const result = engine.evaluate(input, true);

      expect(result.overallStatus).toBe(ComplianceStatus.RED);
      const ratioControl = result.controls.find(c => c.controlType === 'RESERVE_RATIO');
      expect(ratioControl?.status).toBe(ComplianceStatus.RED);
    });

    it('should return RED for stale proof (>24 hours)', () => {
      const input = createInput({ attestationHoursAgo: 48 });
      const result = engine.evaluate(input, true);

      expect(result.overallStatus).toBe(ComplianceStatus.RED);
      const freshnessControl = result.controls.find(c => c.controlType === 'PROOF_FRESHNESS');
      expect(freshnessControl?.status).toBe(ComplianceStatus.RED);
    });

    it('should return RED for disallowed assets', () => {
      const input = createInput({ includeDisallowed: true });
      const result = engine.evaluate(input, true);

      expect(result.overallStatus).toBe(ComplianceStatus.RED);
      const qualityControl = result.controls.find(c => c.controlType === 'ASSET_QUALITY');
      expect(qualityControl?.status).toBe(ComplianceStatus.RED);
    });

    it('should return RED for excessive risky assets (>30%)', () => {
      const input = createInput({ riskyPercentage: 40 });
      const result = engine.evaluate(input, true);

      expect(result.overallStatus).toBe(ComplianceStatus.RED);
      const qualityControl = result.controls.find(c => c.controlType === 'ASSET_QUALITY');
      expect(qualityControl?.status).toBe(ComplianceStatus.RED);
    });

    it('should return YELLOW for high concentration (>75%)', () => {
      const input = createInput({ concentrationPercentage: 80, riskyPercentage: 0 });
      const result = engine.evaluate(input, true);

      expect(result.overallStatus).toBe(ComplianceStatus.YELLOW);
      const concControl = result.controls.find(c => c.controlType === 'ASSET_CONCENTRATION');
      expect(concControl?.status).toBe(ComplianceStatus.YELLOW);
    });

    it('should apply worst-of aggregation', () => {
      // Multiple issues: YELLOW reserves + RED stale proof = RED overall
      const input = createInput({ 
        reserveMultiplier: 1.01, 
        attestationHoursAgo: 48 
      });
      const result = engine.evaluate(input, true);

      expect(result.overallStatus).toBe(ComplianceStatus.RED);
    });
  });

  describe('evidence', () => {
    it('should generate unique evidence hashes', () => {
      const input1 = createInput({ reserveMultiplier: 1.05 });
      const input2 = createInput({ reserveMultiplier: 1.06 });

      const result1 = engine.evaluate(input1, true);
      const result2 = engine.evaluate(input2, true);

      expect(result1.evidenceHash).not.toBe(result2.evidenceHash);
    });

    it('should record evaluation history', () => {
      const input = createInput();
      engine.evaluate(input, true);
      engine.evaluate(input, true);

      const history = engine.getEvaluationHistory();
      expect(history).toHaveLength(2);
    });
  });
});
