import {
  addChannel,
  assignToList,
  createContact,
  findListByPrefix,
  findOrCreateCompany,
} from '@budden/core';
import { ChannelType, Priority } from '@budden/shared';
import { z } from 'zod';
import { type Tool, err, ok } from '../types';

const channelInput = z.object({
  type: ChannelType,
  handle: z.string().min(1),
  is_primary: z.boolean().optional(),
});

export const addContactTool: Tool<{
  full_name: z.ZodString;
  company: z.ZodOptional<z.ZodString>;
  role: z.ZodOptional<z.ZodString>;
  notes: z.ZodOptional<z.ZodString>;
  list_id: z.ZodOptional<z.ZodString>;
  priority: z.ZodOptional<typeof Priority>;
  channels: z.ZodOptional<z.ZodArray<typeof channelInput>>;
}> = {
  name: 'add_contact',
  description:
    'Create a contact, optionally with company, channels, and list assignment. Returns the created contact.',
  inputSchema: {
    full_name: z.string().min(1),
    company: z.string().optional(),
    role: z.string().optional(),
    notes: z.string().optional(),
    list_id: z.string().optional(),
    priority: Priority.optional(),
    channels: z.array(channelInput).optional(),
  },
  handler: (args, { db }) => {
    const company = args.company ? findOrCreateCompany(db, args.company) : null;
    const list = args.list_id ? findListByPrefix(db, args.list_id) : null;
    if (args.list_id && !list) return err(`no list matching ${args.list_id}`);

    const contact = createContact(
      db,
      {
        full_name: args.full_name,
        company_id: company?.id ?? null,
        role: args.role ?? null,
        notes: args.notes ?? null,
      },
      { listId: list?.id },
    );

    for (const ch of args.channels ?? []) {
      addChannel(db, { contact_id: contact.id, ...ch });
    }

    if (list) {
      assignToList(db, {
        list_id: list.id,
        contact_id: contact.id,
        priority: args.priority ?? null,
      });
    }

    return ok({ contact });
  },
};
