import { z } from 'zod';
import { IngestionClient } from '../../client/ingestion-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for deleting a document
 */
export const DeleteDocumentSchema = z.object({
  domain: z.string().describe('Domain ID'),
  source: z.string().describe('Source identifier'),
  entity: z.string().describe('Entity type'),
  documentId: z.string().describe('Document ID to delete'),
});

export type DeleteDocumentInput = z.infer<typeof DeleteDocumentSchema>;

/**
 * Delete a document from the index
 */
export async function deleteDocument(
  client: IngestionClient,
  input: unknown
) {
  const params = validateInput(DeleteDocumentSchema, input);
  return client.deleteDocument(
    params.domain,
    params.source,
    params.entity,
    params.documentId
  );
}

/**
 * MCP Tool Definition for deleting documents
 */
export const deleteDocumentTool = {
  name: 'sitecore_delete_document',
  description: 'Delete a document from the Sitecore Search index by its ID.',
  inputSchema: DeleteDocumentSchema,
};
