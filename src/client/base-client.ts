import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleApiError } from '../utils/errors.js';
import { Logger } from '../utils/logger.js';
import { AuthManager } from '../utils/auth-manager.js';

/**
 * Base HTTP client for all Sitecore API requests
 * Provides common functionality: error handling, logging, retry logic, authentication
 */
export class BaseClient {
  protected axios: AxiosInstance;
  protected logger: Logger;
  protected authManager?: AuthManager;

  constructor(
    baseURL: string,
    context: string,
    authManager?: AuthManager
  ) {
    this.logger = new Logger(context);
    this.authManager = authManager;
    
    this.axios = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging and authentication
    this.axios.interceptors.request.use(
      async (config) => {
        // Add authentication headers
        if (this.authManager && config.headers) {
          const authHeaders = await this.authManager.getAuthHeader();
          Object.entries(authHeaders).forEach(([key, value]) => {
            config.headers.set(key, value);
          });
        }

        this.logger.debug('API Request', {
          method: config.method,
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        this.logger.error('Request error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.axios.interceptors.response.use(
      (response) => {
        this.logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        this.logger.error('Response error', error, {
          url: error.config?.url,
          status: error.response?.status,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   */
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.get(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Make a POST request
   */
  protected async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.post(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Make a PUT request
   */
  protected async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.put(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Make a PATCH request
   */
  protected async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.patch(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }

  /**
   * Make a DELETE request
   */
  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.delete(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
}
