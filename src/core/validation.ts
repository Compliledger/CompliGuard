/**
 * Input Validation Schemas
 * 
 * Zod schemas for validating all input data to the compliance engine.
 */

import { z } from 'zod';
import { AssetRiskLevel, ComplianceStatus, ControlType } from './types';

/** Asset schema */
export const AssetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string().min(1).max(20),
  value: z.number().nonnegative(),
  riskLevel: z.nativeEnum(AssetRiskLevel),
  percentage: z.number().min(0).max(100)
});

/** Reserve data schema */
export const ReserveDataSchema = z.object({
  totalValue: z.number().nonnegative(),
  assets: z.array(AssetSchema).min(1),
  attestationTimestamp: z.coerce.date(),
  attestationHash: z.string().min(1),
  source: z.string().min(1)
});

/** Liability data schema */
export const LiabilityDataSchema = z.object({
  totalValue: z.number().nonnegative(),
  circulatingSupply: z.number().nonnegative(),
  timestamp: z.coerce.date(),
  source: z.string().min(1)
});

/** Evaluation input schema */
export const EvaluationInputSchema = z.object({
  reserves: ReserveDataSchema,
  liabilities: LiabilityDataSchema
});

/** Policy config schema */
export const PolicyConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  reserveRatio: z.object({
    greenThreshold: z.number().positive(),
    yellowThreshold: z.number().positive()
  }),
  proofFreshness: z.object({
    greenMaxAgeHours: z.number().positive(),
    yellowMaxAgeHours: z.number().positive()
  }),
  assetQuality: z.object({
    maxRiskyPercentage: z.number().min(0).max(100)
  }),
  assetConcentration: z.object({
    maxSingleAssetPercentage: z.number().min(0).max(100)
  })
});

/** Validation result type */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/** Validate evaluation input */
export function validateEvaluationInput(input: unknown): ValidationResult<z.infer<typeof EvaluationInputSchema>> {
  const result = EvaluationInputSchema.safeParse(input);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  };
}

/** Validate policy config */
export function validatePolicyConfig(config: unknown): ValidationResult<z.infer<typeof PolicyConfigSchema>> {
  const result = PolicyConfigSchema.safeParse(config);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  };
}

/** Validate reserve data */
export function validateReserveData(data: unknown): ValidationResult<z.infer<typeof ReserveDataSchema>> {
  const result = ReserveDataSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  };
}

/** Validate liability data */
export function validateLiabilityData(data: unknown): ValidationResult<z.infer<typeof LiabilityDataSchema>> {
  const result = LiabilityDataSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  };
}
