/**
 * Mock API Server
 * 
 * Simulates external regulated APIs for reserves and liabilities.
 * Used for development, testing, and demonstrations.
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  ReserveData,
  LiabilityData,
  Asset,
  AssetRiskLevel,
  ApiResponse,
  ComplianceStatus,
  ComplianceResult
} from '../core/types';
import { ComplianceEngine, EvaluationInput } from '../core';
import { AIReasoningAgent } from '../core/ai-reasoning';
import { sha256 } from '../utils/hash';

const app = express();
app.use(express.json());
app.use(cors());

// Shared engine + AI agent for status endpoint
const engine = new ComplianceEngine();
const aiAgent = new AIReasoningAgent();

// In-memory state for simulation
let mockState = {
  reserveMultiplier: 1.05,
  attestationAgeHours: 2,
  includeDisallowedAsset: false,
  riskyAssetPercentage: 15,
  concentrationPercentage: 50
};

/**
 * Generate mock reserve data based on current state
 */
function generateReserveData(): ReserveData {
  const baseValue = 100_000_000; // $100M base
  const totalValue = baseValue * mockState.reserveMultiplier;

  const assets: Asset[] = [];
  let remainingPercentage = 100;

  // Add risky assets if configured
  if (mockState.riskyAssetPercentage > 0) {
    assets.push({
      id: 'risky-1',
      name: 'Corporate Bonds',
      symbol: 'CORP_BONDS',
      value: totalValue * (mockState.riskyAssetPercentage / 100),
      riskLevel: AssetRiskLevel.RISKY,
      percentage: mockState.riskyAssetPercentage
    });
    remainingPercentage -= mockState.riskyAssetPercentage;
  }

  // Add disallowed asset if configured
  if (mockState.includeDisallowedAsset) {
    const disallowedPct = 5;
    assets.push({
      id: 'disallowed-1',
      name: 'Restricted Asset (Demo)',
      symbol: 'RESTRICTED_ASSET',
      value: totalValue * (disallowedPct / 100),
      riskLevel: AssetRiskLevel.DISALLOWED,
      percentage: disallowedPct
    });
    remainingPercentage -= disallowedPct;
  }

  // Primary safe asset (concentration)
  const primaryPct = Math.min(mockState.concentrationPercentage, remainingPercentage);
  assets.push({
    id: 'safe-1',
    name: 'US Treasury Bills',
    symbol: 'T-BILLS',
    value: totalValue * (primaryPct / 100),
    riskLevel: AssetRiskLevel.SAFE,
    percentage: primaryPct
  });
  remainingPercentage -= primaryPct;

  // Secondary safe assets
  if (remainingPercentage > 0) {
    const halfRemaining = remainingPercentage / 2;
    assets.push({
      id: 'safe-2',
      name: 'Cash Deposits',
      symbol: 'CASH',
      value: totalValue * (halfRemaining / 100),
      riskLevel: AssetRiskLevel.SAFE,
      percentage: halfRemaining
    });
    assets.push({
      id: 'safe-3',
      name: 'Money Market Funds',
      symbol: 'MMF',
      value: totalValue * (halfRemaining / 100),
      riskLevel: AssetRiskLevel.SAFE,
      percentage: halfRemaining
    });
  }

  const attestationTime = new Date();
  attestationTime.setHours(attestationTime.getHours() - mockState.attestationAgeHours);

  const hashInput = {
    totalValue,
    assets: assets.map(a => ({ symbol: a.symbol, pct: a.percentage })),
    attestationAgeHours: mockState.attestationAgeHours,
    includeDisallowedAsset: mockState.includeDisallowedAsset,
    riskyAssetPercentage: mockState.riskyAssetPercentage,
    concentrationPercentage: mockState.concentrationPercentage
  };

  return {
    totalValue,
    assets,
    attestationTimestamp: attestationTime,
    attestationHash: `0x${sha256(hashInput).substring(0, 64)}`,
    source: 'mock-reserve-api'
  };
}

/**
 * Generate mock liability data
 */
function generateLiabilityData(): LiabilityData {
  const totalValue = 100_000_000; // $100M liabilities (tokens in circulation)

  return {
    totalValue,
    circulatingSupply: totalValue,
    timestamp: new Date(),
    source: 'mock-liability-api'
  };
}

// ─── Compliance evaluation history (for frontend) ────────────────────────────
const complianceHistory: Array<{
  timestamp: string;
  status: ComplianceStatus;
  evidenceHash: string;
  policyVersion: string;
  explanation: string;
  controls: ComplianceResult['controls'];
}> = [];

// ─── API Routes ──────────────────────────────────────────────────────────────

/**
 * GET /attestation/latest
 * Plan.md M1 format — unified attestation endpoint
 */
app.get('/attestation/latest', (req: Request, res: Response) => {
  const reserves = generateReserveData();
  const liabilities = generateLiabilityData();

  const attestation = {
    issuer: 'CompliGuard Mock Attestor',
    attestationId: `att-${Date.now()}`,
    lastAttestedAt: reserves.attestationTimestamp.getTime(),
    reservesUsd: reserves.totalValue,
    liabilitiesUsd: liabilities.totalValue,
    composition: reserves.assets.map(a => ({
      asset: a.symbol,
      amountUsd: a.value,
      risk: a.riskLevel
    }))
  };

  res.json(attestation);
});

/**
 * GET /api/compliance/status
 * Returns the current compliance evaluation result.
 * This is the primary endpoint consumed by the frontend dashboard.
 */
app.get('/api/compliance/status', (req: Request, res: Response) => {
  try {
    const reserves = generateReserveData();
    const liabilities = generateLiabilityData();
    const input: EvaluationInput = { reserves, liabilities };
    const result = engine.evaluate(input);
    const reasoning = aiAgent.generateReasoning(result);

    const entry = {
      timestamp: result.evaluationTimestamp.toISOString(),
      status: result.overallStatus,
      evidenceHash: result.evidenceHash,
      policyVersion: result.policyVersion,
      explanation: reasoning.summary,
      controls: result.controls
    };

    // Keep last 50 entries
    complianceHistory.unshift(entry);
    if (complianceHistory.length > 50) complianceHistory.pop();

    res.json({
      success: true,
      data: entry,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/compliance/history
 * Returns the last N compliance evaluations for the frontend timeline.
 */
app.get('/api/compliance/history', (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  res.json({
    success: true,
    data: complianceHistory.slice(0, limit),
    timestamp: new Date()
  });
});

/**
 * POST /api/simulate/scenario
 * Switch to a named demo scenario (for video recording).
 */
app.post('/api/simulate/scenario', (req: Request, res: Response) => {
  const { scenario } = req.body;
  const scenarios: Record<string, typeof mockState> = {
    healthy: {
      reserveMultiplier: 1.05,
      attestationAgeHours: 2,
      includeDisallowedAsset: false,
      riskyAssetPercentage: 15,
      concentrationPercentage: 50
    },
    at_risk: {
      reserveMultiplier: 1.01,
      attestationAgeHours: 10,
      includeDisallowedAsset: false,
      riskyAssetPercentage: 25,
      concentrationPercentage: 78
    },
    non_compliant: {
      reserveMultiplier: 0.95,
      attestationAgeHours: 30,
      includeDisallowedAsset: true,
      riskyAssetPercentage: 40,
      concentrationPercentage: 85
    }
  };

  if (!scenario || !scenarios[scenario]) {
    res.status(400).json({
      success: false,
      error: `Invalid scenario. Choose: ${Object.keys(scenarios).join(', ')}`,
      timestamp: new Date()
    });
    return;
  }

  mockState = { ...scenarios[scenario] };
  res.json({
    success: true,
    scenario,
    state: mockState,
    timestamp: new Date()
  });
});

/**
 * GET /api/reserves
 * Returns current reserve data
 */
app.get('/api/reserves', (req: Request, res: Response) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Missing API key',
      timestamp: new Date()
    };
    res.status(401).json(response);
    return;
  }

  const data = generateReserveData();
  const response: ApiResponse<ReserveData> = {
    success: true,
    data,
    timestamp: new Date()
  };
  
  res.json(response);
});

/**
 * GET /api/liabilities
 * Returns current liability data
 */
app.get('/api/liabilities', (req: Request, res: Response) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Missing API key',
      timestamp: new Date()
    };
    res.status(401).json(response);
    return;
  }

  const data = generateLiabilityData();
  const response: ApiResponse<LiabilityData> = {
    success: true,
    data,
    timestamp: new Date()
  };
  
  res.json(response);
});

/**
 * POST /api/simulate
 * Update simulation parameters for demo purposes
 */
app.post('/api/simulate', (req: Request, res: Response) => {
  const {
    reserveMultiplier,
    attestationAgeHours,
    includeDisallowedAsset,
    riskyAssetPercentage,
    concentrationPercentage
  } = req.body;

  if (reserveMultiplier !== undefined) {
    mockState.reserveMultiplier = reserveMultiplier;
  }
  if (attestationAgeHours !== undefined) {
    mockState.attestationAgeHours = attestationAgeHours;
  }
  if (includeDisallowedAsset !== undefined) {
    mockState.includeDisallowedAsset = includeDisallowedAsset;
  }
  if (riskyAssetPercentage !== undefined) {
    mockState.riskyAssetPercentage = Math.min(100, Math.max(0, riskyAssetPercentage));
  }
  if (concentrationPercentage !== undefined) {
    mockState.concentrationPercentage = Math.min(100, Math.max(0, concentrationPercentage));
  }

  res.json({
    success: true,
    state: mockState,
    timestamp: new Date()
  });
});

/**
 * GET /api/simulate/state
 * Get current simulation state
 */
app.get('/api/simulate/state', (req: Request, res: Response) => {
  res.json({
    success: true,
    state: mockState,
    timestamp: new Date()
  });
});

/**
 * POST /api/simulate/reset
 * Reset simulation to default state
 */
app.post('/api/simulate/reset', (req: Request, res: Response) => {
  mockState = {
    reserveMultiplier: 1.05,
    attestationAgeHours: 2,
    includeDisallowedAsset: false,
    riskyAssetPercentage: 15,
    concentrationPercentage: 50
  };

  res.json({
    success: true,
    state: mockState,
    message: 'Simulation reset to default state',
    timestamp: new Date()
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'compli-guard-api',
    timestamp: new Date()
  });
});

// ─── ON-CHAIN ENDPOINTS (REAL BLOCKCHAIN DATA) ──────────────────────────────

import * as onchain from './onchain-reader';

/**
 * GET /api/onchain/summary
 * Get on-chain contract summary with latest report
 */
app.get('/api/onchain/summary', async (req: Request, res: Response) => {
  try {
    const summary = await onchain.getOnChainSummary();
    res.json({
      success: true,
      data: summary,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read from blockchain',
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/onchain/reports
 * Get recent reports from on-chain (real blockchain data)
 */
app.get('/api/onchain/reports', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const reports = await onchain.getRecentReports(limit);
    res.json({
      success: true,
      data: reports,
      count: reports.length,
      contract: onchain.CONTRACT_INFO,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read from blockchain',
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/onchain/latest
 * Get latest report from on-chain (real blockchain data)
 */
app.get('/api/onchain/latest', async (req: Request, res: Response) => {
  try {
    const report = await onchain.getLatestReport();
    const count = await onchain.getReportCount();
    res.json({
      success: true,
      data: report,
      totalReports: count,
      contract: onchain.CONTRACT_INFO,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read from blockchain',
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/onchain/verify/:hash
 * Verify if a specific evidence hash exists on-chain
 */
app.get('/api/onchain/verify/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    const exists = await onchain.hasReport(hash);
    res.json({
      success: true,
      data: {
        evidenceHash: hash,
        existsOnChain: exists,
        contract: onchain.CONTRACT_INFO.address,
        verifyUrl: `https://sepolia.etherscan.io/address/${onchain.CONTRACT_INFO.address}#readContract`
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify on blockchain',
      timestamp: new Date()
    });
  }
});

// Start server
const PORT = process.env.PORT || process.env.MOCK_API_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 CompliGuard API Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  ─── Compliance Engine ───────────────────────────────────');
  console.log(`  GET  /api/compliance/status   - Current compliance result`);
  console.log(`  GET  /api/compliance/history  - Compliance evaluation history`);
  console.log(`  POST /api/simulate/scenario   - Switch scenario (healthy|at_risk|non_compliant)`);
  console.log('  ─── On-Chain (REAL Blockchain) ──────────────────────────');
  console.log(`  GET  /api/onchain/summary     - Contract summary + latest report`);
  console.log(`  GET  /api/onchain/latest      - Latest on-chain report`);
  console.log(`  GET  /api/onchain/reports     - Recent on-chain reports`);
  console.log(`  GET  /api/onchain/verify/:hash - Verify evidence hash exists`);
  console.log('  ─── Data APIs ───────────────────────────────────────────');
  console.log(`  GET  /api/reserves            - Reserve data (requires X-API-Key)`);
  console.log(`  GET  /api/liabilities         - Liability data (requires X-API-Key)`);
  console.log(`  GET  /health                  - Health check`);
  console.log('');
  console.log(`📜 Contract: 0xf9BaAE04C412c23BC750E79C84A19692708E71b9 (Sepolia)`);
});

export { app };
