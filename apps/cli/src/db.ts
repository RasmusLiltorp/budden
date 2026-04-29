import { existsSync } from 'node:fs';
import { loadConfig } from '@budden/config';
import { type DB, openDb, runMigrations } from '@budden/core';
import { fail } from './util';

export const getDb = (): DB => {
  const cfg = loadConfig();
  if (!existsSync(cfg.db.path)) {
    fail(`database not found at ${cfg.db.path} — run \`budden init\` first`);
  }
  return openDb(cfg.db.path);
};

export const initDb = (): DB => runMigrations();

export const withDb = <T>(fn: (db: DB) => T): T => {
  const db = getDb();
  try {
    return fn(db);
  } finally {
    db.$client.close();
  }
};
