import { assignToList } from '@budden/core';
import type { Priority } from '@budden/shared';
import { Command } from 'commander';
import { withDb } from '../../db';
import { requireContact, requireList } from '../../resolve';
import { ok } from '../../util';

export const assignCmd = new Command('assign')
  .argument('<contact-id>')
  .requiredOption('--list <id>')
  .option('--priority <p>')
  .action((contactId: string, opts: { list: string; priority?: Priority }) => {
    withDb((db) => {
      const contact = requireContact(db, contactId);
      const list = requireList(db, opts.list);
      assignToList(db, {
        list_id: list.id,
        contact_id: contact.id,
        priority: opts.priority ?? null,
      });
      ok(`Assigned ${contact.full_name} to ${list.name}`);
    });
  });
