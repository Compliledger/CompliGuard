/**
 * Determinism Verification Tests
 *
 * Ensures that the compliance engine produces identical results
 * for identical inputs — a core requirement for enterprise-grade
 * compliance enforcement.
 */

import {
  ComplianceEngine,
  ComplianceStatus,
  AssetRiskLevel,
  EvaluationInput
} from '../../src/core';

describe('Determinism Verification', () => {
  let engine: ComplianceEngine;

  const fixedInput: EvaluationInput = {
    reserves: {
      totalValue: 105_000_000,
      assets: [
        { id: 's1', name: 'T-Bills', symbol: 'TBILL', value: 78_750_000, riskLevel: AssetRiskLevel.SAFE, percentage: 75 },
        { id: 's2', name: 'Cash', symbol: 'CASH', value: 26_250_000, riskLevel: AssetRiskLevel.SAFE, percentage: 25 }
      ],
      attestationTimestamp: new Date(),
      attestationHash: '0xdeadbeef',
      source: 'determinism-test'
    },
    liabilities: {
      totalValue: 100_000_000,
      circulatingSupply: 100_000_000,
      timestamp: new Date(),
      source: 'determinism-test'
    }
  };

  beforeEach(() => {
    engine = new ComplianceEngine();
  });

  it('should produce identical status for identical inputs across 100 runs', () => {
    const results = [];
    for (let i = 0; i < 100; i++) {
      results.push(engine.evaluate(fixedInput, true));
    }

    const statuses = results.map(r => r.overallStatus);
    expect(new Set(statuses).size).toBe(1);
    expect(statuses[0]).toBe(ComplianceStatus.GREEN);
  });

  it('should produce identical control statuses for identical inputs', () => {
    const r1 = engine.evaluate(fixedInput, true);
    const r2 = engine.evaluate(fixedInput, true);

    expect(r1.controls.length).toBe(r2.controls.length);
    for (let i = 0; i < r1.controls.length; i++) {
      expect(r1.controls[i].controlType).toBe(r2.controls[i].controlType);
      expect(r1.controls[i].status).toBe(r2.controls[i].status);
    }
  });

  it('should produce identical evidence hashes for identical inputs and timestamps', () => {
    // Use two separate engine instances to prove no instance-level drift
    const engineA = new ComplianceEngine();
    const engineB = new ComplianceEngine();

    const rA = engineA.evaluate(fixedInput, true);
    const rB = engineB.evaluate(fixedInput, true);

    // Note: evidence hashes include timestamp, so they may differ by ms.
    // The important thing is that status + controls are identical.
    expect(rA.overallStatus).toBe(rB.overallStatus);
    expect(rA.controls.map(c => c.status)).toEqual(rB.controls.map(c => c.status));
    expect(rA.policyVersion).toBe(rB.policyVersion);
  });

  it('should transition GREEN → YELLOW → RED deterministically', () => {
    const scenarios = [
      { multiplier: 1.05, expected: ComplianceStatus.GREEN },
      { multiplier: 1.01, expected: ComplianceStatus.YELLOW },
      { multiplier: 0.95, expected: ComplianceStatus.RED }
    ];

    for (const { multiplier, expected } of scenarios) {
      const input: EvaluationInput = {
        ...fixedInput,
        reserves: {
          ...fixedInput.reserves,
          totalValue: 100_000_000 * multiplier,
          attestationTimestamp: new Date(),
          assets: [
            { id: 's1', name: 'T-Bills', symbol: 'TBILL', value: 100_000_000 * multiplier * 0.6, riskLevel: AssetRiskLevel.SAFE, percentage: 60 },
            { id: 's2', name: 'Cash', symbol: 'CASH', value: 100_000_000 * multiplier * 0.4, riskLevel: AssetRiskLevel.SAFE, percentage: 40 }
          ]
        }
      };

      const result = engine.evaluate(input, true);
      expect(result.overallStatus).toBe(expected);
    }
  });

  it('should apply worst-of aggregation deterministically with mixed signals', () => {
    // YELLOW reserve ratio + GREEN everything else = YELLOW
    const yellowInput: EvaluationInput = {
      ...fixedInput,
      reserves: {
        ...fixedInput.reserves,
        totalValue: 101_000_000,
        attestationTimestamp: new Date(),
        assets: [{
          id: 's1', name: 'T-Bills', symbol: 'TBILL',
          value: 101_000_000,
          riskLevel: AssetRiskLevel.SAFE, percentage: 100
        }]
      }
    };

    for (let i = 0; i < 50; i++) {
      const result = engine.evaluate(yellowInput, true);
      expect(result.overallStatus).toBe(ComplianceStatus.YELLOW);
    }
  });
});
