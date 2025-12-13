import { z } from 'zod';

/**
 * Base error class for Sitecore API errors
 */
export class SitecoreApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'SitecoreApiError';
  }
}

/**
 * Error handling utility for API responses
 */
export function handleApiError(error: unknown): never {
  if (error instanceof SitecoreApiError) {
    throw error;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    
    if (err.response) {
      // Axios error with response
      const statusCode = err.response.status;
      const data = err.response.data;
      
      let message = `API request failed with status ${statusCode}`;
      if (data?.message) {
        message = data.message;
      } else if (typeof data === 'string') {
        message = data;
      }
      
      throw new SitecoreApiError(message, statusCode, data);
    }
    
    if (err.message) {
      throw new SitecoreApiError(err.message);
    }
  }

  throw new SitecoreApiError('Unknown error occurred');
}

/**
 * Validate input against a Zod schema
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      throw new Error(`Validation error: ${formattedErrors}`);
    }
    throw error;
  }
}
