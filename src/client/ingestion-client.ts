import { BaseClient } from './base-client.js';
import { AuthManager } from '../utils/auth-manager.js';

/**
 * Client for Sitecore Ingestion API
 * Handles document CRUD operations, file uploads, and status checks
 */
export class IngestionClient extends BaseClient {
  constructor(baseURL: string, authManager?: AuthManager) {
    super(baseURL, 'IngestionClient', authManager);
  }

  /**
   * Create a new document
   * POST /ingestion/v1/domains/{domain}/sources/{source}/entities/{entity}/documents
   */
  async createDocument(
    domain: string,
    source: string,
    entity: string,
    document: DocumentPayload
  ): Promise<IngestionResponse> {
    const url = `/ingestion/v1/domains/${domain}/sources/${source}/entities/${entity}/documents`;
    return this.post<IngestionResponse>(url, document);
  }

  /**
   * Update a document (full replacement)
   * PUT /ingestion/v1/domains/{domain}/sources/{source}/entities/{entity}/documents/{documentId}
   */
  async updateDocument(
    domain: string,
    source: string,
    entity: string,
    documentId: string,
    document: DocumentPayload
  ): Promise<IngestionResponse> {
    const url = `/ingestion/v1/domains/${domain}/sources/${source}/entities/${entity}/documents/${documentId}`;
    return this.put<IngestionResponse>(url, document);
  }

  /**
   * Partially update a document
   * PATCH /ingestion/v1/domains/{domain}/sources/{source}/entities/{entity}/documents/{documentId}
   */
  async patchDocument(
    domain: string,
    source: string,
    entity: string,
    documentId: string,
    patch: Partial<DocumentPayload>
  ): Promise<IngestionResponse> {
    const url = `/ingestion/v1/domains/${domain}/sources/${source}/entities/${entity}/documents/${documentId}`;
    return this.patch<IngestionResponse>(url, patch);
  }

  /**
   * Delete a document
   * DELETE /ingestion/v1/domains/{domain}/sources/{source}/entities/{entity}/documents/{documentId}
   */
  async deleteDocument(
    domain: string,
    source: string,
    entity: string,
    documentId: string
  ): Promise<IngestionResponse> {
    const url = `/ingestion/v1/domains/${domain}/sources/${source}/entities/${entity}/documents/${documentId}`;
    return this.delete<IngestionResponse>(url);
  }

  /**
   * Create document from file upload
   * POST /ingestion/v1/domains/{domain}/sources/{source}/entities/{entity}/file/{documentId}
   */
  async createDocumentFromFile(
    domain: string,
    source: string,
    entity: string,
    documentId: string,
    fileUrl: string,
    extractors?: DocumentExtractors
  ): Promise<IngestionResponse> {
    const url = `/ingestion/v1/domains/${domain}/sources/${source}/entities/${entity}/file/${documentId}`;
    return this.post<IngestionResponse>(url, {
      file_url: fileUrl,
      extractors,
    });
  }

  /**
   * Create document from URL
   * POST /ingestion/v1/domains/{domain}/sources/{source}/entities/{entity}/url/{documentId}
   */
  async createDocumentFromUrl(
    domain: string,
    source: string,
    entity: string,
    documentId: string,
    url: string,
    extractors?: DocumentExtractors
  ): Promise<IngestionResponse> {
    const endpoint = `/ingestion/v1/domains/${domain}/sources/${source}/entities/${entity}/url/${documentId}`;
    return this.post<IngestionResponse>(endpoint, {
      url,
      extractors,
    });
  }

  /**
   * Check status of an incremental update
   * GET /ingestion/v1/domains/{domain}/sources/{source}/entities/{entity}/status/{incrementalUpdateId}
   */
  async getStatus(
    domain: string,
    source: string,
    entity: string,
    incrementalUpdateId: string
  ): Promise<StatusResponse> {
    const url = `/ingestion/v1/domains/${domain}/sources/${source}/entities/${entity}/status/${incrementalUpdateId}`;
    return this.get<StatusResponse>(url);
  }
}

/**
 * Type definitions for Ingestion API
 */
export interface DocumentPayload {
  id?: string;
  [key: string]: unknown;
}

export interface DocumentExtractors {
  xpath?: Array<{
    name: string;
    expression: string;
  }>;
  javascript?: Array<{
    name: string;
    expression: string;
  }>;
  css?: Array<{
    name: string;
    selector: string;
  }>;
}

export interface IngestionResponse {
  message?: string;
  incremental_update_id?: string;
  status?: string;
}

export interface StatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  progress?: number;
}
