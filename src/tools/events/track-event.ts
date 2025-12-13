import { z } from 'zod';
import { EventsClient, EventPayload, EventType } from '../../client/events-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for tracking events
 */
export const TrackEventSchema = z.object({
  domainId: z.string().optional().describe('Domain ID (will use default if not provided)'),
  customerKey: z.string().optional().describe('Customer key (ckey) - will use configured client key if not provided'),
  eventType: z.enum([
    'view',
    'click',
    'add',
    'remove',
    'identify',
    'order',
    'download',
    'bookmark',
    'review',
    'widget',
    'request',
  ]).describe('Type of event to track'),
  value: z.object({
    entity: z.string().optional().describe('Entity type (e.g., content, product)'),
    entity_id: z.string().optional().describe('ID of the entity being tracked'),
    widget: z.string().optional().describe('Widget ID for widget events'),
    action: z.string().optional().describe('Action performed'),
  }).passthrough().optional().describe('Event value data'),
  context: z.object({
    user: z.object({
      uuid: z.string().optional(),
      email: z.string().optional(),
    }).passthrough().optional().describe('User context'),
    page: z.object({
      uri: z.string().optional(),
      title: z.string().optional(),
      locale: z.string().optional(),
      referrer: z.string().optional(),
    }).optional().describe('Page context'),
    browser: z.object({
      user_agent: z.string().optional(),
      ip: z.string().optional(),
    }).optional().describe('Browser context'),
    geo: z.object({
      country: z.string().optional(),
      region: z.string().optional(),
      city: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }).optional().describe('Geographic context'),
  }).optional().describe('Event context information'),
});

export type TrackEventInput = z.infer<typeof TrackEventSchema>;

/**
 * Track an event
 */
export async function trackEvent(
  client: EventsClient,
  customerKey: string,
  input: unknown
) {
  const params = validateInput(TrackEventSchema, input);

  // Use provided customer key or the one from input
  const finalCustomerKey = params.customerKey || customerKey;
  
  if (!finalCustomerKey) {
    throw new Error('Customer key is required. Either configure SITECORE_CLIENT_KEY or provide customerKey parameter.');
  }

  const event: EventPayload = {
    event: params.eventType as EventType,
    value: params.value,
    user: params.context?.user,
    page: params.context?.page,
    browser: params.context?.browser,
    geo: params.context?.geo,
  };

  return client.trackEvent(finalCustomerKey, event);
}

/**
 * MCP Tool Definition for tracking events
 */
export const trackEventTool = {
  name: 'sitecore_track_event',
  description: 'Track visitor events for analytics, personalization, and metrics. Supports various event types like view, click, add, order, etc.',
  inputSchema: TrackEventSchema,
};
