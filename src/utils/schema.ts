import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

/**
 * Convert a Zod schema to JSON Schema format for MCP
 */
export function toJsonSchema(zodSchema: z.ZodType<any>) {
  const jsonSchema = zodToJsonSchema(zodSchema, { 
    target: 'jsonSchema7',
    $refStrategy: 'none'
  });
  
  // Remove $schema field as MCP doesn't expect it
  const { $schema, ...rest } = jsonSchema as any;
  
  return rest;
}
