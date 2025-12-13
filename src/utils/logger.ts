/**
 * Logger utility for structured logging
 */
export class Logger {
  constructor(private context: string) {}

  info(message: string, meta?: Record<string, unknown>): void {
    console.log(JSON.stringify({
      level: 'info',
      context: this.context,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    console.error(JSON.stringify({
      level: 'error',
      context: this.context,
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(JSON.stringify({
      level: 'warn',
      context: this.context,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.DEBUG) {
      console.debug(JSON.stringify({
        level: 'debug',
        context: this.context,
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      }));
    }
  }
}
