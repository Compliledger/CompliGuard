/**
 * Logging Utility
 * 
 * Provides structured logging with privacy awareness.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, unknown>;
}

class Logger {
  private level: LogLevel;
  private format: 'json' | 'text';

  constructor() {
    this.level = this.parseLevel(process.env.LOG_LEVEL || 'info');
    this.format = (process.env.LOG_FORMAT as 'json' | 'text') || 'json';
  }

  private parseLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private formatEntry(entry: LogEntry): string {
    if (this.format === 'json') {
      return JSON.stringify(entry);
    }
    
    const contextStr = entry.context 
      ? ` ${JSON.stringify(entry.context)}` 
      : '';
    return `[${entry.timestamp}] ${entry.level}: ${entry.message}${contextStr}`;
  }

  private log(level: LogLevel, levelName: string, message: string, context?: Record<string, unknown>): void {
    if (level < this.level) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      context
    };

    const formatted = this.formatEntry(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, 'INFO', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, 'WARN', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, 'ERROR', message, context);
  }

  /**
   * Log compliance evaluation result (sanitized for privacy)
   */
  compliance(status: string, policyVersion: string, evidenceHash: string): void {
    this.info('Compliance evaluation completed', {
      status,
      policyVersion,
      evidenceHash,
      type: 'compliance_result'
    });
  }
}

export const logger = new Logger();
