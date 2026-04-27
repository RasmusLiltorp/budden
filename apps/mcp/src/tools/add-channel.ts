import { addChannel, findContactByPrefix } from '@budden/core';
import { ChannelType } from '@budden/shared';
import { z } from 'zod';
import { type Tool, err, ok } from '../types';

export const addChannelTool: Tool<{
  contact_id: z.ZodString;
  type: typeof ChannelType;
  handle: z.ZodString;
  is_primary: z.ZodOptional<z.ZodBoolean>;
  verified: z.ZodOptional<z.ZodBoolean>;
}> = {
  name: 'add_channel',
  description: 'Add a new channel (email, linkedin, etc.) to an existing contact.',
  inputSchema: {
    contact_id: z.string().min(1),
    type: ChannelType,
    handle: z.string().min(1),
    is_primary: z.boolean().optional(),
    verified: z.boolean().optional(),
  },
  handler: ({ contact_id, ...rest }, { db }) => {
    const contact = findContactByPrefix(db, contact_id);
    if (!contact) return err(`no contact matching ${contact_id}`);
    const channel = addChannel(db, { contact_id: contact.id, ...rest });
    return ok({ channel });
  },
};
