import { z } from 'zod';
import { IngestionClient, DocumentExtractors } from '../../client/ingestion-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for ingesting from file or URL
 */
export const IngestFromSourceSchema = z.object({
  domain: z.string().describe('Domain ID'),
  source: z.string().describe('Source identifier'),
  entity: z.string().describe('Entity type'),
  documentId: z.string().describe('Document ID for the ingested content'),
  sourceType: z.enum(['file', 'url']).describe('Type of source: file or url'),
  sourceUrl: z.string().url().describe('URL to the file or web page to ingest'),
  extractors: z.object({
    xpath: z.array(z.object({
      name: z.string(),
      expression: z.string(),
    })).optional().describe('XPath extractors for parsing content'),
    javascript: z.array(z.object({
      name: z.string(),
      expression: z.string(),
    })).optional().describe('JavaScript extractors for parsing content'),
    css: z.array(z.object({
      name: z.string(),
      selector: z.string(),
    })).optional().describe('CSS selector extractors for parsing content'),
  }).optional().describe('Content extractors for parsing the source'),
});

export type IngestFromSourceInput = z.infer<typeof IngestFromSourceSchema>;

/**
 * Ingest document from file or URL
 */
export async function ingestFromSource(
  client: IngestionClient,
  input: unknown
) {
  const params = validateInput(IngestFromSourceSchema, input);

  if (params.sourceType === 'file') {
    return client.createDocumentFromFile(
      params.domain,
      params.source,
      params.entity,
      params.documentId,
      params.sourceUrl,
      params.extractors as DocumentExtractors
    );
  } else {
    return client.createDocumentFromUrl(
      params.domain,
      params.source,
      params.entity,
      params.documentId,
      params.sourceUrl,
      params.extractors as DocumentExtractors
    );
  }
}

/**
 * MCP Tool Definition for ingesting from external sources
 */
export const ingestFromSourceTool = {
  name: 'sitecore_ingest_from_source',
  description: 'Ingest a document from an external file or URL. Supports XPath, JavaScript, and CSS extractors for parsing content.',
  inputSchema: IngestFromSourceSchema,
};
