/**
 * CompliGuard Demo Script
 * 
 * Demonstrates the compliance enforcement workflow with simulated scenarios.
 */

import { ComplianceEngine, ComplianceStatus, AssetRiskLevel, ReserveData, LiabilityData } from './core';

const engine = new ComplianceEngine();

function createMockData(scenario: string): { reserves: ReserveData; liabilities: LiabilityData } {
  const baseReserves = 100_000_000;
  const baseLiabilities = 100_000_000;

  const scenarios: Record<string, { reserves: ReserveData; liabilities: LiabilityData }> = {
    // Scenario 1: All GREEN - Fully compliant
    green: {
      reserves: {
        totalValue: baseReserves * 1.05,
        assets: [
          { id: '1', name: 'US Treasury Bills', symbol: 'T-BILLS', value: 52_500_000, riskLevel: AssetRiskLevel.SAFE, percentage: 50 },
          { id: '2', name: 'Cash Deposits', symbol: 'CASH', value: 31_500_000, riskLevel: AssetRiskLevel.SAFE, percentage: 30 },
          { id: '3', name: 'Money Market', symbol: 'MMF', value: 21_000_000, riskLevel: AssetRiskLevel.SAFE, percentage: 20 }
        ],
        attestationTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        attestationHash: '0xabc123',
        source: 'demo'
      },
      liabilities: {
        totalValue: baseLiabilities,
        circulatingSupply: baseLiabilities,
        timestamp: new Date(),
        source: 'demo'
      }
    },

    // Scenario 2: YELLOW - Low reserve ratio
    yellow_reserves: {
      reserves: {
        totalValue: baseReserves * 1.01,
        assets: [
          { id: '1', name: 'US Treasury Bills', symbol: 'T-BILLS', value: 50_500_000, riskLevel: AssetRiskLevel.SAFE, percentage: 50 },
          { id: '2', name: 'Cash Deposits', symbol: 'CASH', value: 50_500_000, riskLevel: AssetRiskLevel.SAFE, percentage: 50 }
        ],
        attestationTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        attestationHash: '0xdef456',
        source: 'demo'
      },
      liabilities: {
        totalValue: baseLiabilities,
        circulatingSupply: baseLiabilities,
        timestamp: new Date(),
        source: 'demo'
      }
    },

    // Scenario 3: RED - Undercollateralized
    red_undercollateralized: {
      reserves: {
        totalValue: baseReserves * 0.95,
        assets: [
          { id: '1', name: 'US Treasury Bills', symbol: 'T-BILLS', value: 95_000_000, riskLevel: AssetRiskLevel.SAFE, percentage: 100 }
        ],
        attestationTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        attestationHash: '0xghi789',
        source: 'demo'
      },
      liabilities: {
        totalValue: baseLiabilities,
        circulatingSupply: baseLiabilities,
        timestamp: new Date(),
        source: 'demo'
      }
    },

    // Scenario 4: RED - Stale proof
    red_stale_proof: {
      reserves: {
        totalValue: baseReserves * 1.05,
        assets: [
          { id: '1', name: 'US Treasury Bills', symbol: 'T-BILLS', value: 105_000_000, riskLevel: AssetRiskLevel.SAFE, percentage: 100 }
        ],
        attestationTimestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
        attestationHash: '0xjkl012',
        source: 'demo'
      },
      liabilities: {
        totalValue: baseLiabilities,
        circulatingSupply: baseLiabilities,
        timestamp: new Date(),
        source: 'demo'
      }
    },

    // Scenario 5: RED - Disallowed assets
    red_disallowed_assets: {
      reserves: {
        totalValue: baseReserves * 1.05,
        assets: [
          { id: '1', name: 'US Treasury Bills', symbol: 'T-BILLS', value: 94_500_000, riskLevel: AssetRiskLevel.SAFE, percentage: 90 },
          { id: '2', name: 'Sanctioned Token', symbol: 'SANC', value: 10_500_000, riskLevel: AssetRiskLevel.DISALLOWED, percentage: 10 }
        ],
        attestationTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        attestationHash: '0xmno345',
        source: 'demo'
      },
      liabilities: {
        totalValue: baseLiabilities,
        circulatingSupply: baseLiabilities,
        timestamp: new Date(),
        source: 'demo'
      }
    },

    // Scenario 6: YELLOW - High concentration
    yellow_concentration: {
      reserves: {
        totalValue: baseReserves * 1.05,
        assets: [
          { id: '1', name: 'US Treasury Bills', symbol: 'T-BILLS', value: 84_000_000, riskLevel: AssetRiskLevel.SAFE, percentage: 80 },
          { id: '2', name: 'Cash', symbol: 'CASH', value: 21_000_000, riskLevel: AssetRiskLevel.SAFE, percentage: 20 }
        ],
        attestationTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        attestationHash: '0xpqr678',
        source: 'demo'
      },
      liabilities: {
        totalValue: baseLiabilities,
        circulatingSupply: baseLiabilities,
        timestamp: new Date(),
        source: 'demo'
      }
    }
  };

  return scenarios[scenario] || scenarios.green;
}

function runDemo(): void {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('              🛡️  CompliGuard Demo                              ');
  console.log('     Privacy-Preserving Compliance Enforcement Engine          ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

  const scenarios = [
    { name: 'green', title: '✅ Scenario 1: Fully Compliant (GREEN)' },
    { name: 'yellow_reserves', title: '⚠️  Scenario 2: Low Reserve Ratio (YELLOW)' },
    { name: 'red_undercollateralized', title: '🚨 Scenario 3: Undercollateralized (RED)' },
    { name: 'red_stale_proof', title: '🚨 Scenario 4: Stale Proof (RED)' },
    { name: 'red_disallowed_assets', title: '🚨 Scenario 5: Disallowed Assets (RED)' },
    { name: 'yellow_concentration', title: '⚠️  Scenario 6: High Concentration (YELLOW)' }
  ];

  for (const scenario of scenarios) {
    console.log('───────────────────────────────────────────────────────────────');
    console.log(scenario.title);
    console.log('───────────────────────────────────────────────────────────────');
    
    const data = createMockData(scenario.name);
    const result = engine.evaluate(data);

    console.log('\n' + result.explanation);
    console.log('\n📋 Evidence Hash: ' + result.evidenceHash.substring(0, 32) + '...');
    console.log('📅 Evaluated: ' + result.evaluationTimestamp.toISOString());
    console.log('📜 Policy Version: ' + result.policyVersion);
    console.log('\n');
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                     Demo Complete                              ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');
  console.log('📊 Total Evaluations: ' + engine.getEvaluationHistory().length);
  console.log('\n');
  console.log('Key Takeaways:');
  console.log('  • Compliance is evaluated deterministically');
  console.log('  • Sensitive data (values) never exposed');
  console.log('  • Evidence hash provides auditability');
  console.log('  • Worst-of rule ensures conservative enforcement');
  console.log('\n');
}

runDemo();
