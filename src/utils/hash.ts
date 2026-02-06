/**
 * Cryptographic Utility Functions
 * 
 * Provides hashing and evidence generation utilities.
 */

import crypto from 'crypto';

/**
 * Generate SHA-256 hash of data
 */
export function sha256(data: string | object): string {
  const input = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Generate a truncated hash for display purposes
 */
export function shortHash(data: string | object, length: number = 16): string {
  return sha256(data).substring(0, length);
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Create a commitment hash (hides sensitive data while proving knowledge)
 */
export function createCommitment(data: object, salt?: string): {
  commitment: string;
  salt: string;
} {
  const usedSalt = salt || crypto.randomBytes(32).toString('hex');
  const commitment = sha256({ data, salt: usedSalt });
  return { commitment, salt: usedSalt };
}

/**
 * Verify a commitment
 */
export function verifyCommitment(
  data: object,
  salt: string,
  expectedCommitment: string
): boolean {
  const { commitment } = createCommitment(data, salt);
  return commitment === expectedCommitment;
}
