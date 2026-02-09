/**
 * Configuration Management
 * 
 * Centralized configuration loading with environment support.
 */

import { PolicyConfig, DEFAULT_POLICY_CONFIG } from './types';

/** Application configuration */
export interface AppConfig {
  env: 'development' | 'production' | 'test';
  server: {
    port: number;
    host: string;
  };
  api: {
    reserveUrl: string;
    reserveApiKey: string;
    liabilityUrl: string;
    liabilityApiKey: string;
  };
  cre: {
    enabled: boolean;
    workflowId: string;
    nodeUrl: string;
  };
  policy: PolicyConfig;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
}

/** Load configuration from environment */
export function loadConfig(): AppConfig {
  const env = (process.env.NODE_ENV || 'development') as AppConfig['env'];
  
  return {
    env,
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || 'localhost'
    },
    api: {
      reserveUrl: process.env.RESERVE_API_URL || 'http://localhost:3001/api/reserves',
      reserveApiKey: process.env.RESERVE_API_KEY || '',
      liabilityUrl: process.env.LIABILITY_API_URL || 'http://localhost:3001/api/liabilities',
      liabilityApiKey: process.env.LIABILITY_API_KEY || ''
    },
    cre: {
      enabled: process.env.CRE_ENABLED === 'true',
      workflowId: process.env.CRE_WORKFLOW_ID || 'compli-guard-workflow',
      nodeUrl: process.env.CRE_NODE_URL || ''
    },
    policy: {
      ...DEFAULT_POLICY_CONFIG,
      version: process.env.POLICY_VERSION || DEFAULT_POLICY_CONFIG.version
    },
    logging: {
      level: (process.env.LOG_LEVEL || 'info') as AppConfig['logging']['level'],
      format: (process.env.LOG_FORMAT || 'json') as AppConfig['logging']['format']
    }
  };
}

/** Singleton config instance */
let configInstance: AppConfig | null = null;

/** Get application configuration */
export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/** Reset config (for testing) */
export function resetConfig(): void {
  configInstance = null;
}
