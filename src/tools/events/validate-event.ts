import { z } from 'zod';
import { EventsClient, EventPayload, EventType } from '../../client/events-client.js';
import { validateInput } from '../../utils/errors.js';

/**
 * Schema for validating events
 */
export const ValidateEventSchema = z.object({
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
  ]).describe('Type of event to validate'),
  value: z.record(z.unknown()).optional().describe('Event value data'),
  context: z.object({
    user: z.record(z.unknown()).optional(),
    page: z.record(z.unknown()).optional(),
    browser: z.record(z.unknown()).optional(),
    geo: z.record(z.unknown()).optional(),
  }).optional().describe('Event context information'),
});

export type ValidateEventInput = z.infer<typeof ValidateEventSchema>;

/**
 * Validate an event payload
 */
export async function validateEvent(
  client: EventsClient,
  input: unknown
) {
  const params = validateInput(ValidateEventSchema, input);

  const event: EventPayload = {
    event: params.eventType as EventType,
    value: params.value,
    user: params.context?.user,
    page: params.context?.page,
    browser: params.context?.browser,
    geo: params.context?.geo,
  };

  return client.validateEvent(event);
}

/**
 * MCP Tool Definition for validating events
 */
export const validateEventTool = {
  name: 'sitecore_validate_event',
  description: 'Validate an event payload before sending to ensure it meets API requirements.',
  inputSchema: ValidateEventSchema,
};
