import { getFollowupQueue, getInbox, getTodayQueue } from '@budden/core';
import { Command } from 'commander';
import { withDb } from '../db';
import { requireList } from '../resolve';
import { formatId, isJson, padRight, printJson, truncate } from '../util';

const printRow = (id: string, name: string, trailing: string): void => {
  console.log(`${padRight(formatId(id), 10)}${padRight(truncate(name, 26), 28)}${trailing}`);
};

export const todayCmd = new Command('today')
  .description('High-priority not-yet-contacted leads')
  .requiredOption('--list <id>')
  .action((opts: { list: string }) => {
    withDb((db) => {
      const list = requireList(db, opts.list);
      const items = getTodayQueue(db, list.id);
      if (isJson()) return printJson(items);
      if (items.length === 0) return console.log('Inbox zero. Nothing in the today queue.');
      console.log(`Today — ${list.name} (${items.length})`);
      console.log(`${padRight('ID', 10)}${padRight('NAME', 28)}PRIORITY`);
      for (const it of items)
        printRow(it.contact.id, it.contact.full_name, it.membership.priority ?? '');
    });
  });

export const followupsCmd = new Command('followups')
  .description('Contacted but no reply, past lookback')
  .requiredOption('--list <id>')
  .option('--days <n>', 'lookback days', '5')
  .action((opts: { list: string; days: string }) => {
    withDb((db) => {
      const list = requireList(db, opts.list);
      const items = getFollowupQueue(db, list.id, Number(opts.days));
      if (isJson()) return printJson(items);
      if (items.length === 0) return console.log('No follow-ups due.');
      console.log(`Follow-ups — ${list.name} (${items.length})`);
      console.log(`${padRight('ID', 10)}${padRight('NAME', 28)}DAYS`);
      for (const it of items)
        printRow(it.contact.id, it.contact.full_name, String(it.daysSinceLastContact));
    });
  });

export const inboxCmd = new Command('inbox')
  .description('Contacts who replied, awaiting response')
  .option('--list <id>')
  .action((opts: { list?: string }) => {
    withDb((db) => {
      const listId = opts.list ? requireList(db, opts.list).id : undefined;
      const items = getInbox(db, listId);
      if (isJson()) return printJson(items);
      if (items.length === 0) return console.log('Inbox zero.');
      console.log(`Inbox (${items.length})`);
      for (const it of items) console.log(`  ${formatId(it.contact.id)}  ${it.contact.full_name}`);
    });
  });
