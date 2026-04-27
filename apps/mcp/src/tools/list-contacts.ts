import { findListByPrefix, membershipsWithContactsForList } from '@budden/core';
import { MembershipStatus, Priority } from '@budden/shared';
import { z } from 'zod';
import { type Tool, err, ok } from '../types';

export const listContactsTool: Tool<{
  list_id: z.ZodString;
  status: z.ZodOptional<typeof MembershipStatus>;
  priority: z.ZodOptional<typeof Priority>;
}> = {
  name: 'list_contacts',
  description:
    'List contacts in a given list, optionally filtered by status or priority. Accepts a list ID or prefix.',
  inputSchema: {
    list_id: z.string().min(1),
    status: MembershipStatus.optional(),
    priority: Priority.optional(),
  },
  handler: ({ list_id, status, priority }, { db }) => {
    const list = findListByPrefix(db, list_id);
    if (!list) return err(`no list matching ${list_id}`);

    let rows = membershipsWithContactsForList(db, list.id);
    if (status) rows = rows.filter((r) => r.membership.status === status);
    if (priority) rows = rows.filter((r) => r.membership.priority === priority);

    return ok({ list, contacts: rows });
  },
};
