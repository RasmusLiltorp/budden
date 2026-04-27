import { loadConfig } from '@budden/config';
import { type DB, openDb } from './client';
import { MIGRATIONS } from './migrations-bundle';

const ensureMetaTable = (db: DB) => {
  db.$client.run(
    'CREATE TABLE IF NOT EXISTS __budden_migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)',
  );
};

const isApplied = (db: DB, name: string): boolean => {
  const row = db.$client.query('SELECT name FROM __budden_migrations WHERE name = ?').get(name);
  return row !== null;
};

const recordApplied = (db: DB, name: string) => {
  db.$client.run('INSERT INTO __budden_migrations (name, applied_at) VALUES (?, ?)', [
    name,
    Date.now(),
  ]);
};

export const applyMigrations = (db: DB): number => {
  ensureMetaTable(db);
  let applied = 0;
  for (const m of MIGRATIONS) {
    if (isApplied(db, m.name)) continue;
    const statements = m.sql
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) db.$client.run(stmt);
    recordApplied(db, m.name);
    applied++;
  }
  return applied;
};

export const runMigrations = (dbPath?: string): DB => {
  const cfg = loadConfig({ dbPath });
  const db = openDb(cfg.db.path);
  applyMigrations(db);
  return db;
};

if (import.meta.main) {
  const db = runMigrations();
  console.log('migrations applied');
  db.$client.close();
}
