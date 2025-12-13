import { z } from 'zod';
import { SearchClient, SearchRequest } from '../../client/search-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for recommendations
 */
export const RecommendationsSchema = z.object({
  domainId: z.string().describe('Sitecore domain ID'),
  rfkId: z.string().describe('RFK widget ID'),
  recommendationId: z.string().optional().describe('Recipe-based recommendation ID'),
  entity: z.string().optional().describe('Entity type'),
  userId: z.string().optional().describe('User UUID for personalized recommendations'),
  limit: z.number().optional().default(10).describe('Number of recommendations'),
});

export type RecommendationsInput = z.infer<typeof RecommendationsSchema>;

/**
 * Get personalized recommendations
 */
export async function getRecommendations(
  client: SearchClient,
  input: unknown
) {
  const params = validateInput(RecommendationsSchema, input);

  const request: SearchRequest = {
    widget: {
      items: [
        {
          rfk_id: params.rfkId,
          entity: params.entity,
          recommendation: {
            id: params.recommendationId,
          },
          search: {
            limit: params.limit,
          },
        },
      ],
    },
    context: params.userId ? {
      user: {
        uuid: params.userId,
      },
    } : undefined,
  };

  return client.search(params.domainId, request);
}

/**
 * MCP Tool Definition for recommendations
 */
export const recommendationsTool = {
  name: 'sitecore_get_recommendations',
  description: 'Get personalized content or product recommendations based on user behavior and configured recipes.',
  inputSchema: RecommendationsSchema,
};
