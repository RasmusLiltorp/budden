import { z } from 'zod';
import { ListStatus } from '../enums';

export const ListSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().nullable(),
  goal: z.string().nullable(),
  status: ListStatus,
  created_at: z.date(),
  updated_at: z.date(),
});
export type List = z.infer<typeof ListSchema>;

export const CreateListInput = ListSchema.pick({
  name: true,
  description: true,
  goal: true,
}).partial({ description: true, goal: true });
export type CreateListInput = z.infer<typeof CreateListInput>;
