import { z } from 'zod';
import { Json } from './_common';

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  website: z.string().nullable(),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  metadata: Json,
  created_at: z.date(),
  updated_at: z.date(),
});
export type Company = z.infer<typeof CompanySchema>;

export const CreateCompanyInput = z.object({
  name: z.string().min(1),
  website: z.string().nullish(),
  description: z.string().nullish(),
  notes: z.string().nullish(),
  metadata: Json.optional(),
});
export type CreateCompanyInput = z.infer<typeof CreateCompanyInput>;
