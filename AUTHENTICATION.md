# Authentication Implementation Guide

This document provides a detailed explanation of how authentication works in the Sitecore Search MCP Server.

## Overview

The MCP server supports two authentication methods as per Sitecore Search API documentation:

1. **Subdomain Authentication** (Recommended) - No explicit authentication needed
2. **API Key Authentication** - Using API keys and automatically managed access tokens

## Authentication Flow

```
┌─────────────┐
│   API Key   │ (52-character secret from Sitecore)
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  AuthManager    │ Manages tokens and authentication
└────────┬────────┘
         │
         ├──► Generate Access Token (POST to auth endpoint)
         │    └──► Valid for 1 day (configurable)
         │
         ├──► Refresh Access Token (PUT to auth endpoint)
         │    └──► Using refresh token when access token expires
         │
         └──► Clear & Re-authenticate when refresh token expires
              └──► Valid for 7 days (configurable)
```

## Key Components

### 1. AuthManager (`src/utils/auth-manager.ts`)

The `AuthManager` class handles all authentication logic:

**Responsibilities:**
- Stores API key and authentication scopes
- Generates access tokens from API key
- Refreshes access tokens using refresh tokens
- Tracks token expiry and auto-refreshes before expiration
- Provides authentication headers for API requests

**Key Methods:**
- `getAuthHeader()`: Returns authentication header (API key or Bearer token)
- `generateTokensFromApiKey()`: POST request to get access & refresh tokens
- `refreshAccessToken()`: PUT request to refresh expired access token
- `clearTokens()`: Manually clear stored tokens

**Token Expiry:**
- Access token: 1 day default (86400000 ms)
- Refresh token: 7 days default (604800000 ms)
- 1-minute buffer before access token expiry to prevent race conditions

### 2. BaseClient (`src/client/base-client.ts`)

Updated to support authentication via `AuthManager`:

**Changes:**
- Constructor now accepts optional `AuthManager` instance
- Request interceptor calls `authManager.getAuthHeader()` before each request
- Headers are automatically injected into all API requests

### 3. Client Classes

All client classes now accept and pass `AuthManager`:

- `SearchClient` - For Search & Recommendation API
- `IngestionClient` - For Ingestion API  
- `EventsClient` - For Events API

### 4. Configuration (`src/config.ts`)

Extended to support authentication settings:

**New Configuration Fields:**
- `apiKey`: The 52-character API key from Sitecore
- `authScopes`: Array of scopes (`discover`, `event`, `ingestion`)
- `accessTokenExpiry`: Access token validity in milliseconds
- `refreshTokenExpiry`: Refresh token validity in milliseconds

## API Key and Token Usage

### Getting Your API Key

1. Log in to Sitecore Search Customer Engagement Console (CEC)
2. Navigate to **Developer Resources > API Access**
3. Copy your 52-character API key
   - Format: `01-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Authentication Scopes

Each API key has assigned scopes that determine which APIs you can access:

- **`discover`** - Search and Recommendation API
- **`event`** - Events API
- **`ingestion`** - Ingestion API

If you call an API without the proper scope, you'll receive an HTTP 4XX error.

### How Tokens Are Used

#### Search & Recommendation API
```
Authorization: Bearer <access-token>
```

#### Events API
```
Authorization: Bearer <access-token>
```

#### Ingestion API (Special Case)
```
Authorization: <api-key>
```
**Note:** The Ingestion API always uses the API key directly (no Bearer prefix), per Sitecore documentation.

## Token Lifecycle

### 1. Initial Request
```typescript
// User makes first API call
searchClient.search(domainId, request)
  ↓
// AuthManager checks for valid access token (none exists)
authManager.getAuthHeader()
  ↓
// Generates new tokens from API key
POST https://api.rfksrv.com/account/1/access-token
Headers: { 'x-api-key': '01-...' }
Body: {
  "scope": ["discover", "event", "ingestion"],
  "accessExpiry": 86400000,
  "refreshExpiry": 604800000
}
  ↓
// Response contains tokens
{
  "accessToken": "167dgw2vyy733",
  "refreshToken": "1n555d88sss448",
  "accessTokenExpiry": 86400000,
  "refreshTokenExpiry": 604800000
}
  ↓
// Tokens stored in memory with expiry timestamps
// Access token used in Authorization header
Authorization: Bearer 167dgw2vyy733
```

### 2. Subsequent Requests (Token Valid)
```typescript
// User makes another API call
searchClient.search(domainId, request)
  ↓
// AuthManager checks for valid access token (exists and not expired)
authManager.getAuthHeader()
  ↓
// Returns existing access token
Authorization: Bearer 167dgw2vyy733
```

### 3. Access Token Expiration
```typescript
// User makes API call after ~1 day
searchClient.search(domainId, request)
  ↓
// AuthManager detects expired access token
authManager.getAuthHeader()
  ↓
// Refreshes access token using refresh token
PUT https://api.rfksrv.com/account/1/access-token
Headers: { 'Authorization': 'Bearer 1n555d88sss448' }
  ↓
// Response contains new access token
{
  "accessToken": "187dgb6vmy733"
}
  ↓
// New access token stored and used
Authorization: Bearer 187dgb6vmy733
```

### 4. Refresh Token Expiration
```typescript
// User makes API call after ~7 days
searchClient.search(domainId, request)
  ↓
// AuthManager detects expired refresh token
authManager.getAuthHeader()
  ↓
// Clears token storage and generates new tokens from API key
// (Returns to step 1)
```

## Configuration Examples

### Basic Configuration (Subdomain)
```env
SITECORE_DOMAIN_ID=my-domain
# No API key needed - subdomain handles authentication
```

### API Key Authentication
```env
SITECORE_DOMAIN_ID=my-domain
SITECORE_API_KEY=01-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Custom Token Expiry
```env
SITECORE_DOMAIN_ID=my-domain
SITECORE_API_KEY=01-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SITECORE_ACCESS_TOKEN_EXPIRY=43200000   # 12 hours
SITECORE_REFRESH_TOKEN_EXPIRY=259200000 # 3 days
```

### Limited Scopes
```env
SITECORE_DOMAIN_ID=my-domain
SITECORE_API_KEY=01-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SITECORE_AUTH_SCOPES=discover,event  # Only Search and Events APIs
```

### Multiple Domains
```env
SITECORE_DOMAINS_JSON={
  "production": {
    "apiKey": "01-prod-key...",
    "authScopes": ["discover", "event", "ingestion"]
  },
  "staging": {
    "apiKey": "01-stage-key...",
    "authScopes": ["discover"],
    "accessTokenExpiry": 3600000
  }
}
SITECORE_DEFAULT_DOMAIN=production
```

## Request Flow in Code

### Location: `src/index.ts`

```typescript
// 1. Server creates AuthManager for each domain
getAuthManager(domainId) {
  return new AuthManager(
    apiKey,
    authScopes,
    accessTokenExpiry,
    refreshTokenExpiry
  );
}

// 2. AuthManager passed to clients
getSearchClient(domainId) {
  const authManager = this.getAuthManager(domainId);
  return new SearchClient(baseUrl, authManager);
}

// 3. Client uses AuthManager in interceptor
// src/client/base-client.ts
axios.interceptors.request.use(async (config) => {
  const authHeaders = await authManager.getAuthHeader();
  // Headers injected into request
});
```

## Debugging Authentication

### Check Token Status
```typescript
const authManager = new AuthManager(apiKey, scopes);
const status = authManager.getTokenStatus();
console.log(status);
// {
//   hasTokens: true,
//   accessTokenValid: true,
//   refreshTokenValid: true
// }
```

### Clear Tokens Manually
```typescript
authManager.clearTokens();
// Forces re-authentication on next request
```

### Enable Debug Logging
```env
DEBUG=true
```

This will log:
- Token generation requests
- Token refresh requests
- Token expiry warnings
- Authentication header injection

## Security Considerations

1. **API Key Storage**: Never commit API keys to version control
2. **Environment Variables**: Use `.env` file (gitignored) for local development
3. **Production**: Use secure environment variable management (e.g., Azure Key Vault, AWS Secrets Manager)
4. **Token Storage**: Tokens are stored in memory only (not persisted to disk)
5. **Token Lifetime**: Use shorter expiry times for sensitive environments
6. **Scope Limitation**: Only assign necessary scopes to each API key

## Troubleshooting

### 401 Unauthorized
- Verify API key is correct (52 characters)
- Check that API key has required scopes
- Ensure tokens haven't expired (check logs)

### 403 Forbidden
- API key doesn't have permission for requested operation
- Contact Sitecore support to adjust API key scopes

### Token Refresh Failures
- Refresh token may have expired (>7 days)
- Server will automatically re-authenticate with API key
- Check network connectivity to auth endpoint

### Ingestion API Not Working
- Ingestion API requires `ingestion` scope
- Ensure API key is being used (not access token)

## References

- [Sitecore Search API Authentication](https://doc.sitecore.com/search/en/developers/search-developer-guide/api-authentication-and-authorization.html)
- [Get Access & Refresh Tokens](https://doc.sitecore.com/search/en/developers/search-developer-guide/get-an-access-token-and-a-refresh-token.html)
- [Add API Key or Token to Request](https://doc.sitecore.com/search/en/developers/search-developer-guide/add-an-api-key-or-access-token-to-a-request-header.html)
