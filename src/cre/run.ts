import dotenv from 'dotenv';
dotenv.config();

import { runWorkflow, createDefaultWorkflowConfig } from './workflow';
import { logger } from '../utils';

async function main() {
  const cfg = createDefaultWorkflowConfig();

  logger.info('Running CompliGuard workflow...', {
    workflowId: cfg.workflowId,
    version: cfg.version,
    httpMode: cfg.httpMode,
    reserveUrl: cfg.api.reserveUrl,
    liabilityUrl: cfg.api.liabilityUrl
  });

  const result = await runWorkflow();

  logger.info('Workflow complete', {
    success: result.success,
    steps: result.steps.map(s => ({ step: s.stepName, ok: s.success, ms: s.durationMs })),
    status: result.complianceResult?.overallStatus,
    evidence: result.complianceResult?.evidenceHash?.substring(0, 16)
  });

  if (!result.success) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  logger.error('Workflow run failed', { error: error?.message || String(error) });
  process.exit(1);
});
