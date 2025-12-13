import axios, { AxiosInstance } from 'axios';
import { Logger } from './logger.js';

/**
 * Authentication scopes for Sitecore Search APIs
 */
export type AuthScope = 'discover' | 'event' | 'ingestion';

/**
 * Token response from Sitecore authentication endpoint
 */
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
}

/**
 * Refresh token response
 */
interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Token storage with expiry tracking
 */
interface TokenStorage {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

/**
 * Authentication Manager for Sitecore Search APIs
 * Handles API key authentication and token management (generation, refresh, expiry)
 */
export class AuthManager {
  private logger: Logger;
  private authEndpoint = 'https://api.rfksrv.com/account/1/access-token';
  private axios: AxiosInstance;
  private tokenStorage?: TokenStorage;
  private tokenRefreshPromise?: Promise<string>;

  constructor(
    private apiKey?: string,
    private scopes: AuthScope[] = ['discover', 'event', 'ingestion'],
    private accessTokenExpiry: number = 86400000, // 1 day default
    private refreshTokenExpiry: number = 604800000 // 7 days default
  ) {
    this.logger = new Logger('AuthManager');
    this.axios = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get authentication header for API requests
   * Returns either API key or access token in Authorization header
   */
  async getAuthHeader(): Promise<Record<string, string>> {
    // If no API key configured, return empty headers (subdomain authentication)
    if (!this.apiKey) {
      return {};
    }

    // For Ingestion API, always use API key (per documentation)
    if (this.scopes.includes('ingestion') && this.scopes.length === 1) {
      return {
        Authorization: this.apiKey,
      };
    }

    // Try to use access token for other APIs
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      return {
        Authorization: `Bearer ${accessToken}`,
      };
    }

    // Fallback to API key
    return {
      Authorization: this.apiKey,
    };
  }

  /**
   * Get a valid access token (generates new one if needed or refreshes if expired)
   */
  private async getAccessToken(): Promise<string | null> {
    // If we're already refreshing, wait for that operation
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    // Check if we have a valid access token
    if (this.tokenStorage && this.isAccessTokenValid()) {
      return this.tokenStorage.accessToken;
    }

    // Check if we have a valid refresh token
    if (this.tokenStorage && this.isRefreshTokenValid()) {
      this.tokenRefreshPromise = this.refreshAccessToken()
        .finally(() => {
          this.tokenRefreshPromise = undefined;
        });
      return this.tokenRefreshPromise;
    }

    // Generate new tokens from API key
    this.tokenRefreshPromise = this.generateTokensFromApiKey()
      .finally(() => {
        this.tokenRefreshPromise = undefined;
      });
    return this.tokenRefreshPromise;
  }

  /**
   * Generate access and refresh tokens from API key
   */
  private async generateTokensFromApiKey(): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key is required to generate tokens');
    }

    this.logger.debug('Generating new access token from API key');

    try {
      const response = await this.axios.post<TokenResponse>(
        this.authEndpoint,
        {
          scope: this.scopes,
          accessExpiry: this.accessTokenExpiry,
          refreshExpiry: this.refreshTokenExpiry,
        },
        {
          headers: {
            'x-api-key': this.apiKey,
          },
        }
      );

      const now = Date.now();
      this.tokenStorage = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        accessTokenExpiresAt: now + response.data.accessTokenExpiry,
        refreshTokenExpiresAt: now + response.data.refreshTokenExpiry,
      };

      this.logger.info('Successfully generated new access token');
      return this.tokenStorage.accessToken;
    } catch (error) {
      this.logger.error('Failed to generate access token from API key', error as Error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    if (!this.tokenStorage) {
      throw new Error('No token storage available for refresh');
    }

    this.logger.debug('Refreshing access token using refresh token');

    try {
      const response = await this.axios.put<RefreshTokenResponse>(
        this.authEndpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.tokenStorage.refreshToken}`,
          },
        }
      );

      // Update only the access token, keep the refresh token
      this.tokenStorage.accessToken = response.data.accessToken;
      this.tokenStorage.accessTokenExpiresAt = Date.now() + this.accessTokenExpiry;

      this.logger.info('Successfully refreshed access token');
      return this.tokenStorage.accessToken;
    } catch (error) {
      this.logger.error('Failed to refresh access token', error as Error);
      // Clear token storage to force re-authentication
      this.tokenStorage = undefined;
      throw error;
    }
  }

  /**
   * Check if access token is valid (not expired)
   * Returns true if valid, false if expired or about to expire (within 1 minute)
   */
  private isAccessTokenValid(): boolean {
    if (!this.tokenStorage) {
      return false;
    }
    // Add 1 minute buffer before expiry
    return Date.now() < this.tokenStorage.accessTokenExpiresAt - 60000;
  }

  /**
   * Check if refresh token is valid (not expired)
   */
  private isRefreshTokenValid(): boolean {
    if (!this.tokenStorage) {
      return false;
    }
    return Date.now() < this.tokenStorage.refreshTokenExpiresAt;
  }

  /**
   * Force clear stored tokens (useful for testing or manual token invalidation)
   */
  clearTokens(): void {
    this.tokenStorage = undefined;
    this.logger.info('Cleared stored tokens');
  }

  /**
   * Get current token status for debugging
   */
  getTokenStatus(): {
    hasTokens: boolean;
    accessTokenValid: boolean;
    refreshTokenValid: boolean;
  } {
    return {
      hasTokens: !!this.tokenStorage,
      accessTokenValid: this.isAccessTokenValid(),
      refreshTokenValid: this.isRefreshTokenValid(),
    };
  }
}
