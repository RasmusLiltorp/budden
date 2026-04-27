import { logInteraction } from '@budden/core';
import { type Direction, InteractionChannel, parseOccurredAt } from '@budden/shared';
import { Command } from 'commander';
import { withDb } from '../db';
import { requireContact, resolveListForContact } from '../resolve';
import { formatId, isJson, ok, printJson } from '../util';

type LogOpts = {
  list?: string;
  channel: string;
  direction: string;
  subject?: string;
  body?: string;
  note?: string;
  at?: string;
};

export const logCmd = new Command('log')
  .description('Log an outbound interaction or note')
  .argument('<contact-id>')
  .option('--list <id>', 'list (required if contact is in multiple)')
  .option('--channel <type>', 'email|linkedin|twitter|discord|phone|in_person|other', 'other')
  .option('--direction <dir>', 'outbound|inbound|note', 'outbound')
  .option('--subject <s>')
  .option('--body <text>')
  .option('--note <text>', 'shorthand for --direction note --body')
  .option('--at <iso>', 'when the interaction occurred (defaults to now)')
  .action((contactId: string, opts: LogOpts) => {
    withDb((db) => {
      const contact = requireContact(db, contactId);
      const listId = resolveListForContact(db, contact.id, opts.list);
      const direction: Direction = opts.note ? 'note' : (opts.direction as Direction);
      const channel = direction === 'note' ? 'other' : InteractionChannel.parse(opts.channel);
      const interaction = logInteraction(db, {
        list_id: listId,
        contact_id: contact.id,
        channel_type: channel,
        direction,
        subject: opts.subject ?? null,
        body: opts.note ?? opts.body ?? null,
        occurred_at: parseOccurredAt(opts.at),
      });
      if (isJson()) return printJson(interaction);
      ok(`Logged ${direction} ${channel} to ${contact.full_name} [${formatId(interaction.id)}]`);
    });
  });

type ReplyOpts = { list?: string; channel: string; body: string; at?: string };

export const replyCmd = new Command('reply')
  .description('Log an inbound reply from a contact')
  .argument('<contact-id>')
  .option('--list <id>')
  .option('--channel <type>', 'channel they replied on', 'other')
  .requiredOption('--body <text>')
  .option('--at <iso>')
  .action((contactId: string, opts: ReplyOpts) => {
    withDb((db) => {
      const contact = requireContact(db, contactId);
      const listId = resolveListForContact(db, contact.id, opts.list);
      const interaction = logInteraction(db, {
        list_id: listId,
        contact_id: contact.id,
        channel_type: InteractionChannel.parse(opts.channel),
        direction: 'inbound',
        body: opts.body,
        occurred_at: parseOccurredAt(opts.at),
      });
      if (isJson()) return printJson(interaction);
      ok(`Logged reply from ${contact.full_name} [${formatId(interaction.id)}]`);
    });
  });
