import { BaseClient } from './base-client.js';
import { AuthManager } from '../utils/auth-manager.js';

/**
 * Client for Sitecore Search & Recommendation API
 * Handles search queries, faceted search, personalization, and recommendations
 */
export class SearchClient extends BaseClient {
  constructor(baseURL: string, authManager?: AuthManager) {
    super(baseURL, 'SearchClient', authManager);
  }

  /**
   * Execute a search query with full widget support
   * POST /discover/v2/{domainId}
   */
  async search(domainId: string, request: SearchRequest): Promise<SearchResponse> {
    return this.post<SearchResponse>(`/discover/v2/${domainId}`, request);
  }
}

/**
 * Type definitions for Search API
 * These are simplified versions - full types should be generated from OpenAPI specs
 */
export interface SearchRequest {
  widget: SearchWidget;
  context?: SearchContext;
  questions?: QuestionsRequest;
}

export interface SearchWidget {
  items: SearchWidgetItem[];
}

export interface SearchWidgetItem {
  rfk_id: string;
  entity?: string;
  search?: {
    query?: {
      keyphrase?: string;
    };
    facet?: Array<{
      name: string;
      type?: string;
      values?: string[];
    }>;
    filter?: Record<string, unknown>;
    sort?: {
      [key: string]: 'asc' | 'desc';
    };
    offset?: number;
    limit?: number;
  };
  recommendation?: {
    id?: string;
  };
  ai?: {
    type?: 'answer' | 'question';
  };
}

export interface SearchContext {
  user?: {
    uuid?: string;
  };
  page?: {
    uri?: string;
  };
  locale?: {
    country?: string;
    language?: string;
  };
}

export interface QuestionsRequest {
  keyphrase: string;
  exact_answer?: {
    include_sources?: boolean;
    query_types?: Array<'question' | 'statement' | 'keyword'>;
  };
  related_questions?: {
    include_sources?: boolean;
    limit?: number;
    offset?: number;
  };
}

export interface SearchResponse {
  widgets: SearchWidgetResponse[];
  context?: {
    request_id?: string;
  };
}

export interface SearchWidgetResponse {
  rfkId: string;
  content?: Array<Record<string, unknown>>;
  total_item?: number;
  facet?: Array<{
    name: string;
    value?: Array<{
      id: string;
      count?: number;
    }>;
  }>;
  sort?: Record<string, unknown>;
  suggestion?: Record<string, unknown>;
}
