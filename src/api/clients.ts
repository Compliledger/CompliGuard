/**
 * API Clients for reserves and liabilities
 */

import { ApiResponse, LiabilityData, ReserveData } from '../core';
import { validateLiabilityData, validateReserveData } from '../core/validation';
import { HttpClient } from '../cre/http';

interface ClientOptions {
  retries?: number;
  backoffMs?: number;
  ttlMs?: number;
}

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(fn: () => Promise<ApiResponse<T>>, retries: number, backoffMs: number): Promise<ApiResponse<T>> {
  let attempt = 0;
  let lastError: string | undefined;

  while (attempt <= retries) {
    const result = await fn();
    if (result.success && result.data) return result;
    lastError = result.error || 'Unknown error';
    if (attempt === retries) break;
    await sleep(backoffMs * Math.pow(2, attempt));
    attempt++;
  }

  return { success: false, error: lastError, timestamp: new Date() };
}

export class ReserveApiClient {
  private cache: CacheEntry<ReserveData> | null = null;
  private readonly retries: number;
  private readonly backoffMs: number;
  private readonly ttlMs: number;

  constructor(private readonly http: HttpClient, options: ClientOptions = {}) {
    this.retries = options.retries ?? 2;
    this.backoffMs = options.backoffMs ?? 300;
    this.ttlMs = options.ttlMs ?? 5_000;
  }

  async getReserveData(): Promise<ApiResponse<ReserveData>> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return { success: true, data: this.cache.value, timestamp: new Date() };
    }

    const response = await fetchWithRetry(
      () => this.http.fetch<ReserveData>('/api/reserves'),
      this.retries,
      this.backoffMs
    );

    if (!response.success || !response.data) return response;

    const data = response.data as ReserveData;
    const validation = validateReserveData(data);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', '), timestamp: new Date() };
    }

    this.cache = {
      expiresAt: Date.now() + this.ttlMs,
      value: validation.data as ReserveData
    };

    return { success: true, data: validation.data as ReserveData, timestamp: new Date() };
  }
}

export class LiabilityApiClient {
  private cache: CacheEntry<LiabilityData> | null = null;
  private readonly retries: number;
  private readonly backoffMs: number;
  private readonly ttlMs: number;

  constructor(private readonly http: HttpClient, options: ClientOptions = {}) {
    this.retries = options.retries ?? 2;
    this.backoffMs = options.backoffMs ?? 300;
    this.ttlMs = options.ttlMs ?? 5_000;
  }

  async getLiabilityData(): Promise<ApiResponse<LiabilityData>> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return { success: true, data: this.cache.value, timestamp: new Date() };
    }

    const response = await fetchWithRetry(
      () => this.http.fetch<LiabilityData>('/api/liabilities'),
      this.retries,
      this.backoffMs
    );

    if (!response.success || !response.data) return response;

    const data = response.data as LiabilityData;
    const validation = validateLiabilityData(data);
    if (!validation.success) {
      return { success: false, error: validation.errors?.join(', '), timestamp: new Date() };
    }

    this.cache = {
      expiresAt: Date.now() + this.ttlMs,
      value: validation.data as LiabilityData
    };

    return { success: true, data: validation.data as LiabilityData, timestamp: new Date() };
  }
}
