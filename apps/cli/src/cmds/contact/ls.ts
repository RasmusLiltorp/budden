import { membershipsForList } from '@budden/core';
import { Command } from 'commander';
import { withDb } from '../../db';
import { requireContact, requireList } from '../../resolve';
import { fail, formatId, isJson, padRight, printJson, truncate } from '../../util';

export const lsCmd = new Command('ls')
  .option('--list <id>', 'filter by list')
  .action((opts: { list?: string }) => {
    if (!opts.list) fail('--list required');
    withDb((db) => {
      const list = requireList(db, opts.list!);
      const rows = membershipsForList(db, list.id).flatMap((membership) => {
        const contact = requireContact(db, membership.contact_id);
        return [{ membership, contact }];
      });
      if (isJson()) return printJson(rows);
      console.log(`${padRight('ID', 10)}${padRight('NAME', 28)}${padRight('STATUS', 18)}PRIORITY`);
      for (const r of rows) {
        console.log(
          `${padRight(formatId(r.contact.id), 10)}${padRight(truncate(r.contact.full_name, 26), 28)}${padRight(r.membership.status, 18)}${r.membership.priority ?? ''}`,
        );
      }
    });
  });
