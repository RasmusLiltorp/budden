import { findContactByPrefix, updateContact } from '@budden/core';
import { z } from 'zod';
import { err, ok, type Tool } from '../types';

export const updateContactTool: Tool<{
  id: z.ZodString;
  full_name: z.ZodOptional<z.ZodString>;
  role: z.ZodOptional<z.ZodNullable<z.ZodString>>;
  notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}> = {
  name: 'update_contact',
  description:
    'Update contact fields. Pass null to clear a nullable field. Only fields supplied are changed.',
  inputSchema: {
    id: z.string().min(1),
    full_name: z.string().min(1).optional(),
    role: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  },
  handler: ({ id, ...patch }, { db }) => {
    const contact = findContactByPrefix(db, id);
    if (!contact) return err(`no contact matching ${id}`);
    return ok({ contact: updateContact(db, contact.id, patch) });
  },
};
