import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { type BunSQLiteDatabase, drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

export type DB = BunSQLiteDatabase<typeof schema> & { $client: Database };

export const openDb = (path: string): DB => {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const sqlite = new Database(path, { create: true });
  sqlite.run('PRAGMA journal_mode = WAL;');
  sqlite.run('PRAGMA foreign_keys = ON;');
  return drizzle(sqlite, { schema }) as DB;
};

export const openMemoryDb = (): DB => openDb(':memory:');

export { schema };
