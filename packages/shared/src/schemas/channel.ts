import { z } from 'zod';
import { ChannelType } from '../enums';

export const ChannelSchema = z.object({
  id: z.string(),
  contact_id: z.string(),
  type: ChannelType,
  handle: z.string().min(1),
  is_primary: z.boolean(),
  verified: z.boolean(),
  created_at: z.date(),
});
export type Channel = z.infer<typeof ChannelSchema>;

export const AddChannelInput = z.object({
  contact_id: z.string(),
  type: ChannelType,
  handle: z.string().min(1),
  is_primary: z.boolean().default(false),
  verified: z.boolean().default(false),
});
export type AddChannelInput = z.infer<typeof AddChannelInput>;
