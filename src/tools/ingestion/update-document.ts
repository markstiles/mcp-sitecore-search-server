import { z } from 'zod';
import { IngestionClient, DocumentPayload } from '../../client/ingestion-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for updating a document
 */
export const UpdateDocumentSchema = z.object({
  domain: z.string().describe('Domain ID'),
  source: z.string().describe('Source identifier'),
  entity: z.string().describe('Entity type'),
  documentId: z.string().describe('Document ID to update'),
  document: z.record(z.unknown()).describe('Complete document data (full replacement)'),
  partial: z.boolean().optional().default(false).describe('If true, performs partial update (PATCH); if false, performs full replacement (PUT)'),
});

export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;

/**
 * Update an existing document
 */
export async function updateDocument(
  client: IngestionClient,
  input: unknown
) {
  const params = validateInput(UpdateDocumentSchema, input);

  if (params.partial) {
    return client.patchDocument(
      params.domain,
      params.source,
      params.entity,
      params.documentId,
      params.document as Partial<DocumentPayload>
    );
  } else {
    return client.updateDocument(
      params.domain,
      params.source,
      params.entity,
      params.documentId,
      params.document as DocumentPayload
    );
  }
}

/**
 * MCP Tool Definition for updating documents
 */
export const updateDocumentTool = {
  name: 'sitecore_update_document',
  description: 'Update an existing document in the Sitecore Search index. Use partial=true for partial updates or partial=false for full replacement.',
  inputSchema: UpdateDocumentSchema,
};
