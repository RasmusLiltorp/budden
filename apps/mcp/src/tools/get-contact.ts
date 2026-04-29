import {
  channelsForContact,
  findContactByPrefix,
  getCompany,
  interactionsForContact,
  membershipsWithListsForContact,
} from '@budden/core';
import { z } from 'zod';
import { err, ok, type Tool } from '../types';

export const getContactTool: Tool<{ id: z.ZodString }> = {
  name: 'get_contact',
  description: 'Full contact detail with channels, list memberships, and interaction history.',
  inputSchema: { id: z.string().min(1) },
  handler: ({ id }, { db }) => {
    const contact = findContactByPrefix(db, id);
    if (!contact) return err(`no contact matching ${id}`);

    return ok({
      contact,
      company: contact.company_id ? getCompany(db, contact.company_id) : null,
      channels: channelsForContact(db, contact.id),
      memberships: membershipsWithListsForContact(db, contact.id),
      interactions: interactionsForContact(db, contact.id),
    });
  },
};
