/**
 * Chainlink CRE Workflow Definition
 *
 * Defines the workflow structure for Chainlink Runtime Environment (CRE).
 * Confidential HTTP integration will be enabled when the privacy track unlocks (Feb 14).
 */

import { ComplianceEngine, EvaluationInput, ComplianceResult, ReserveData, LiabilityData } from '../core';
import { logger, sha256 } from '../utils';
import { createHttpClient, HttpClient, HttpClientMode } from './http';
import { ReserveApiClient, LiabilityApiClient } from '../api/clients';

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
  httpMode: HttpClientMode;
  api: {
    reserveUrl: string;
    liabilityUrl: string;
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
 * CRE Workflow Executor
 * 
 * Orchestrates the compliance evaluation workflow using Chainlink CRE patterns.
 */
export class CREWorkflowExecutor {
  private config: CREWorkflowConfig;
  private engine: ComplianceEngine;
  private reserveHttp: HttpClient;
  private liabilityHttp: HttpClient;
  private reserveClient: ReserveApiClient;
  private liabilityClient: LiabilityApiClient;

  constructor(config: CREWorkflowConfig) {
    this.config = config;
    this.engine = new ComplianceEngine();

    this.reserveHttp = createHttpClient(
      config.httpMode,
      config.api.reserveUrl,
      config.secrets.reserveApiKey
    );

    this.liabilityHttp = createHttpClient(
      config.httpMode,
      config.api.liabilityUrl,
      config.secrets.liabilityApiKey
    );

    this.reserveClient = new ReserveApiClient(this.reserveHttp, {
      retries: config.retryPolicy.maxRetries,
      backoffMs: config.retryPolicy.backoffMs
    });

    this.liabilityClient = new LiabilityApiClient(this.liabilityHttp, {
      retries: config.retryPolicy.maxRetries,
      backoffMs: config.retryPolicy.backoffMs
    });
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
      const response = await this.reserveClient.getReserveData();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch reserves');
      }
      reserves = response.data as ReserveData;
      return { fetched: true, hash: sha256(reserves).substring(0, 16) };
    });
    steps.push(reserveStep);

    if (!reserveStep.success) {
      return this.createResult(executionId, startTime, false, steps);
    }

    // Step 2: Fetch Liability Data (Confidential)
    const liabilityStep = await this.executeStep('fetch_liabilities', async () => {
      const response = await this.liabilityClient.getLiabilityData();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch liabilities');
      }
      liabilities = response.data as LiabilityData;
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
    version: process.env.CRE_WORKFLOW_VERSION || 'v1.0.0',
    schedule: process.env.CRE_SCHEDULE || '*/5 * * * *', // Every 5 minutes
    retryPolicy: {
      maxRetries: Number(process.env.CRE_MAX_RETRIES || 3),
      backoffMs: Number(process.env.CRE_BACKOFF_MS || 1000)
    },
    httpMode: (process.env.CRE_HTTP_MODE as HttpClientMode) || 'node',
    api: {
      reserveUrl: process.env.RESERVE_API_URL || 'http://localhost:3001',
      liabilityUrl: process.env.LIABILITY_API_URL || 'http://localhost:3001'
    },
    secrets: {
      reserveApiKey: process.env.RESERVE_API_KEY || 'demo-key',
      liabilityApiKey: process.env.LIABILITY_API_KEY || 'demo-key'
    }
  };
}

/**
 * Convenience entrypoint for local/CLI runs
 */
export async function runWorkflow(): Promise<WorkflowExecutionResult> {
  const cfg = createDefaultWorkflowConfig();
  const executor = new CREWorkflowExecutor(cfg);
  return executor.execute();
}
