import { BaseClient } from './base-client.js';
import { AuthManager } from '../utils/auth-manager.js';

/**
 * Client for Sitecore Events API
 * Handles event tracking for analytics, personalization, and metrics
 */
export class EventsClient extends BaseClient {
  constructor(baseURL: string, authManager?: AuthManager) {
    super(baseURL, 'EventsClient', authManager);
  }

  /**
   * Track an event (v4 recommended endpoint)
   * POST /event/v4/publish/{ckey}
   */
  async trackEvent(customerKey: string, event: EventPayload): Promise<EventResponse> {
    return this.post<EventResponse>(`/event/v4/publish/${customerKey}`, event);
  }

  /**
   * Track a content event (v3 endpoint)
   * POST /event/v3/publish/{ckey}
   */
  async trackContentEvent(customerKey: string, event: EventPayload): Promise<EventResponse> {
    return this.post<EventResponse>(`/event/v3/publish/${customerKey}`, event);
  }

  /**
   * Validate event payload
   * POST /event/v4/validate
   */
  async validateEvent(event: EventPayload): Promise<ValidationResponse> {
    return this.post<ValidationResponse>('/event/v4/validate', event);
  }
}

/**
 * Type definitions for Events API
 */
export interface EventPayload {
  event: EventType;
  value?: EventValue;
  browser?: BrowserContext;
  geo?: GeoContext;
  page?: PageContext;
  user?: UserContext;
}

export type EventType = 
  | 'view'
  | 'click'
  | 'add'
  | 'remove'
  | 'identify'
  | 'order'
  | 'download'
  | 'bookmark'
  | 'review'
  | 'widget'
  | 'request';

export interface EventValue {
  entity?: string;
  entity_id?: string;
  widget?: string;
  action?: string;
  [key: string]: unknown;
}

export interface BrowserContext {
  user_agent?: string;
  ip?: string;
}

export interface GeoContext {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface PageContext {
  uri?: string;
  title?: string;
  locale?: string;
  referrer?: string;
}

export interface UserContext {
  uuid?: string;
  email?: string;
  [key: string]: unknown;
}

export interface EventResponse {
  message?: string;
  status?: string;
}

export interface ValidationResponse {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
