import { archiveList, createList, listLists, membershipsForList } from '@budden/core';
import { Command } from 'commander';
import { withDb } from '../db';
import { requireList } from '../resolve';
import { formatId, isJson, ok, padRight, printJson, truncate } from '../util';

export const listCmd = new Command('list').description('Manage lists (campaigns/projects)');

listCmd
  .command('create')
  .argument('<name>', 'list name')
  .option('-d, --description <text>', 'description')
  .option('-g, --goal <text>', 'goal')
  .action((name: string, opts: { description?: string; goal?: string }) => {
    withDb((db) => {
      const list = createList(db, { name, description: opts.description, goal: opts.goal });
      if (isJson()) return printJson(list);
      ok(`Created list ${formatId(list.id)} — ${list.name}`);
    });
  });

listCmd
  .command('ls')
  .description('Show all lists')
  .option('--all', 'include archived')
  .action((opts: { all?: boolean }) => {
    withDb((db) => {
      const all = listLists(db, { includeArchived: opts.all });
      if (isJson()) return printJson(all);
      if (all.length === 0) return console.log('(no lists)');
      console.log(`${padRight('ID', 10)}${padRight('NAME', 32)}${padRight('STATUS', 10)}CONTACTS`);
      for (const l of all) {
        const count = membershipsForList(db, l.id).length;
        console.log(
          `${padRight(formatId(l.id), 10)}${padRight(truncate(l.name, 30), 32)}${padRight(l.status, 10)}${count}`,
        );
      }
    });
  });

listCmd
  .command('show')
  .argument('<id>')
  .action((id: string) => {
    withDb((db) => {
      const list = requireList(db, id);
      const memberships = membershipsForList(db, list.id);
      const counts: Record<string, number> = {};
      for (const m of memberships) counts[m.status] = (counts[m.status] ?? 0) + 1;
      if (isJson()) {
        return printJson({ ...list, contact_count: memberships.length, counts });
      }
      console.log(`${list.name}  [${formatId(list.id)}]`);
      if (list.goal) console.log(`Goal: ${list.goal}`);
      if (list.description) console.log(list.description);
      console.log(`\n${memberships.length} contacts`);
      for (const [status, n] of Object.entries(counts)) console.log(`  ${status}: ${n}`);
    });
  });

listCmd
  .command('archive')
  .argument('<id>')
  .action((id: string) => {
    withDb((db) => {
      const list = requireList(db, id);
      archiveList(db, list.id);
      ok(`Archived ${formatId(list.id)}`);
    });
  });
