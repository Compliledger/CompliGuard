/**
 * CRE HTTP Adapter
 *
 * Provides an interface that can be swapped between:
 * - NodeHttpClient       → local dev/demo (async Node.js fetch)
 * - CreConfidentialHttpBridge → local CRE simulation (same behaviour, documents CRE path)
 *
 * For real CRE deployment, see cre-workflow/main.ts which uses:
 * - HTTPClient              → standard CRE HTTP with DON consensus
 * - ConfidentialHTTPClient  → seals credentials inside the DON
 *
 * @see cre-workflow/main.ts
 */

import { ApiResponse } from '../core';
import { CreConfidentialHttpBridge } from './confidential-http';

export interface HttpClient {
  fetch<T>(endpoint: string): Promise<ApiResponse<T>>;
}

/**
 * Node-based HTTP client for local dev and simulation.
 */
export class NodeHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async fetch<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
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
 * CRE Confidential HTTP client bridge.
 *
 * In local mode, delegates to CreConfidentialHttpBridge (standard fetch).
 * In CRE deployment, the cre-workflow/main.ts uses the real SDK ConfidentialHTTPClient.
 */
export class CreConfidentialHttpClient implements HttpClient {
  private bridge: CreConfidentialHttpBridge;

  constructor(private readonly baseUrl: string, private readonly apiKey: string) {
    this.bridge = new CreConfidentialHttpBridge(baseUrl, apiKey);
  }

  async fetch<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.bridge.fetch<T>(endpoint);
  }
}

export type HttpClientMode = 'node' | 'cre';

export function createHttpClient(mode: HttpClientMode, baseUrl: string, apiKey: string): HttpClient {
  if (mode === 'cre') {
    return new CreConfidentialHttpClient(baseUrl, apiKey);
  }
  return new NodeHttpClient(baseUrl, apiKey);
}
