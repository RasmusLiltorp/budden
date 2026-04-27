import { loadConfig } from '@budden/config';
import { type DB, runMigrations } from '@budden/core';

let instance: DB | null = null;

export const db = (): DB => {
  if (!instance) instance = runMigrations(loadConfig().db.path);
  return instance;
};
