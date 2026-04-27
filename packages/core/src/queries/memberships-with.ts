import type { Contact, List, ListMembership, MembershipStatus, Priority } from '@budden/shared';
import { desc, eq } from 'drizzle-orm';
import type { DB } from '../db/client';
import { contacts, list_memberships, lists } from '../db/schema';

export const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

const toMembership = (r: typeof list_memberships.$inferSelect): ListMembership => ({
  id: r.id,
  list_id: r.list_id,
  contact_id: r.contact_id,
  status: r.status as MembershipStatus,
  priority: (r.priority as Priority | null) ?? null,
  assigned_to: r.assigned_to,
  added_at: r.added_at,
  status_changed_at: r.status_changed_at,
});

const toContact = (r: typeof contacts.$inferSelect): Contact => ({
  id: r.id,
  company_id: r.company_id,
  full_name: r.full_name,
  role: r.role,
  notes: r.notes,
  metadata: r.metadata ?? null,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

const toList = (r: typeof lists.$inferSelect): List => ({
  id: r.id,
  name: r.name,
  description: r.description,
  goal: r.goal,
  status: r.status as List['status'],
  created_at: r.created_at,
  updated_at: r.updated_at,
});

export type MembershipWithContact = { membership: ListMembership; contact: Contact };
export type MembershipWithList = { membership: ListMembership; list: List };

export const membershipsWithContactsForList = (db: DB, listId: string): MembershipWithContact[] => {
  const rows = db
    .select({ m: list_memberships, c: contacts })
    .from(list_memberships)
    .innerJoin(contacts, eq(contacts.id, list_memberships.contact_id))
    .where(eq(list_memberships.list_id, listId))
    .all();
  return rows
    .map((r) => ({ membership: toMembership(r.m), contact: toContact(r.c) }))
    .sort((a, b) => {
      const pa = PRIORITY_ORDER[a.membership.priority ?? 'low'] ?? 2;
      const pb = PRIORITY_ORDER[b.membership.priority ?? 'low'] ?? 2;
      return pa - pb || a.contact.full_name.localeCompare(b.contact.full_name);
    });
};

export const membershipsWithListsForContact = (db: DB, contactId: string): MembershipWithList[] => {
  const rows = db
    .select({ m: list_memberships, l: lists })
    .from(list_memberships)
    .innerJoin(lists, eq(lists.id, list_memberships.list_id))
    .where(eq(list_memberships.contact_id, contactId))
    .orderBy(desc(list_memberships.added_at))
    .all();
  return rows.map((r) => ({ membership: toMembership(r.m), list: toList(r.l) }));
};
