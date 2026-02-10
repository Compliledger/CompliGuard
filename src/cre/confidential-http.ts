/**
 * Confidential HTTP Client Stub (CRE Privacy Track)
 *
 * To be enabled when Chainlink CRE Confidential HTTP is available (Feb 14).
 */

import { ApiResponse } from '../core';
import { HttpClient } from './http';

export class ConfidentialHttpStub implements HttpClient {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async fetch<T>(_endpoint: string): Promise<ApiResponse<T>> {
    return {
      success: false,
      error: 'Confidential HTTP will be enabled when CRE privacy features unlock (Feb 14).',
      timestamp: new Date()
    };
  }
}

export function createConfidentialHttpStub(baseUrl: string, apiKey: string): HttpClient {
  return new ConfidentialHttpStub(baseUrl, apiKey);
}
