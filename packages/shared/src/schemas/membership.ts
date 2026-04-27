import { z } from 'zod';
import { MembershipStatus, Priority } from '../enums';

export const ListMembershipSchema = z.object({
  id: z.string(),
  list_id: z.string(),
  contact_id: z.string(),
  status: MembershipStatus,
  priority: Priority.nullable(),
  assigned_to: z.string().nullable(),
  added_at: z.date(),
  status_changed_at: z.date(),
});
export type ListMembership = z.infer<typeof ListMembershipSchema>;
