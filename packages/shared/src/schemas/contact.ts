import { z } from 'zod';
import { Json } from './_common';

export const ContactSchema = z.object({
  id: z.string(),
  company_id: z.string().nullable(),
  full_name: z.string().min(1),
  role: z.string().nullable(),
  notes: z.string().nullable(),
  metadata: Json,
  created_at: z.date(),
  updated_at: z.date(),
});
export type Contact = z.infer<typeof ContactSchema>;

export const CreateContactInput = z.object({
  full_name: z.string().min(1),
  company_id: z.string().nullish(),
  role: z.string().nullish(),
  notes: z.string().nullish(),
  metadata: Json.optional(),
});
export type CreateContactInput = z.infer<typeof CreateContactInput>;
