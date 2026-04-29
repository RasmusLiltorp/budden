import { assignToList, createContact, findOrCreateCompany } from '@budden/core';
import type { Priority } from '@budden/shared';
import { Command } from 'commander';
import { withDb } from '../../db';
import { requireList } from '../../resolve';
import { formatId, isJson, ok, printJson } from '../../util';

type AddOpts = {
  name: string;
  company?: string;
  role?: string;
  list?: string;
  priority?: Priority;
  notes?: string;
};

export const addCmd = new Command('add')
  .requiredOption('--name <name>', 'full name')
  .option('--company <name>', 'company name (created if missing)')
  .option('--role <role>')
  .option('--list <id>', 'add to a list (id or prefix)')
  .option('--priority <p>', 'priority: high|medium|low')
  .option('--notes <text>')
  .action((opts: AddOpts) => {
    withDb((db) => {
      const company = opts.company ? findOrCreateCompany(db, opts.company) : null;
      const list = opts.list ? requireList(db, opts.list) : null;
      const contact = createContact(
        db,
        {
          full_name: opts.name,
          company_id: company?.id ?? null,
          role: opts.role ?? null,
          notes: opts.notes ?? null,
        },
        { listId: list?.id },
      );
      if (list) {
        assignToList(db, {
          list_id: list.id,
          contact_id: contact.id,
          priority: opts.priority ?? null,
        });
      }
      if (isJson()) return printJson(contact);
      const suffix = company ? ` (${company.name})` : '';
      ok(`Added ${contact.full_name}${suffix} — ${formatId(contact.id)}`);
    });
  });
