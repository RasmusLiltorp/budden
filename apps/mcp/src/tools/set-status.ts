import { findContactByPrefix, findListByPrefix, setStatus } from '@budden/core';
import { MembershipStatus } from '@budden/shared';
import { z } from 'zod';
import { err, ok, type Tool } from '../types';

export const setStatusTool: Tool<{
  contact_id: z.ZodString;
  list_id: z.ZodString;
  status: typeof MembershipStatus;
}> = {
  name: 'set_status',
  description:
    "Explicitly change a contact's status within a list. Validates the state-machine transition (do_not_contact reachable from any state).",
  inputSchema: {
    contact_id: z.string().min(1),
    list_id: z.string().min(1),
    status: MembershipStatus,
  },
  handler: ({ contact_id, list_id, status }, { db }) => {
    const contact = findContactByPrefix(db, contact_id);
    if (!contact) return err(`no contact matching ${contact_id}`);
    const list = findListByPrefix(db, list_id);
    if (!list) return err(`no list matching ${list_id}`);

    try {
      const membership = setStatus(db, list.id, contact.id, status);
      return ok({ membership });
    } catch (e) {
      return err(e instanceof Error ? e.message : String(e));
    }
  },
};
