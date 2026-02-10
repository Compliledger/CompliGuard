/**
 * CRE HTTP Adapter
 *
 * Provides an interface that can be swapped between:
 * - NodeHttpClient (local simulation)
 * - CreConfidentialHttpClient (Feb 14, privacy track)
 */

import { ApiResponse } from '../core';
import { ConfidentialHttpStub } from './confidential-http';

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
 * Placeholder Confidential HTTP client for CRE privacy track.
 * Will be implemented with CRE Confidential HTTP on Feb 14.
 */
export class CreConfidentialHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async fetch<T>(_endpoint: string): Promise<ApiResponse<T>> {
    const stub = new ConfidentialHttpStub(this.baseUrl, this.apiKey);
    return stub.fetch<T>(_endpoint);
  }
}

export type HttpClientMode = 'node' | 'cre';

export function createHttpClient(mode: HttpClientMode, baseUrl: string, apiKey: string): HttpClient {
  if (mode === 'cre') {
    return new CreConfidentialHttpClient(baseUrl, apiKey);
  }
  return new NodeHttpClient(baseUrl, apiKey);
}
