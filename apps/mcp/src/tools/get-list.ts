import { findListByPrefix, membershipsForList } from '@budden/core';
import type { MembershipStatus } from '@budden/shared';
import { z } from 'zod';
import { err, ok, type Tool } from '../types';

export const getListTool: Tool<{ id: z.ZodString }> = {
  name: 'get_list',
  description: 'Detail of one list with status breakdown. Accepts full ID or short prefix.',
  inputSchema: { id: z.string().min(1) },
  handler: ({ id }, { db }) => {
    const list = findListByPrefix(db, id);
    if (!list) return err(`no list matching ${id}`);

    const memberships = membershipsForList(db, list.id);
    const counts: Partial<Record<MembershipStatus, number>> = {};
    for (const m of memberships) counts[m.status] = (counts[m.status] ?? 0) + 1;

    return ok({ list, contact_count: memberships.length, counts });
  },
};
