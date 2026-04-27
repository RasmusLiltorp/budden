import { addChannel } from '@budden/core';
import { ChannelType } from '@budden/shared';
import { Command } from 'commander';
import { withDb } from '../../db';
import { requireContact } from '../../resolve';
import { ok } from '../../util';

type AddChannelOpts = {
  type: string;
  handle: string;
  primary?: boolean;
  verified?: boolean;
};

export const channelCmd = new Command('channel').description('Manage contact channels');

channelCmd
  .command('add')
  .argument('<contact-id>')
  .requiredOption('--type <type>', 'email|linkedin|twitter|discord|phone|other')
  .requiredOption('--handle <handle>')
  .option('--primary', 'mark as primary')
  .option('--verified', 'mark as verified')
  .action((contactId: string, opts: AddChannelOpts) => {
    withDb((db) => {
      const contact = requireContact(db, contactId);
      const channel = addChannel(db, {
        contact_id: contact.id,
        type: ChannelType.parse(opts.type),
        handle: opts.handle,
        is_primary: opts.primary,
        verified: opts.verified,
      });
      ok(`Added ${channel.type} channel for ${contact.full_name}`);
    });
  });
