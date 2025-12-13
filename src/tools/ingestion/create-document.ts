import { z } from 'zod';
import { IngestionClient, DocumentPayload } from '../../client/ingestion-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for creating a document
 */
export const CreateDocumentSchema = z.object({
  domain: z.string().describe('Domain ID'),
  source: z.string().describe('Source identifier'),
  entity: z.string().describe('Entity type (e.g., content, product)'),
  document: z.record(z.unknown()).describe('Document data as key-value pairs'),
});

export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;

/**
 * Create a new document in the index
 */
export async function createDocument(
  client: IngestionClient,
  input: unknown
) {
  const params = validateInput(CreateDocumentSchema, input);
  return client.createDocument(
    params.domain,
    params.source,
    params.entity,
    params.document as DocumentPayload
  );
}

/**
 * MCP Tool Definition for creating documents
 */
export const createDocumentTool = {
  name: 'sitecore_create_document',
  description: 'Create a new document in the Sitecore Search index. Provide domain, source, entity type, and document data.',
  inputSchema: CreateDocumentSchema,
};
