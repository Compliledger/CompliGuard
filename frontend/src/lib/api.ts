import { ComplianceStatus, ApiResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Mock data for development/demo when API is unavailable
const mockStatus: ComplianceStatus = {
  status: 'GREEN',
  explanation: 'CompliGuard Assessment: COMPLIANT. Reserve ratio is 1.05 (healthy). All 4 compliance controls passed. Last attestation was 2 hours ago.',
  timestamp: new Date().toISOString(),
  policyVersion: '1.0.0',
  evidenceHash: '0xabc123def456789012345678901234567890abcdef1234567890abcdef123456',
  controls: [
    { controlType: 'RESERVE_RATIO', status: 'GREEN', value: 1.05, threshold: 1.02, message: 'Reserve ratio 1.050 >= 1.02 threshold', timestamp: new Date().toISOString() },
    { controlType: 'PROOF_FRESHNESS', status: 'GREEN', value: 2, threshold: 6, message: 'Attestation age 2.0h <= 6h threshold', timestamp: new Date().toISOString() },
    { controlType: 'ASSET_QUALITY', status: 'GREEN', value: 15, threshold: 30, message: 'Risky assets at 15.0%, below 30% threshold', timestamp: new Date().toISOString() },
    { controlType: 'ASSET_CONCENTRATION', status: 'GREEN', value: 50, threshold: 75, message: 'Max concentration 50.0%, below 75% threshold', timestamp: new Date().toISOString() },
  ],
};

export async function fetchComplianceStatus(): Promise<ComplianceStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/compliance/status`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result: ApiResponse<ComplianceStatus> = await response.json();
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Unknown API error');
    }
    return result.data;
  } catch (err) {
    console.warn('API unavailable, using mock data:', err);
    return { ...mockStatus, timestamp: new Date().toISOString() };
  }
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
