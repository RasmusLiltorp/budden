import { type Contact, newId } from '@budden/shared';
import { eq, like, or } from 'drizzle-orm';
import type { DB } from '../db/client';
import { contacts } from '../db/schema';
import { events } from '../events';

const rowToContact = (r: typeof contacts.$inferSelect): Contact => ({
  id: r.id,
  company_id: r.company_id,
  full_name: r.full_name,
  role: r.role,
  notes: r.notes,
  metadata: r.metadata ?? null,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

export const createContact = (
  db: DB,
  input: {
    full_name: string;
    company_id?: string | null;
    role?: string | null;
    notes?: string | null;
    metadata?: Record<string, unknown> | null;
  },
  ctx?: { listId?: string },
): Contact => {
  const id = newId();
  const now = new Date();
  db.insert(contacts)
    .values({
      id,
      full_name: input.full_name,
      company_id: input.company_id ?? null,
      role: input.role ?? null,
      notes: input.notes ?? null,
      metadata: input.metadata ?? null,
      created_at: now,
      updated_at: now,
    })
    .run();
  const c = rowToContact(db.select().from(contacts).where(eq(contacts.id, id)).get()!);
  events.emit('contact.created', { contact: c, listId: ctx?.listId });
  return c;
};

export const getContact = (db: DB, id: string): Contact | null => {
  const r = db.select().from(contacts).where(eq(contacts.id, id)).get();
  return r ? rowToContact(r) : null;
};

export const findContactByPrefix = (db: DB, idOrPrefix: string): Contact | null => {
  const all = db.select().from(contacts).all();
  const matches = all.filter((r) => r.id === idOrPrefix || r.id.startsWith(idOrPrefix));
  if (matches.length !== 1) return null;
  return rowToContact(matches[0]!);
};

export const updateContact = (
  db: DB,
  id: string,
  patch: Partial<Pick<Contact, 'full_name' | 'role' | 'notes' | 'company_id'>> & {
    metadata?: Record<string, unknown> | null;
  },
): Contact | null => {
  db.update(contacts)
    .set({ ...patch, updated_at: new Date() })
    .where(eq(contacts.id, id))
    .run();
  return getContact(db, id);
};

export const searchContacts = (db: DB, q: string): Contact[] => {
  const pat = `%${q}%`;
  const rows = db
    .select()
    .from(contacts)
    .where(or(like(contacts.full_name, pat), like(contacts.notes, pat)))
    .all();
  return rows.map(rowToContact);
};

export const allContacts = (db: DB): Contact[] =>
  db.select().from(contacts).all().map(rowToContact);
