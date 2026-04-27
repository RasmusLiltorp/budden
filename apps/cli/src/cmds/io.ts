import { readFileSync } from 'node:fs';
import { exportCsv, importCsv } from '@budden/core';
import { Command } from 'commander';
import { withDb } from '../db';
import { requireList } from '../resolve';
import { isJson, ok, printJson } from '../util';

export const importCmd = new Command('import').description('Import data');

importCmd
  .command('csv')
  .argument('<file>')
  .requiredOption('--list <id>')
  .action((file: string, opts: { list: string }) => {
    withDb((db) => {
      const list = requireList(db, opts.list);
      const text = readFileSync(file, 'utf8');
      const result = importCsv(db, text, { listId: list.id });
      if (isJson()) return printJson(result);
      ok(
        `Imported into ${list.name}: ${result.created} created, ${result.linked} linked, ${result.duplicates} duplicates`,
      );
    });
  });

export const exportCmd = new Command('export').description('Export data');

exportCmd
  .command('csv')
  .requiredOption('--list <id>')
  .action((opts: { list: string }) => {
    withDb((db) => {
      const list = requireList(db, opts.list);
      process.stdout.write(exportCsv(db, list.id));
    });
  });
