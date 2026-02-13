/**
 * CRE Confidential HTTP Bridge
 *
 * This module bridges local Node.js execution with the real CRE SDK.
 *
 * Architecture:
 * - Local dev/demo: Uses NodeHttpClient from ./http.ts (async fetch)
 * - CRE deployment:  Uses ConfidentialHTTPClient from @chainlink/cre-sdk
 *                    See cre-workflow/main.ts for the real CRE workflow
 *
 * The CRE SDK's ConfidentialHTTPClient seals API credentials inside the DON,
 * ensuring they are never exposed in logs, on-chain, or to any single node.
 *
 * @see cre-workflow/main.ts — Real CRE workflow using ConfidentialHTTPClient
 */

import { ApiResponse } from '../core';
import { HttpClient } from './http';

/**
 * Confidential HTTP client for CRE mode.
 *
 * When running locally (outside the DON), this falls back to standard HTTP
 * via the NodeHttpClient. When deployed to CRE, the real
 * ConfidentialHTTPClient from @chainlink/cre-sdk handles requests.
 *
 * See cre-workflow/main.ts for the production CRE implementation.
 */
export class CreConfidentialHttpBridge implements HttpClient {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async fetch<T>(endpoint: string): Promise<ApiResponse<T>> {
    // In local mode, use standard fetch with API key header
    // In CRE mode, this class is NOT used — cre-workflow/main.ts uses the SDK directly
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

export function createConfidentialHttpBridge(baseUrl: string, apiKey: string): HttpClient {
  return new CreConfidentialHttpBridge(baseUrl, apiKey);
}
