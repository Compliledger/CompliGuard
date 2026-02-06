/**
 * Chainlink CRE Workflow Definition
 * 
 * Defines the workflow structure for Chainlink Compute Runtime Environment.
 * This is a placeholder for the actual CRE integration.
 */

import { ComplianceEngine, EvaluationInput, ComplianceResult, ReserveData, LiabilityData, ApiResponse } from '../core';
import { logger, sha256 } from '../utils';

/**
 * CRE Workflow Configuration
 */
export interface CREWorkflowConfig {
  workflowId: string;
  version: string;
  schedule: string; // cron expression
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  secrets: {
    reserveApiKey: string;
    liabilityApiKey: string;
  };
}

/**
 * CRE Workflow Step Result
 */
export interface WorkflowStepResult {
  stepName: string;
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
}

/**
 * CRE Workflow Execution Result
 */
export interface WorkflowExecutionResult {
  executionId: string;
  workflowId: string;
  startTime: Date;
  endTime: Date;
  success: boolean;
  steps: WorkflowStepResult[];
  complianceResult?: ComplianceResult;
}

/**
 * Confidential HTTP Client (simulated)
 * In production, this would use CRE's Confidential HTTP capability
 */
class ConfidentialHttpClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async fetch<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      // In production, this would be a confidential HTTP request via CRE
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json() as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }
}

/**
 * CRE Workflow Executor
 * 
 * Orchestrates the compliance evaluation workflow using Chainlink CRE patterns.
 */
export class CREWorkflowExecutor {
  private config: CREWorkflowConfig;
  private engine: ComplianceEngine;
  private reserveClient: ConfidentialHttpClient;
  private liabilityClient: ConfidentialHttpClient;

  constructor(config: CREWorkflowConfig) {
    this.config = config;
    this.engine = new ComplianceEngine();
    
    this.reserveClient = new ConfidentialHttpClient(
      process.env.RESERVE_API_URL || 'http://localhost:3001',
      config.secrets.reserveApiKey
    );
    
    this.liabilityClient = new ConfidentialHttpClient(
      process.env.LIABILITY_API_URL || 'http://localhost:3001',
      config.secrets.liabilityApiKey
    );
  }

  /**
   * Execute the complete workflow
   */
  async execute(): Promise<WorkflowExecutionResult> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startTime = new Date();
    const steps: WorkflowStepResult[] = [];

    logger.info('Starting CRE workflow execution', {
      executionId,
      workflowId: this.config.workflowId
    });

    let reserves: ReserveData | undefined;
    let liabilities: LiabilityData | undefined;
    let complianceResult: ComplianceResult | undefined;

    // Step 1: Fetch Reserve Data (Confidential)
    const reserveStep = await this.executeStep('fetch_reserves', async () => {
      const response = await this.reserveClient.fetch<ReserveData>('/api/reserves');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch reserves');
      }
      reserves = response.data;
      return { fetched: true, hash: sha256(reserves).substring(0, 16) };
    });
    steps.push(reserveStep);

    if (!reserveStep.success) {
      return this.createResult(executionId, startTime, false, steps);
    }

    // Step 2: Fetch Liability Data (Confidential)
    const liabilityStep = await this.executeStep('fetch_liabilities', async () => {
      const response = await this.liabilityClient.fetch<LiabilityData>('/api/liabilities');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch liabilities');
      }
      liabilities = response.data;
      return { fetched: true, hash: sha256(liabilities).substring(0, 16) };
    });
    steps.push(liabilityStep);

    if (!liabilityStep.success) {
      return this.createResult(executionId, startTime, false, steps);
    }

    // Step 3: Evaluate Compliance
    const evaluateStep = await this.executeStep('evaluate_compliance', async () => {
      if (!reserves || !liabilities) {
        throw new Error('Missing input data');
      }
      
      const input: EvaluationInput = { reserves, liabilities };
      complianceResult = this.engine.evaluate(input);
      
      return {
        status: complianceResult.overallStatus,
        evidenceHash: complianceResult.evidenceHash.substring(0, 32),
        policyVersion: complianceResult.policyVersion
      };
    });
    steps.push(evaluateStep);

    if (!evaluateStep.success) {
      return this.createResult(executionId, startTime, false, steps);
    }

    // Step 4: Emit Result (would publish to chain in production)
    const emitStep = await this.executeStep('emit_result', async () => {
      if (!complianceResult) {
        throw new Error('No compliance result');
      }
      
      // In production, this would:
      // 1. Sign the result
      // 2. Submit to blockchain
      // 3. Emit events
      
      logger.compliance(
        complianceResult.overallStatus,
        complianceResult.policyVersion,
        complianceResult.evidenceHash
      );

      return {
        emitted: true,
        status: complianceResult.overallStatus,
        timestamp: complianceResult.evaluationTimestamp.toISOString()
      };
    });
    steps.push(emitStep);

    return this.createResult(executionId, startTime, true, steps, complianceResult);
  }

  /**
   * Execute a single workflow step with timing and error handling
   */
  private async executeStep(
    name: string,
    fn: () => Promise<unknown>
  ): Promise<WorkflowStepResult> {
    const stepStart = Date.now();

    try {
      const data = await fn();
      return {
        stepName: name,
        success: true,
        data,
        durationMs: Date.now() - stepStart
      };
    } catch (error) {
      logger.error(`Workflow step failed: ${name}`, {
        error: error instanceof Error ? error.message : 'Unknown'
      });
      
      return {
        stepName: name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - stepStart
      };
    }
  }

  /**
   * Create workflow execution result
   */
  private createResult(
    executionId: string,
    startTime: Date,
    success: boolean,
    steps: WorkflowStepResult[],
    complianceResult?: ComplianceResult
  ): WorkflowExecutionResult {
    return {
      executionId,
      workflowId: this.config.workflowId,
      startTime,
      endTime: new Date(),
      success,
      steps,
      complianceResult
    };
  }
}

/**
 * Create default workflow configuration
 */
export function createDefaultWorkflowConfig(): CREWorkflowConfig {
  return {
    workflowId: process.env.CRE_WORKFLOW_ID || 'compli-guard-workflow',
    version: '1.0.0',
    schedule: '*/5 * * * *', // Every 5 minutes
    retryPolicy: {
      maxRetries: 3,
      backoffMs: 1000
    },
    secrets: {
      reserveApiKey: process.env.RESERVE_API_KEY || 'demo-key',
      liabilityApiKey: process.env.LIABILITY_API_KEY || 'demo-key'
    }
  };
}
