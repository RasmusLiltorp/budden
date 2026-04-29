import { type List, type ListStatus, newId } from '@budden/shared';
import { eq } from 'drizzle-orm';
import type { DB } from '../db/client';
import { lists } from '../db/schema';
import { events } from '../events';

const rowToList = (r: typeof lists.$inferSelect): List => ({
  id: r.id,
  name: r.name,
  description: r.description,
  goal: r.goal,
  status: r.status as ListStatus,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

export const createList = (
  db: DB,
  input: { name: string; description?: string | null; goal?: string | null },
): List => {
  const id = newId();
  const now = new Date();
  db.insert(lists)
    .values({
      id,
      name: input.name,
      description: input.description ?? null,
      goal: input.goal ?? null,
      status: 'active',
      created_at: now,
      updated_at: now,
    })
    .run();
  const list = rowToList(db.select().from(lists).where(eq(lists.id, id)).get()!);
  events.emit('list.created', { list });
  return list;
};

export const getList = (db: DB, id: string): List | null => {
  const r = db.select().from(lists).where(eq(lists.id, id)).get();
  return r ? rowToList(r) : null;
};

export const findListByPrefix = (db: DB, idOrPrefix: string): List | null => {
  const all = db.select().from(lists).all();
  const matches = all.filter((r) => r.id === idOrPrefix || r.id.startsWith(idOrPrefix));
  if (matches.length !== 1) return null;
  return rowToList(matches[0]!);
};

export const listLists = (db: DB, opts: { includeArchived?: boolean } = {}): List[] => {
  const rows = db.select().from(lists).all();
  return rows
    .filter((r) => opts.includeArchived || r.status === 'active')
    .map(rowToList)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
};

export const archiveList = (db: DB, id: string): void => {
  db.update(lists)
    .set({ status: 'archived', updated_at: new Date() })
    .where(eq(lists.id, id))
    .run();
};
