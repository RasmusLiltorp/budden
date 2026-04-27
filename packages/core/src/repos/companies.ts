import { type Company, newId } from '@budden/shared';
import { eq, like } from 'drizzle-orm';
import type { DB } from '../db/client';
import { companies } from '../db/schema';

const rowToCompany = (r: typeof companies.$inferSelect): Company => ({
  id: r.id,
  name: r.name,
  website: r.website,
  description: r.description,
  notes: r.notes,
  metadata: r.metadata ?? null,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

export const createCompany = (
  db: DB,
  input: {
    name: string;
    website?: string | null;
    description?: string | null;
    notes?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Company => {
  const id = newId();
  const now = new Date();
  db.insert(companies)
    .values({
      id,
      name: input.name,
      website: input.website ?? null,
      description: input.description ?? null,
      notes: input.notes ?? null,
      metadata: input.metadata ?? null,
      created_at: now,
      updated_at: now,
    })
    .run();
  return rowToCompany(db.select().from(companies).where(eq(companies.id, id)).get()!);
};

export const findCompanyByName = (db: DB, name: string): Company | null => {
  const r = db.select().from(companies).where(eq(companies.name, name)).get();
  return r ? rowToCompany(r) : null;
};

export const findOrCreateCompany = (db: DB, name: string): Company => {
  return findCompanyByName(db, name) ?? createCompany(db, { name });
};

export const getCompany = (db: DB, id: string): Company | null => {
  const r = db.select().from(companies).where(eq(companies.id, id)).get();
  return r ? rowToCompany(r) : null;
};

export const searchCompanies = (db: DB, q: string): Company[] => {
  const pat = `%${q}%`;
  return db.select().from(companies).where(like(companies.name, pat)).all().map(rowToCompany);
};
