import { z } from 'zod';
import { SearchClient, SearchRequest } from '../../client/search-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for exact answer configuration
 */
const ExactAnswerSchema = z.object({
  include_sources: z.boolean().optional().describe('Whether to return specific attributes from documents used to generate the answer'),
  query_types: z.array(z.enum(['question', 'statement', 'keyword'])).optional().describe('Type of visitor query to answer (question, statement, or keyword)'),
});

/**
 * Schema for related questions configuration
 */
const RelatedQuestionsSchema = z.object({
  include_sources: z.boolean().optional().describe('Include attributes from documents used to generate the answer'),
  limit: z.number().int().min(1).max(100).optional().describe('Maximum number of question-answer pairs to return'),
  offset: z.number().int().min(0).optional().describe('Number of items to skip'),
});

/**
 * Schema for AI-powered questions and answers
 */
export const AiSearchSchema = z.object({
  domainId: z.string().describe('Sitecore domain ID'),
  rfkId: z.string().describe('RFK widget ID for questions (must be a questions widget type)'),
  keyphrase: z.string().min(1).max(100).describe('Search query for AI processing'),
  entity: z.string().optional().describe('Entity type'),
  exact_answer: ExactAnswerSchema.optional().describe('Settings to get a single answer to the visitor query'),
  related_questions: RelatedQuestionsSchema.optional().describe('Settings to get AI-generated question-and-answer pairs'),
});

export type AiSearchInput = z.infer<typeof AiSearchSchema>;

/**
 * Get AI-powered answers or related questions
 */
export async function getAiSearchResults(
  client: SearchClient,
  input: unknown
) {
  const params = validateInput(AiSearchSchema, input);

  // Build the questions object for the API
  const questions: any = {
    keyphrase: params.keyphrase,
  };

  if (params.exact_answer) {
    questions.exact_answer = params.exact_answer;
  }

  if (params.related_questions) {
    questions.related_questions = params.related_questions;
  }

  const request: SearchRequest = {
    widget: {
      items: [
        {
          rfk_id: params.rfkId,
          entity: params.entity,
        },
      ],
    },
    questions,
  };

  return client.search(params.domainId, request);
}

/**
 * MCP Tool Definition for AI search features
 */
export const aiSearchTool = {
  name: 'sitecore_ai_search',
  description: 'Get AI-powered exact answers or related questions for a search query. You must pass at least one of exact_answer or related_questions. Use a questions widget type in rfkId.',
  inputSchema: AiSearchSchema,
};
