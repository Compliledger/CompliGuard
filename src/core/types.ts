/**
 * CompliGuard Core Type Definitions
 * 
 * Defines all types used throughout the compliance enforcement engine.
 */

/** Compliance status levels following traffic-light pattern */
export enum ComplianceStatus {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED'
}

/** Types of compliance controls enforced by the engine */
export enum ControlType {
  RESERVE_RATIO = 'RESERVE_RATIO',
  PROOF_FRESHNESS = 'PROOF_FRESHNESS',
  ASSET_QUALITY = 'ASSET_QUALITY',
  ASSET_CONCENTRATION = 'ASSET_CONCENTRATION'
}

/** Asset risk classification */
export enum AssetRiskLevel {
  SAFE = 'SAFE',
  RISKY = 'RISKY',
  DISALLOWED = 'DISALLOWED'
}

/** Individual asset in a reserve portfolio */
export interface Asset {
  id: string;
  name: string;
  symbol: string;
  value: number;
  riskLevel: AssetRiskLevel;
  percentage: number;
}

/** Reserve data from external API */
export interface ReserveData {
  totalValue: number;
  assets: Asset[];
  attestationTimestamp: Date;
  attestationHash: string;
  source: string;
}

/** Liability data from external API */
export interface LiabilityData {
  totalValue: number;
  circulatingSupply: number;
  timestamp: Date;
  source: string;
}

/** Result of evaluating a single control */
export interface ControlResult {
  controlType: ControlType;
  status: ComplianceStatus;
  value?: number;
  threshold?: number;
  message: string;
  timestamp: Date;
}

/** Complete compliance evaluation result */
export interface ComplianceResult {
  overallStatus: ComplianceStatus;
  controls: ControlResult[];
  policyVersion: string;
  evaluationTimestamp: Date;
  evidenceHash: string;
  explanation: string;
}

/** Overall compliance label (mapped from internal GREEN/YELLOW/RED) */
export type OverallComplianceLabel = 'HEALTHY' | 'AT_RISK' | 'NON_COMPLIANT';

/** Configuration for the policy engine */
export interface PolicyConfig {
  version: string;

  reserveRatio: {
    greenThreshold: number;   // >= this → GREEN
    yellowThreshold: number;  // >= this && < green → YELLOW; < this → RED
  };

  proofFreshness: {
    greenMaxAgeHours: number;   // <= this → GREEN
    yellowMaxAgeHours: number;  // <= this → YELLOW; > this → RED
  };

  assetQuality: {
    restrictedAssetLevels: string[]; // any asset with riskLevel in this list → RED
  };

  assetConcentration: {
    greenMaxPercentage: number;   // <= this → GREEN
    yellowMaxPercentage: number;  // <= this → YELLOW; > this → RED
  };
}

/** Input data for compliance evaluation */
export interface EvaluationInput {
  reserves: ReserveData;
  liabilities: LiabilityData;
}

/** Evidence record for audit trail */
export interface EvidenceRecord {
  evaluationId: string;
  timestamp: Date;
  inputHash: string;
  resultHash: string;
  policyVersion: string;
  controlResults: ControlResult[];
}

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

/** Health check response */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  lastEvaluation?: Date;
  components: {
    policyEngine: boolean;
    reserveApi: boolean;
    liabilityApi: boolean;
  };
}

/** Default policy configuration — single source of truth for all thresholds */
export const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  version: '1.0.0',

  reserveRatio: {
    greenThreshold: 1.02,
    yellowThreshold: 1.00
  },

  proofFreshness: {
    greenMaxAgeHours: 12,
    yellowMaxAgeHours: 24
  },

  assetQuality: {
    restrictedAssetLevels: ['DISALLOWED']
  },

  assetConcentration: {
    greenMaxPercentage: 60,
    yellowMaxPercentage: 75
  }
};
