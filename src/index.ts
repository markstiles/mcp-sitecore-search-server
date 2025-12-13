#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadConfig, getDomainConfig } from './config.js';
import { SearchClient } from './client/search-client.js';
import { IngestionClient } from './client/ingestion-client.js';
import { EventsClient } from './client/events-client.js';
import { Logger } from './utils/logger.js';
import { toJsonSchema } from './utils/schema.js';
import { AuthManager } from './utils/auth-manager.js';

// Import Search tools
import { basicSearchTool, executeBasicSearch } from './tools/search/basic-search.js';
import { facetedSearchTool, executeFacetedSearch } from './tools/search/faceted-search.js';
import { recommendationsTool, getRecommendations } from './tools/search/recommendations.js';
import { aiSearchTool, getAiSearchResults } from './tools/search/ai-search.js';

// Import Ingestion tools
import { createDocumentTool, createDocument } from './tools/ingestion/create-document.js';
import { updateDocumentTool, updateDocument } from './tools/ingestion/update-document.js';
import { deleteDocumentTool, deleteDocument } from './tools/ingestion/delete-document.js';
import { ingestFromSourceTool, ingestFromSource } from './tools/ingestion/ingest-from-source.js';
import { checkStatusTool, checkIngestionStatus } from './tools/ingestion/check-status.js';

// Import Events tools
import { trackEventTool, trackEvent } from './tools/events/track-event.js';
import { validateEventTool, validateEvent } from './tools/events/validate-event.js';

const logger = new Logger('MCPServer');

/**
 * Main MCP Server for Sitecore Search APIs
 */
class SitecoreSearchServer {
  private server: Server;
  private config: ReturnType<typeof loadConfig>;
  private searchClients: Map<string, SearchClient> = new Map();
  private ingestionClients: Map<string, IngestionClient> = new Map();
  private eventsClients: Map<string, EventsClient> = new Map();
  private authManagers: Map<string, AuthManager> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'sitecore-search-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Load configuration
    try {
      this.config = loadConfig();
      logger.info('Configuration loaded', {
        domains: Object.keys(this.config.domains),
        defaultDomain: this.config.defaultDomain,
      });
    } catch (error) {
      logger.error('Failed to load configuration', error as Error);
      throw error;
    }

    this.setupHandlers();
    this.setupErrorHandling();
  }

  /**
   * Get or create an AuthManager for a domain
   */
  private getAuthManager(domainId?: string): AuthManager | undefined {
    const domain = domainId || this.config.defaultDomain;
    if (!domain) {
      throw new Error('No domain ID provided and no default domain configured');
    }

    const domainConfig = getDomainConfig(this.config, domain);
    
    // If no API key, return undefined (subdomain authentication)
    if (!domainConfig.apiKey) {
      return undefined;
    }

    if (!this.authManagers.has(domain)) {
      this.authManagers.set(
        domain,
        new AuthManager(
          domainConfig.apiKey,
          domainConfig.authScopes,
          domainConfig.accessTokenExpiry,
          domainConfig.refreshTokenExpiry
        )
      );
    }

    return this.authManagers.get(domain)!;
  }

  /**
   * Get or create a SearchClient for a domain
   */
  private getSearchClient(domainId?: string): SearchClient {
    const domain = domainId || this.config.defaultDomain;
    if (!domain) {
      throw new Error('No domain ID provided and no default domain configured');
    }

    if (!this.searchClients.has(domain)) {
      const domainConfig = getDomainConfig(this.config, domain);
      const authManager = this.getAuthManager(domain);
      this.searchClients.set(domain, new SearchClient(domainConfig.searchBaseUrl, authManager));
    }

    return this.searchClients.get(domain)!;
  }

  /**
   * Get or create an IngestionClient for a domain
   */
  private getIngestionClient(domainId?: string): IngestionClient {
    const domain = domainId || this.config.defaultDomain;
    if (!domain) {
      throw new Error('No domain ID provided and no default domain configured');
    }

    if (!this.ingestionClients.has(domain)) {
      const domainConfig = getDomainConfig(this.config, domain);
      const authManager = this.getAuthManager(domain);
      this.ingestionClients.set(domain, new IngestionClient(domainConfig.ingestionBaseUrl, authManager));
    }

    return this.ingestionClients.get(domain)!;
  }

  /**
   * Get or create an EventsClient for a domain
   */
  private getEventsClient(domainId?: string): EventsClient {
    const domain = domainId || this.config.defaultDomain;
    if (!domain) {
      throw new Error('No domain ID provided and no default domain configured');
    }

    if (!this.eventsClients.has(domain)) {
      const domainConfig = getDomainConfig(this.config, domain);
      const authManager = this.getAuthManager(domain);
      this.eventsClients.set(domain, new EventsClient(domainConfig.eventsBaseUrl, authManager));
    }

    return this.eventsClients.get(domain)!;
  }

  /**
   * Get client key for a domain
   */
  private getClientKey(domainId?: string): string {
    const domain = domainId || this.config.defaultDomain;
    if (!domain) {
      throw new Error('No domain ID provided and no default domain configured');
    }

    const domainConfig = getDomainConfig(this.config, domain);
    if (!domainConfig.clientKey) {
      throw new Error(`Client key not configured for domain: ${domain}. Please set SITECORE_CLIENT_KEY in your environment.`);
    }

    return domainConfig.clientKey;
  }

  /**
   * Setup request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Search API tools
          {
            name: basicSearchTool.name,
            description: basicSearchTool.description,
            inputSchema: toJsonSchema(basicSearchTool.inputSchema),
          },
          {
            name: facetedSearchTool.name,
            description: facetedSearchTool.description,
            inputSchema: toJsonSchema(facetedSearchTool.inputSchema),
          },
          {
            name: recommendationsTool.name,
            description: recommendationsTool.description,
            inputSchema: toJsonSchema(recommendationsTool.inputSchema),
          },
          {
            name: aiSearchTool.name,
            description: aiSearchTool.description,
            inputSchema: toJsonSchema(aiSearchTool.inputSchema),
          },
          // Ingestion API tools
          {
            name: createDocumentTool.name,
            description: createDocumentTool.description,
            inputSchema: toJsonSchema(createDocumentTool.inputSchema),
          },
          {
            name: updateDocumentTool.name,
            description: updateDocumentTool.description,
            inputSchema: toJsonSchema(updateDocumentTool.inputSchema),
          },
          {
            name: deleteDocumentTool.name,
            description: deleteDocumentTool.description,
            inputSchema: toJsonSchema(deleteDocumentTool.inputSchema),
          },
          {
            name: ingestFromSourceTool.name,
            description: ingestFromSourceTool.description,
            inputSchema: toJsonSchema(ingestFromSourceTool.inputSchema),
          },
          {
            name: checkStatusTool.name,
            description: checkStatusTool.description,
            inputSchema: toJsonSchema(checkStatusTool.inputSchema),
          },
          // Events API tools
          {
            name: trackEventTool.name,
            description: trackEventTool.description,
            inputSchema: toJsonSchema(trackEventTool.inputSchema),
          },
          {
            name: validateEventTool.name,
            description: validateEventTool.description,
            inputSchema: toJsonSchema(validateEventTool.inputSchema),
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.info('Tool called', { name, args });

      if (!args) {
        throw new Error('No arguments provided');
      }

      try {
        let result: unknown;

        // Route to appropriate tool handler
        switch (name) {
          // Search API tools
          case basicSearchTool.name:
            result = await executeBasicSearch(this.getSearchClient((args as any).domainId), args);
            break;
          case facetedSearchTool.name:
            result = await executeFacetedSearch(this.getSearchClient((args as any).domainId), args);
            break;
          case recommendationsTool.name:
            result = await getRecommendations(this.getSearchClient((args as any).domainId), args);
            break;
          case aiSearchTool.name:
            result = await getAiSearchResults(this.getSearchClient((args as any).domainId), args);
            break;

          // Ingestion API tools
          case createDocumentTool.name:
            result = await createDocument(this.getIngestionClient((args as any).domain), args);
            break;
          case updateDocumentTool.name:
            result = await updateDocument(this.getIngestionClient((args as any).domain), args);
            break;
          case deleteDocumentTool.name:
            result = await deleteDocument(this.getIngestionClient((args as any).domain), args);
            break;
          case ingestFromSourceTool.name:
            result = await ingestFromSource(this.getIngestionClient((args as any).domain), args);
            break;
          case checkStatusTool.name:
            result = await checkIngestionStatus(this.getIngestionClient((args as any).domain), args);
            break;

          // Events API tools
          case trackEventTool.name: {
            const domainId = (args as any).domainId;
            const clientKey = this.getClientKey(domainId);
            result = await trackEvent(this.getEventsClient(domainId), clientKey, args);
            break;
          }
          case validateEventTool.name:
            result = await validateEvent(this.getEventsClient((args as any).domainId), args);
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error('Tool execution failed', error as Error, { tool: name });
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      logger.error('Server error', error);
    };

    process.on('SIGINT', async () => {
      logger.info('Shutting down server...');
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Sitecore Search MCP Server started');
  }
}

// Start the server
const server = new SitecoreSearchServer();
server.start().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
