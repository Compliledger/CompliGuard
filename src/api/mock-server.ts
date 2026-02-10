/**
 * Mock API Server
 * 
 * Simulates external regulated APIs for reserves and liabilities.
 * Used for development, testing, and demonstrations.
 */

import express, { Request, Response } from 'express';
import {
  ReserveData,
  LiabilityData,
  Asset,
  AssetRiskLevel,
  ApiResponse
} from '../core/types';
import { sha256 } from '../utils/hash';

const app = express();
app.use(express.json());

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

// API Routes

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
    service: 'mock-api-server',
    timestamp: new Date()
  });
});

// Start server
const PORT = process.env.MOCK_API_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET  /api/reserves     - Get reserve data (requires X-API-Key header)`);
  console.log(`  GET  /api/liabilities  - Get liability data (requires X-API-Key header)`);
  console.log(`  POST /api/simulate     - Update simulation parameters`);
  console.log(`  GET  /api/simulate/state - Get current simulation state`);
  console.log(`  POST /api/simulate/reset - Reset simulation to defaults`);
  console.log(`  GET  /health           - Health check`);
});

export { app };
