/**
 * CompliGuard - Main Entry Point
 * 
 * Privacy-Preserving Compliance Enforcement with Chainlink CRE
 */

import dotenv from 'dotenv';
dotenv.config();

export * from './core';
export * from './utils';

import { ComplianceEngine, ComplianceStatus, HealthStatus } from './core';
import { logger } from './utils';

const engine = new ComplianceEngine();
const startTime = Date.now();

/**
 * Get system health status
 */
export function getHealthStatus(): HealthStatus {
  const history = engine.getEvaluationHistory();
  const lastEvaluation = history.length > 0 
    ? history[history.length - 1].timestamp 
    : undefined;

  return {
    status: 'healthy',
    version: engine.getConfig().version,
    uptime: Date.now() - startTime,
    lastEvaluation,
    components: {
      policyEngine: true,
      reserveApi: Boolean(process.env.RESERVE_API_URL),
      liabilityApi: Boolean(process.env.LIABILITY_API_URL)
    }
  };
}

/**
 * Main function for standalone execution
 */
async function main(): Promise<void> {
  logger.info('CompliGuard starting...', {
    version: engine.getConfig().version,
    nodeEnv: process.env.NODE_ENV || 'development'
  });

  const health = getHealthStatus();
  logger.info('System health check', {
    status: health.status,
    uptime: health.uptime
  });

  logger.info('Quickstart:', {});
  logger.info('  Terminal 1: npm run mock-server');
  logger.info('  Terminal 2: npm run workflow');
  logger.info('Optional: npm run demo (scenario coverage)');
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    logger.error('Failed to start CompliGuard', { error: error.message });
    process.exit(1);
  });
}
