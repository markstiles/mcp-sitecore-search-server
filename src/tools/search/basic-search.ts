import { z } from 'zod';
import { SearchClient, SearchRequest } from '../../client/search-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for basic search query
 */
export const BasicSearchSchema = z.object({
  domainId: z.string().describe('Sitecore domain ID'),
  rfkId: z.string().describe('RFK widget ID'),
  keyphrase: z.string().optional().describe('Search query text'),
  entity: z.string().optional().describe('Entity type to search (e.g., content, product)'),
  page: z.number().optional().default(1).describe('Page number for pagination'),
  limit: z.number().optional().default(24).describe('Number of results per page'),
  locale: z.object({
    language: z.string().optional(),
    country: z.string().optional(),
  }).optional().describe('Locale settings for the search'),
});

export type BasicSearchInput = z.infer<typeof BasicSearchSchema>;

/**
 * Execute a basic search query
 */
export async function executeBasicSearch(
  client: SearchClient,
  input: unknown
) {
  const params = validateInput(BasicSearchSchema, input);

  const request: SearchRequest = {
    widget: {
      items: [
        {
          rfk_id: params.rfkId,
          entity: params.entity,
          search: {
            query: params.keyphrase ? { keyphrase: params.keyphrase } : undefined,
            offset: ((params.page || 1) - 1) * (params.limit || 24),
            limit: params.limit || 24,
          },
        },
      ],
    },
    context: params.locale ? {
      locale: params.locale,
    } : undefined,
  };

  return client.search(params.domainId, request);
}

/**
 * MCP Tool Definition for basic search
 */
export const basicSearchTool = {
  name: 'sitecore_search_query',
  description: 'Execute a search query against Sitecore Search API. Returns search results with content items matching the query.',
  inputSchema: BasicSearchSchema,
};
