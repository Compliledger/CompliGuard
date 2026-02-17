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
    // Fallback to mock data if API is unavailable
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
