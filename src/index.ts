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
      reserveApi: false, // Would check actual API connectivity
      liabilityApi: false // Would check actual API connectivity
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

  logger.info('CompliGuard initialized successfully');
  logger.info('Run `npm run demo` to see the compliance engine in action');
  logger.info('Run `npm run mock-server` to start the mock API server');
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    logger.error('Failed to start CompliGuard', { error: error.message });
    process.exit(1);
  });
}
