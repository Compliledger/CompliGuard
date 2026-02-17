export type ComplianceStatusType = 'GREEN' | 'YELLOW' | 'RED';

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
  status: ComplianceStatusType;
  timestamp: string;
  policyVersion: string;
  evidenceHash: string;
  explanation: string;
  controls: ControlResult[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
