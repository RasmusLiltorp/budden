import { membershipsForList, setStatus } from '@budden/core';
import { MembershipStatus } from '@budden/shared';
import { Command } from 'commander';
import { withDb } from '../db';
import { requireContact, requireList } from '../resolve';
import { ok } from '../util';

export const statusCmd = new Command('status').description('Manage membership status');

statusCmd
  .command('set')
  .argument('<contact-id>')
  .argument('<status>', 'new status')
  .requiredOption('--list <id>')
  .action((contactId: string, statusArg: string, opts: { list: string }) => {
    withDb((db) => {
      const contact = requireContact(db, contactId);
      const list = requireList(db, opts.list);
      const to = MembershipStatus.parse(statusArg);
      const m = setStatus(db, list.id, contact.id, to);
      ok(`${contact.full_name} → ${m.status} in ${list.name}`);
    });
  });

statusCmd
  .command('bulk')
  .description('Bulk-update status for a list')
  .requiredOption('--list <id>')
  .requiredOption('--from <status>')
  .requiredOption('--to <status>')
  .action((opts: { list: string; from: string; to: string }) => {
    withDb((db) => {
      const list = requireList(db, opts.list);
      const from = MembershipStatus.parse(opts.from);
      const to = MembershipStatus.parse(opts.to);
      const matching = membershipsForList(db, list.id).filter((m) => m.status === from);
      let updated = 0;
      for (const m of matching) {
        try {
          setStatus(db, list.id, m.contact_id, to);
          updated++;
        } catch {
          // setStatus throws on invalid transitions; bulk skips them by design.
        }
      }
      ok(`Updated ${updated} contacts in ${list.name}: ${from} → ${to}`);
    });
  });
