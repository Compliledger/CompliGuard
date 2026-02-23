export type ComplianceStatusType = 'GREEN' | 'YELLOW' | 'RED';
export type OverallStatusType = 'HEALTHY' | 'AT_RISK' | 'NON_COMPLIANT';

export type ControlType =
  | 'RESERVE_RATIO'
  | 'PROOF_FRESHNESS'
  | 'ASSET_QUALITY'
  | 'ASSET_CONCENTRATION';

export interface ControlResult {
  controlType: ControlType;
  status: ComplianceStatusType;
  value?: number;
  threshold?: number;
  message: string;
  timestamp: string;
}

export interface ComplianceStatus {
  status: ComplianceStatusType | OverallStatusType;
  timestamp: string;
  policyVersion: string;
  evidenceHash: string;
  explanation: string;
  controls: ControlResult[];
}

/** Map overall status labels back to traffic-light colors for UI rendering */
export function toTrafficLight(status: string): ComplianceStatusType {
  if (status === 'HEALTHY' || status === 'GREEN') return 'GREEN';
  if (status === 'AT_RISK' || status === 'YELLOW') return 'YELLOW';
  if (status === 'NON_COMPLIANT' || status === 'RED') return 'RED';
  return 'GREEN';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
