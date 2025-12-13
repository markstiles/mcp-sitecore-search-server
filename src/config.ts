import { z } from 'zod';

/**
 * Configuration schema for Sitecore Search MCP Server
 */
export const DomainConfigSchema = z.object({
  searchBaseUrl: z.string().url().optional().default('https://discover.sitecorecloud.io'),
  ingestionBaseUrl: z.string().url().optional().default('https://discover.sitecorecloud.io'),
  eventsBaseUrl: z.string().url().optional().default('https://discover.sitecorecloud.io'),
  apiKey: z.string().optional(),
  clientKey: z.string().optional(), // Full client key (e.g., 123456789-987654321) for Events API
  // Token expiry settings (in milliseconds)
  accessTokenExpiry: z.number().optional().default(86400000), // 1 day
  refreshTokenExpiry: z.number().optional().default(604800000), // 7 days
  // Scope settings for authentication
  authScopes: z.array(z.enum(['discover', 'event', 'ingestion'])).optional().default(['discover', 'event', 'ingestion']),
});

export const ConfigSchema = z.object({
  domains: z.record(z.string(), DomainConfigSchema),
  defaultDomain: z.string().optional(),
});

export type DomainConfig = z.infer<typeof DomainConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

/**
 * Load configuration from environment variables
 * Supports multiple domains via SITECORE_DOMAIN_{NAME}_* pattern
 */
export function loadConfig(): Config {
  const domains: Record<string, DomainConfig> = {};

  // Load default domain configuration
  if (process.env.SITECORE_DOMAIN_ID) {
    domains[process.env.SITECORE_DOMAIN_ID] = {
      searchBaseUrl: process.env.SITECORE_SEARCH_BASE_URL || 'https://discover.sitecorecloud.io',
      ingestionBaseUrl: process.env.SITECORE_INGESTION_BASE_URL || 'https://discover.sitecorecloud.io',
      eventsBaseUrl: process.env.SITECORE_EVENTS_BASE_URL || 'https://discover.sitecorecloud.io',
      apiKey: process.env.SITECORE_API_KEY,
      clientKey: process.env.SITECORE_CLIENT_KEY,
      accessTokenExpiry: process.env.SITECORE_ACCESS_TOKEN_EXPIRY 
        ? parseInt(process.env.SITECORE_ACCESS_TOKEN_EXPIRY) 
        : 86400000,
      refreshTokenExpiry: process.env.SITECORE_REFRESH_TOKEN_EXPIRY 
        ? parseInt(process.env.SITECORE_REFRESH_TOKEN_EXPIRY) 
        : 604800000,
      authScopes: process.env.SITECORE_AUTH_SCOPES 
        ? (process.env.SITECORE_AUTH_SCOPES.split(',').map(s => s.trim()) as ('discover' | 'event' | 'ingestion')[])
        : ['discover', 'event', 'ingestion'],
    };
  }

  // Parse additional domains from environment (format: SITECORE_DOMAINS_JSON)
  if (process.env.SITECORE_DOMAINS_JSON) {
    try {
      const parsedDomains = JSON.parse(process.env.SITECORE_DOMAINS_JSON);
      Object.assign(domains, parsedDomains);
    } catch (error) {
      console.error('Failed to parse SITECORE_DOMAINS_JSON:', error);
    }
  }

  return ConfigSchema.parse({
    domains,
    defaultDomain: process.env.SITECORE_DEFAULT_DOMAIN || process.env.SITECORE_DOMAIN_ID,
  });
}

/**
 * Get domain configuration by domain ID
 */
export function getDomainConfig(config: Config, domainId?: string): DomainConfig {
  const targetDomain = domainId || config.defaultDomain;
  
  if (!targetDomain) {
    throw new Error('No domain ID provided and no default domain configured');
  }

  const domainConfig = config.domains[targetDomain];
  if (!domainConfig) {
    throw new Error(`Domain configuration not found for: ${targetDomain}`);
  }

  return domainConfig;
}
