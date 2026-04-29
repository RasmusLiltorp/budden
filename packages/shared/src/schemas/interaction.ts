import { z } from 'zod';
import { Direction, InteractionChannel } from '../enums';
import { Json } from './_common';

export const InteractionSchema = z.object({
  id: z.string(),
  list_id: z.string(),
  contact_id: z.string(),
  channel_type: InteractionChannel,
  direction: Direction,
  subject: z.string().nullable(),
  body: z.string().nullable(),
  occurred_at: z.date(),
  created_at: z.date(),
  metadata: Json,
});
export type Interaction = z.infer<typeof InteractionSchema>;

export const LogInteractionInput = z.object({
  list_id: z.string(),
  contact_id: z.string(),
  channel_type: InteractionChannel,
  direction: Direction,
  subject: z.string().nullish(),
  body: z.string().nullish(),
  occurred_at: z.date().optional(),
  metadata: Json.optional(),
});
export type LogInteractionInput = z.infer<typeof LogInteractionInput>;
