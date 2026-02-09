/**
 * Error Handling
 * 
 * Custom error classes for the compliance engine.
 */

/** Base error class for CompliGuard */
export class CompliGuardError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'CompliGuardError';
    this.code = code;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString()
    };
  }
}

/** Validation error */
export class ValidationError extends CompliGuardError {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(`Validation failed: ${errors.join(', ')}`, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors
    };
  }
}

/** Configuration error */
export class ConfigurationError extends CompliGuardError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}

/** API error */
export class ApiError extends CompliGuardError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(message: string, statusCode?: number, endpoint?: string) {
    super(message, 'API_ERROR');
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      endpoint: this.endpoint
    };
  }
}

/** Evaluation error */
export class EvaluationError extends CompliGuardError {
  public readonly controlType?: string;

  constructor(message: string, controlType?: string) {
    super(message, 'EVALUATION_ERROR');
    this.name = 'EvaluationError';
    this.controlType = controlType;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      controlType: this.controlType
    };
  }
}

/** Check if error is a CompliGuard error */
export function isCompliGuardError(error: unknown): error is CompliGuardError {
  return error instanceof CompliGuardError;
}

/** Format error for logging (safe, no sensitive data) */
export function formatErrorForLogging(error: unknown): object {
  if (isCompliGuardError(error)) {
    return error.toJSON();
  }
  
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
  
  return {
    name: 'UnknownError',
    message: String(error),
    timestamp: new Date().toISOString()
  };
}
