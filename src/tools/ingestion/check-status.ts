import { z } from 'zod';
import { IngestionClient } from '../../client/ingestion-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for checking ingestion status
 */
export const CheckStatusSchema = z.object({
  domain: z.string().describe('Domain ID'),
  source: z.string().describe('Source identifier'),
  entity: z.string().describe('Entity type'),
  incrementalUpdateId: z.string().describe('Incremental update ID returned from ingestion operation'),
});

export type CheckStatusInput = z.infer<typeof CheckStatusSchema>;

/**
 * Check status of an ingestion operation
 */
export async function checkIngestionStatus(
  client: IngestionClient,
  input: unknown
) {
  const params = validateInput(CheckStatusSchema, input);
  return client.getStatus(
    params.domain,
    params.source,
    params.entity,
    params.incrementalUpdateId
  );
}

/**
 * MCP Tool Definition for checking ingestion status
 */
export const checkStatusTool = {
  name: 'sitecore_check_ingestion_status',
  description: 'Check the status of an asynchronous ingestion operation using the incremental update ID.',
  inputSchema: CheckStatusSchema,
};
