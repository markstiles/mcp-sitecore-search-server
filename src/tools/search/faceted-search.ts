import { z } from 'zod';
import { SearchClient, SearchRequest } from '../../client/search-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for faceted search with filtering
 */
export const FacetedSearchSchema = z.object({
  domainId: z.string().describe('Sitecore domain ID'),
  rfkId: z.string().describe('RFK widget ID'),
  keyphrase: z.string().optional().describe('Search query text'),
  entity: z.string().optional().describe('Entity type to search'),
  facets: z.array(z.object({
    name: z.string().describe('Facet field name'),
    type: z.enum(['value', 'range', 'hierarchy']).optional().describe('Facet type'),
    values: z.array(z.string()).optional().describe('Selected facet values for filtering'),
  })).optional().describe('Facet configuration and filters'),
  sort: z.record(z.enum(['asc', 'desc'])).optional().describe('Sort criteria'),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(24),
});

export type FacetedSearchInput = z.infer<typeof FacetedSearchSchema>;

/**
 * Execute a faceted search query with filters
 */
export async function executeFacetedSearch(
  client: SearchClient,
  input: unknown
) {
  const params = validateInput(FacetedSearchSchema, input);

  const request: SearchRequest = {
    widget: {
      items: [
        {
          rfk_id: params.rfkId,
          entity: params.entity,
          search: {
            query: params.keyphrase ? { keyphrase: params.keyphrase } : undefined,
            facet: params.facets,
            sort: params.sort,
            offset: ((params.page || 1) - 1) * (params.limit || 24),
            limit: params.limit || 24,
          },
        },
      ],
    },
  };

  return client.search(params.domainId, request);
}

/**
 * MCP Tool Definition for faceted search
 */
export const facetedSearchTool = {
  name: 'sitecore_search_with_facets',
  description: 'Execute a faceted search query with filtering and sorting. Returns search results with facet aggregations for filtering UI.',
  inputSchema: FacetedSearchSchema,
};
