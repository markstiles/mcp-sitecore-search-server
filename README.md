# Sitecore Search MCP Server

Model Context Protocol (MCP) server for Sitecore Search APIs, providing unified access to Search & Recommendation, Ingestion, and Events APIs.

## Features

- **Search API**: Execute queries, faceted search, personalized recommendations, and AI-powered features
- **Ingestion API**: Create, update, and delete documents in the search index
- **Events API**: Track visitor events for analytics and personalization
- **Multi-domain support**: Configure multiple Sitecore domains
- **Full Authentication Support**: API key authentication with automatic token management and refresh
- **Type-safe**: Built with TypeScript and Zod validation
- **Modular architecture**: Clean separation of concerns for easy maintenance

## Project Structure

```
mcp-sitecore-search-server/
├── src/
│   ├── index.ts                    # MCP server entry point
│   ├── config.ts                   # Configuration management
│   ├── client/                     # API clients
│   │   ├── base-client.ts          # Base HTTP client with error handling
│   │   ├── search-client.ts        # Search & Recommendation API client
│   │   ├── ingestion-client.ts     # Ingestion API client
│   │   └── events-client.ts        # Events API client
│   ├── tools/                      # MCP tool implementations
│   │   ├── search/                 # Search API tools
│   │   │   ├── basic-search.ts
│   │   │   ├── faceted-search.ts
│   │   │   ├── recommendations.ts
│   │   │   └── ai-search.ts
│   │   ├── ingestion/              # Ingestion API tools
│   │   │   ├── create-document.ts
│   │   │   ├── update-document.ts
│   │   │   ├── delete-document.ts
│   │   │   ├── ingest-from-source.ts
│   │   │   └── check-status.ts
│   │   └── events/                 # Events API tools
│   │       ├── track-event.ts
│   │       └── validate-event.ts
│   └── utils/                      # Utilities
│       ├── errors.ts               # Error handling
│       ├── logger.ts               # Structured logging
│       ├── schema.ts               # Schema conversion
│       └── auth-manager.ts         # Authentication & token management
├── specs/                          # OpenAPI specifications
│   ├── openapi.json                # Search & Recommendation API spec
│   ├── openapi (1).json            # Ingestion API spec
│   └── openapi (2).json            # Events API spec
├── test/                           # Test and demo scripts
│   ├── search-integration-test.js  # Search API integration tests
│   ├── search-demo.js              # Search functionality demo
│   ├── ingestion-integration-test.js # Ingestion API integration tests
│   ├── events-integration-test.js  # Events API integration tests
│   └── README.md                   # Test documentation
├── package.json
├── tsconfig.json
├── README.md
└── AUTHENTICATION.md               # Detailed authentication guide
```

## Installation

### From npm (Recommended)

```bash
# Install globally
npm install -g @markstiles/sitecore-search-mcp

# Or use with npx (no installation needed)
npx @markstiles/sitecore-search-mcp
```

### From Source

```bash
git clone https://github.com/markstiles/mcp-sitecore-search-server.git
cd mcp-sitecore-search-server
npm install
npm run build
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure your Sitecore domain:
```env
SITECORE_DOMAIN_ID=12345678  # Just the domain ID (second part of client key)
SITECORE_CLIENT_KEY=123456789-12345678  # Full client key for Events API
```

**Understanding Domain ID vs Client Key:**
- **Client Key**: Full key in format `companyId-domainId` (e.g., `123456789-987654321`)
  - First part: Company ID
  - Second part: Domain ID
- **Domain ID**: Just the second part after the dash (e.g., `987654321`)
- Find both in Sitecore Search: **Developer Resources > API Access**

### Authentication

This server supports two authentication methods:

#### Subdomain Authentication (Recommended)
If you have a subdomain, no explicit authentication is required. The subdomain host URL provides automatic authentication. Simply configure your domain ID and client key:

```env
SITECORE_DOMAIN_ID=12345678  # Domain ID only
SITECORE_CLIENT_KEY=123456789-12345678  # Full client key for Events API
# No API key needed
```

#### API Key Authentication
If you don't have a subdomain, use an API key for authentication:

```env
SITECORE_DOMAIN_ID=12345678  # Domain ID only
SITECORE_CLIENT_KEY=123456789-12345678  # Full client key for Events API
SITECORE_API_KEY=01-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # API key
```

**How Authentication Works:**
1. **API Key**: A 52-character secret code from Sitecore Search (found in Developer Resources > API Access)
2. **Access Tokens**: Automatically generated from your API key when needed (valid for 1 day by default)
3. **Refresh Tokens**: Used to get new access tokens without re-authenticating (valid for 7 days by default)
4. **Auto-Refresh**: Tokens are automatically refreshed before expiration

**Authentication Scopes:**
- `discover` - Search & Recommendation API
- `event` - Events API  
- `ingestion` - Ingestion API (always uses API key directly, per Sitecore requirements)

**Optional Configuration:**
```env
# Customize authentication scopes (comma-separated)
SITECORE_AUTH_SCOPES=discover,event,ingestion

# Customize token expiry times (in milliseconds)
SITECORE_ACCESS_TOKEN_EXPIRY=43200000  # 12 hours
SITECORE_REFRESH_TOKEN_EXPIRY=259200000  # 3 days
```

**Where Authentication is Used:**
- API keys/tokens are automatically added to request headers
- Search & Recommendation API: `Authorization: Bearer <access-token>`
- Events API: `Authorization: Bearer <access-token>`
- Ingestion API: `Authorization: <api-key>` (no Bearer prefix)

### Multiple Domains

To configure multiple domains with individual authentication settings:

```env
SITECORE_DOMAINS_JSON={
  "12345678": {
    "searchBaseUrl": "https://discover.sitecorecloud.io",
    "ingestionBaseUrl": "https://discover.sitecorecloud.io",
    "eventsBaseUrl": "https://discover.sitecorecloud.io",
    "apiKey": "01-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "clientKey": "123456789-12345678",
    "authScopes": ["discover", "event", "ingestion"],
    "accessTokenExpiry": 86400000,
    "refreshTokenExpiry": 604800000
  },
  "87654321": {
    "searchBaseUrl": "https://...",
    "apiKey": "01-yyyyyyyy-yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
    "clientKey": "987654321-87654321"
  }
}

SITECORE_DEFAULT_DOMAIN=12345678
```

## Build

```bash
npm run build
```

## Usage

### As MCP Server

Configure in your MCP client (e.g., Claude Desktop):

#### Using npx (Recommended - no installation needed)

```json
{
  "mcpServers": {
    "sitecore-search": {
      "command": "npx",
      "args": [
        "-y",
        "@markstiles/sitecore-search-mcp"
      ],
      "env": {
        "SITECORE_DOMAIN_ID": "12345678",
        "SITECORE_CLIENT_KEY": "123456789-12345678",
        "SITECORE_API_KEY": "01-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

#### Using Global Installation

```bash
npm install -g @markstiles/sitecore-search-mcp
```

```json
{
  "mcpServers": {
    "sitecore-search": {
      "command": "mcp-sitecore-search-server",
      "env": {
        "SITECORE_DOMAIN_ID": "12345678",
        "SITECORE_CLIENT_KEY": "123456789-12345678",
        "SITECORE_API_KEY": "01-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

#### Using Local Installation from Source

```json
{
  "mcpServers": {
    "sitecore-search": {
      "command": "node",
      "args": ["/path/to/mcp-sitecore-search-server/dist/index.js"],
      "env": {
        "SITECORE_DOMAIN_ID": "12345678",
        "SITECORE_CLIENT_KEY": "123456789-12345678",
        "SITECORE_API_KEY": "01-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

> **Note**: 
> - `SITECORE_DOMAIN_ID`: Required - the domain ID (second part of client key)
> - `SITECORE_CLIENT_KEY`: Required for Events API - full client key format `xxxxxxxxx-xxxxxxxx`
> - `SITECORE_API_KEY`: Optional if using subdomain authentication
> 
> See [AUTHENTICATION.md](AUTHENTICATION.md) for detailed authentication setup.

### Development

Watch mode for development:
```bash
npm run dev
```

## Testing

Test the MCP server functionality with the included test scripts:

```bash
# Build the project first
npm run build

# Run all integration tests
node test/search-integration-test.js      # Search API tests
node test/ingestion-integration-test.js   # Ingestion API tests
node test/events-integration-test.js      # Events API tests

# Or run the quick demo
node test/search-demo.js
```

The test scripts validate:
- ✅ **Search API**: Basic search, faceted search, pagination
- ✅ **Ingestion API**: Document CRUD operations (Create, Update, Delete)
- ✅ **Events API**: Event tracking (view, click, add, identify)
- ✅ API connectivity and authentication
- ✅ Error handling and validation

See [test/README.md](test/README.md) for detailed test documentation.

## Available Tools

### Search API Tools

#### `sitecore_search_query`
Execute a basic search query.

**Parameters:**
- `domainId` (string): Sitecore domain ID
- `rfkId` (string): RFK widget ID
- `keyphrase` (string, optional): Search query text
- `entity` (string, optional): Entity type (e.g., content, product)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 24)
- `locale` (object, optional): Language and country settings

**Example:**
```json
{
  "domainId": "my-domain",
  "rfkId": "rfkid_7",
  "keyphrase": "laptop",
  "entity": "product",
  "page": 1,
  "limit": 20
}
```

#### `sitecore_search_with_facets`
Execute a faceted search with filtering and sorting.

**Parameters:**
- All basic search parameters, plus:
- `facets` (array, optional): Facet configuration with filters
- `sort` (object, optional): Sort criteria

**Example:**
```json
{
  "domainId": "my-domain",
  "rfkId": "rfkid_7",
  "keyphrase": "laptop",
  "facets": [
    {
      "name": "brand",
      "type": "value",
      "values": ["Dell", "HP"]
    },
    {
      "name": "price",
      "type": "range"
    }
  ],
  "sort": {
    "price": "asc"
  }
}
```

#### `sitecore_get_recommendations`
Get personalized recommendations.

**Parameters:**
- `domainId` (string): Domain ID
- `rfkId` (string): RFK widget ID
- `recommendationId` (string, optional): Recipe ID
- `entity` (string, optional): Entity type
- `userId` (string, optional): User UUID for personalization
- `limit` (number, optional): Number of recommendations (default: 10)

#### `sitecore_ai_search`
Get AI-powered answers or related questions.

**Parameters:**
- `domainId` (string): Domain ID
- `rfkId` (string): RFK widget ID
- `keyphrase` (string): Search query
- `type` (enum): "answer" or "question"
- `entity` (string, optional): Entity type

### Ingestion API Tools

#### `sitecore_create_document`
Create a new document in the index.

**Parameters:**
- `domain` (string): Domain ID
- `source` (string): Source identifier
- `entity` (string): Entity type
- `document` (object): Document data as key-value pairs

**Example:**
```json
{
  "domain": "my-domain",
  "source": "my-source",
  "entity": "content",
  "document": {
    "id": "doc123",
    "title": "My Article",
    "content": "Article content...",
    "author": "John Doe"
  }
}
```

#### `sitecore_update_document`
Update an existing document.

**Parameters:**
- `domain` (string): Domain ID
- `source` (string): Source identifier
- `entity` (string): Entity type
- `documentId` (string): Document ID to update
- `document` (object): Document data
- `partial` (boolean, optional): Use PATCH for partial update (default: false)

#### `sitecore_delete_document`
Delete a document from the index.

**Parameters:**
- `domain`, `source`, `entity`, `documentId`

#### `sitecore_ingest_from_source`
Ingest a document from an external file or URL.

**Parameters:**
- `domain`, `source`, `entity`, `documentId`
- `sourceType` (enum): "file" or "url"
- `sourceUrl` (string): URL to the file or webpage
- `extractors` (object, optional): XPath, JavaScript, or CSS extractors

**Example:**
```json
{
  "domain": "my-domain",
  "source": "web",
  "entity": "content",
  "documentId": "article-456",
  "sourceType": "url",
  "sourceUrl": "https://example.com/article",
  "extractors": {
    "css": [
      { "name": "title", "selector": "h1" },
      { "name": "content", "selector": "article" }
    ]
  }
}
```

#### `sitecore_check_ingestion_status`
Check status of an asynchronous ingestion operation.

**Parameters:**
- `domain`, `source`, `entity`
- `incrementalUpdateId` (string): ID returned from ingestion operation

### Events API Tools

#### `sitecore_track_event`
Track visitor events for analytics and personalization.

**Parameters:**
- `domainId` (string, optional): Domain ID - uses default if not provided
- `customerKey` (string, optional): Customer key (ckey) - uses configured client key if not provided
- `eventType` (enum): Event type (view, click, add, remove, identify, order, etc.)
- `value` (object, optional): Event value data
- `context` (object, optional): User, page, browser, and geo context

**Example:**
```json
{
  "eventType": "view",
  "value": {
    "entity": "product",
    "entity_id": "prod-123"
  },
  "context": {
    "user": {
      "uuid": "user-456"
    },
    "page": {
      "uri": "/products/prod-123",
      "title": "Product Name"
    }
  }
}
```

> **Note**: The `customerKey` is automatically retrieved from your `SITECORE_CLIENT_KEY` configuration. You only need to provide it if you want to override the configured value.

#### `sitecore_validate_event`
Validate an event payload before sending.

**Parameters:**
- Same as `sitecore_track_event` (without customerKey)

## API Coverage

### Search & Recommendation API (openapi.json)
- ✅ Basic search queries
- ✅ Faceted search with filtering
- ✅ Personalized recommendations
- ✅ AI-powered answers and questions
- 🔄 Advanced features (suggestions, rules engine) - Can be added as needed

### Ingestion API (openapi (1).json)
- ✅ Create document (POST)
- ✅ Update document (PUT - full replacement)
- ✅ Patch document (PATCH - partial update)
- ✅ Delete document
- ✅ Create from file upload
- ✅ Create from URL
- ✅ Status checking for async operations

### Events API (openapi (2).json)
- ✅ Track events (v4 endpoint - recommended)
- ✅ Validate events
- 🔄 Legacy endpoints (v3, v2) - Available via content event method

## Error Handling

All tools include comprehensive error handling:
- Input validation using Zod schemas
- API error responses with status codes
- Structured error logging
- Graceful error messages returned to MCP clients

## Logging

The server uses structured JSON logging with different levels:
- `info`: General information
- `error`: Error conditions
- `warn`: Warning conditions
- `debug`: Debug information (requires DEBUG=true)

## Extending the Server

### Adding New Tools

1. Create a new tool file in the appropriate directory:
```typescript
// src/tools/search/new-feature.ts
import { z } from 'zod';
import { SearchClient } from '../../client/search-client.js';

export const NewFeatureSchema = z.object({
  // Define parameters
});

export async function executeNewFeature(client: SearchClient, input: unknown) {
  // Implementation
}

export const newFeatureTool = {
  name: 'sitecore_new_feature',
  description: 'Description of the feature',
  inputSchema: NewFeatureSchema,
};
```

2. Import and register in [src/index.ts](src/index.ts):
```typescript
import { newFeatureTool, executeNewFeature } from './tools/search/new-feature.js';

// Add to ListToolsRequestSchema handler
// Add case to CallToolRequestSchema handler
```

### Modifying API Clients

API clients are in [src/client/](src/client). Each client extends `BaseClient` which provides:
- HTTP methods (get, post, put, patch, delete)
- Error handling
- Request/response logging
- Retry logic

## License

MIT

## Contributing

Contributions are welcome! The modular structure makes it easy to:
- Add new tools for existing APIs
- Extend API clients with new methods
- Add support for additional Sitecore APIs
- Improve error handling and validation

## Publishing

See [PUBLISHING.md](PUBLISHING.md) for detailed instructions on publishing this package to npm.

Quick publish steps:
```bash
# Update version
npm version patch|minor|major

# Build
npm run build

# Publish (first time with scoped package)
npm publish --access public

# Subsequent publishes
npm publish
```

## Support

For Sitecore API documentation, visit:
- [Sitecore Search Documentation](https://doc.sitecore.com/search)
- [OpenAPI Specifications](./specs/)

For issues with this MCP server:
- [GitHub Issues](https://github.com/yourusername/mcp-sitecore-search-server/issues)
