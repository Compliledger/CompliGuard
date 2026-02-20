import { ComplianceStatus, ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function fetchComplianceStatus(): Promise<ComplianceStatus> {
  const response = await fetch(`${API_BASE_URL}/api/compliance/status`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const result: ApiResponse<ComplianceStatus> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Unknown API error');
  }
  return result.data;
}

export async function fetchComplianceHistory(limit = 20): Promise<ComplianceStatus[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/compliance/history?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result: ApiResponse<ComplianceStatus[]> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Unknown API error');
    }
    return result.data;
  } catch (err) {
    console.warn('History API unavailable:', err);
    return [];
  }
}

export async function switchScenario(scenario: 'healthy' | 'at_risk' | 'non_compliant'): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/simulate/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  } catch (err) {
    console.warn('Scenario switch failed:', err);
  }
}

// ─── Run Compliance Check (single-button for judge demo) ────────

export interface RunResult {
  status: string;
  reserveRatio: number;
  reserveValue: number;
  liabilityValue: number;
  evidenceHash: string;
  policyVersion: string;
  checkedAt: string;
  txHash?: string;
  realTx?: boolean;
}

export async function runComplianceCheck(anchor = false): Promise<RunResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anchor }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const result = await response.json();
    return result.data || result;
  } catch (err) {
    console.error('Run compliance check failed:', err);
    return null;
  }
}

// ─── NEW: Custom Simulation Parameters ──────────────────────────

export interface SimulationState {
  reserveMultiplier: number;
  attestationAgeHours: number;
  includeDisallowedAsset: boolean;
  riskyAssetPercentage: number;
  concentrationPercentage: number;
}

export async function getSimulationState(): Promise<SimulationState | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/simulate/state`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const result = await response.json();
    return result.state || null;
  } catch (err) {
    console.warn('Get simulation state failed:', err);
    return null;
  }
}

export async function updateSimulation(params: Partial<SimulationState>): Promise<SimulationState | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const result = await response.json();
    return result.state || null;
  } catch (err) {
    console.warn('Update simulation failed:', err);
    return null;
  }
}

export async function resetSimulation(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/simulate/reset`, { method: 'POST' });
  } catch (err) {
    console.warn('Reset simulation failed:', err);
  }
}

// ─── NEW: On-Chain Hash Verification ────────────────────────────

export interface VerifyResult {
  evidenceHash: string;
  existsOnChain: boolean;
  contract: string;
  verifyUrl: string;
}

export async function verifyEvidenceHash(hash: string): Promise<VerifyResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/onchain/verify/${encodeURIComponent(hash)}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const result = await response.json();
    return result.data || null;
  } catch (err) {
    console.warn('Hash verification failed:', err);
    return null;
  }
}

// ─── NEW: On-Chain Reports List ─────────────────────────────────

export async function fetchOnChainReports(limit = 10): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/onchain/reports?limit=${limit}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const result = await response.json();
    return result.data || [];
  } catch (err) {
    console.warn('On-chain reports fetch failed:', err);
    return [];
  }
}
