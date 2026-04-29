import {
  findContactByPrefix,
  findListByPrefix,
  logInteraction,
  membershipsForContact,
} from '@budden/core';
import { Direction, InteractionChannel, parseOccurredAt } from '@budden/shared';
import { z } from 'zod';
import { err, ok, type Tool } from '../types';

export const logInteractionTool: Tool<{
  contact_id: z.ZodString;
  list_id: z.ZodOptional<z.ZodString>;
  direction: typeof Direction;
  channel_type: z.ZodOptional<typeof InteractionChannel>;
  subject: z.ZodOptional<z.ZodString>;
  body: z.ZodOptional<z.ZodString>;
  occurred_at: z.ZodOptional<z.ZodString>;
}> = {
  name: 'log_interaction',
  description:
    'Record a send / reply / note. Auto-transitions membership status (e.g. first outbound on a not_contacted contact → contacted). The user is responsible for actually sending the message; this only records that they did.',
  inputSchema: {
    contact_id: z.string().min(1),
    list_id: z.string().optional(),
    direction: Direction,
    channel_type: InteractionChannel.optional(),
    subject: z.string().optional(),
    body: z.string().optional(),
    occurred_at: z.string().optional(),
  },
  handler: (args, { db }) => {
    const contact = findContactByPrefix(db, args.contact_id);
    if (!contact) return err(`no contact matching ${args.contact_id}`);

    let listId: string;
    if (args.list_id) {
      const list = findListByPrefix(db, args.list_id);
      if (!list) return err(`no list matching ${args.list_id}`);
      listId = list.id;
    } else {
      const memberships = membershipsForContact(db, contact.id);
      if (memberships.length === 0) return err('contact is not in any list — pass list_id');
      if (memberships.length > 1) {
        return err(`contact is in ${memberships.length} lists — pass list_id`);
      }
      listId = memberships[0]!.list_id;
    }

    const interaction = logInteraction(db, {
      list_id: listId,
      contact_id: contact.id,
      channel_type: args.direction === 'note' ? 'other' : (args.channel_type ?? 'other'),
      direction: args.direction,
      subject: args.subject ?? null,
      body: args.body ?? null,
      occurred_at: parseOccurredAt(args.occurred_at),
    });

    return ok({ interaction });
  },
};
