# Sitecore Search MCP Server Tests

This folder contains test and demonstration scripts for the Sitecore Search MCP Server.

## Test Files

### Search API Tests

#### `search-integration-test.js`
**Main search integration test suite**

Comprehensive test that validates:
- ✅ Basic search functionality
- ✅ Faceted search with filters
- ✅ API connectivity and authentication
- ✅ Error handling and response validation

**Usage:**
```bash
node test/search-integration-test.js
```

**What it tests:**
1. Basic search query with pagination
2. Faceted search with all facets enabled
3. Proper error handling for API failures
4. Response structure validation

#### `search-demo.js`
**Search functionality demonstration**

A clean, user-friendly demonstration showing:
- Search query execution
- Facet discovery and display
- Performance metrics (response times)
- Result formatting

**Usage:**
```bash
node test/search-demo.js
```

**Output includes:**
- Discovered facets with values and counts
- Response time metrics
- Summary statistics
- Formatted, readable output

### Ingestion API Tests

#### `ingestion-integration-test.js`
**Document ingestion lifecycle test suite**

Tests the complete document lifecycle:
- ✅ Document creation
- ✅ Full document update (PUT)
- ✅ Partial document update (PATCH)
- ✅ Document deletion
- ✅ Error handling and validation

**Usage:**
```bash
node test/ingestion-integration-test.js
```

**What it tests:**
1. Creates a test document with metadata
2. Performs full replacement update
3. Performs partial/patch update
4. Deletes the test document
5. Validates API responses at each step

**Environment Variables:**
- `SITECORE_SOURCE_ID` - Source identifier (default: `test_source`)

### Events API Tests

#### `events-integration-test.js`
**Event tracking and validation test suite**

Tests various event types and validation:
- ✅ View events
- ✅ Click events
- ✅ Add to cart events
- ✅ Identify events
- ✅ Event payload validation
- ✅ Context data handling

**Usage:**
```bash
node test/events-integration-test.js
```

**What it tests:**
1. Event validation before tracking
2. View event with page context
3. Click event with widget tracking
4. Add event for cart actions
5. Identify event for user tracking
6. Proper context data structure

## Running Tests

Make sure the MCP server is built before running tests:

```bash
# Build the project
npm run build

# Run all tests
node test/search-integration-test.js
node test/search-demo.js
node test/ingestion-integration-test.js
node test/events-integration-test.js

# Or run specific test suites
node test/search-demo.js              # Quick search demo
node test/ingestion-integration-test.js  # Document operations
node test/events-integration-test.js     # Event tracking
```

## Configuration

Tests read configuration from environment variables with fallback defaults:

### Environment Variables

**Required Variables:**
- `SITECORE_DOMAIN_ID` - Your Sitecore domain ID (required for all tests)
- `SITECORE_CLIENT_KEY` - Full client key for Events API (required for events tests)
- `SITECORE_API_KEY` - API key for authentication (required for ingestion tests)

**API Base URLs:**
- `SITECORE_SEARCH_BASE_URL` - Search API URL (default: `https://discover.sitecorecloud.io`)
- `SITECORE_INGESTION_BASE_URL` - Ingestion API URL (default: `https://discover.sitecorecloud.io`)
- `SITECORE_EVENTS_BASE_URL` - Events API URL (default: `https://discover.sitecorecloud.io`)

**Ingestion-Specific:**
- `SITECORE_SOURCE_ID` - Source identifier for ingestion tests (default: `test_source`)

### Example Usage

```bash
# Set required environment variables first
export SITECORE_DOMAIN_ID=your-domain-id

# Search tests
node test/search-demo.js
node test/search-integration-test.js

# Events tests (also requires CLIENT_KEY)
export SITECORE_CLIENT_KEY=your-client-key
node test/events-integration-test.js

# Ingestion tests (also requires API_KEY for authentication)
export SITECORE_API_KEY=your-api-key
node test/ingestion-integration-test.js
```

**Important:** No credentials are stored as defaults in the test files. You must configure all required environment variables before running tests.

## Test Results

All test suites verify that:
- ✅ The MCP server connects successfully to all Sitecore APIs
- ✅ Search queries return proper results with facets
- ✅ Documents can be created, updated, and deleted
- ✅ Events are tracked with proper context data
- ✅ Error handling works correctly for all operations
- ✅ Response times are acceptable (typically < 100ms)
- ✅ API validation catches malformed requests

## Test Coverage

The test suite covers:
- **Search API**: Basic search, faceted search, pagination
- **Ingestion API**: CRUD operations (Create, Read, Update, Delete)
- **Events API**: All major event types (view, click, add, identify)
- **Error Handling**: API errors, validation errors, connection issues
- **Authentication**: Token management and API key handling
