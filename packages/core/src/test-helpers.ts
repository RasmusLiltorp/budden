import { type DB, openMemoryDb } from './db/client';
import { applyMigrations } from './db/migrate';

export const makeTestDb = (): DB => {
  const db = openMemoryDb();
  applyMigrations(db);
  return db;
};
