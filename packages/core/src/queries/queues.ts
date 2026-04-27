import { type Contact, type ListMembership, daysAgo, daysBetween } from '@budden/shared';
import { and, desc, eq, lt } from 'drizzle-orm';
import type { DB } from '../db/client';
import { contacts, interactions, list_memberships } from '../db/schema';
import { PRIORITY_ORDER } from './memberships-with';

export type QueueItem = { membership: ListMembership; contact: Contact };

const toMembership = (r: typeof list_memberships.$inferSelect): ListMembership => ({
  id: r.id,
  list_id: r.list_id,
  contact_id: r.contact_id,
  status: r.status as ListMembership['status'],
  priority: (r.priority as ListMembership['priority']) ?? null,
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

export const getTodayQueue = (db: DB, listId: string): QueueItem[] => {
  const rows = db
    .select({ m: list_memberships, c: contacts })
    .from(list_memberships)
    .innerJoin(contacts, eq(contacts.id, list_memberships.contact_id))
    .where(and(eq(list_memberships.list_id, listId), eq(list_memberships.status, 'not_contacted')))
    .all();
  return rows
    .map((r) => ({ membership: toMembership(r.m), contact: toContact(r.c) }))
    .sort((a, b) => {
      const pa = PRIORITY_ORDER[a.membership.priority ?? 'low'] ?? 2;
      const pb = PRIORITY_ORDER[b.membership.priority ?? 'low'] ?? 2;
      if (pa !== pb) return pa - pb;
      return a.membership.added_at.getTime() - b.membership.added_at.getTime();
    });
};

export const getFollowupQueue = (
  db: DB,
  listId: string,
  lookbackDays = 5,
): (QueueItem & { daysSinceLastContact: number })[] => {
  const cutoff = daysAgo(lookbackDays);
  const rows = db
    .select({ m: list_memberships, c: contacts })
    .from(list_memberships)
    .innerJoin(contacts, eq(contacts.id, list_memberships.contact_id))
    .where(
      and(
        eq(list_memberships.list_id, listId),
        eq(list_memberships.status, 'contacted'),
        lt(list_memberships.status_changed_at, cutoff),
      ),
    )
    .all();
  const now = new Date();
  const items: (QueueItem & { daysSinceLastContact: number })[] = [];
  for (const r of rows) {
    const inbound = db
      .select()
      .from(interactions)
      .where(
        and(
          eq(interactions.list_id, listId),
          eq(interactions.contact_id, r.m.contact_id),
          eq(interactions.direction, 'inbound'),
        ),
      )
      .orderBy(desc(interactions.occurred_at))
      .limit(1)
      .get();
    if (inbound && inbound.occurred_at >= r.m.status_changed_at) continue;
    items.push({
      membership: toMembership(r.m),
      contact: toContact(r.c),
      daysSinceLastContact: daysBetween(r.m.status_changed_at, now),
    });
  }
  return items.sort((a, b) => b.daysSinceLastContact - a.daysSinceLastContact);
};

export const getInbox = (db: DB, listId?: string): QueueItem[] => {
  const where = listId
    ? and(eq(list_memberships.list_id, listId), eq(list_memberships.status, 'replied'))
    : eq(list_memberships.status, 'replied');
  const rows = db
    .select({ m: list_memberships, c: contacts })
    .from(list_memberships)
    .innerJoin(contacts, eq(contacts.id, list_memberships.contact_id))
    .where(where)
    .all();
  return rows
    .map((r) => ({ membership: toMembership(r.m), contact: toContact(r.c) }))
    .sort(
      (a, b) => b.membership.status_changed_at.getTime() - a.membership.status_changed_at.getTime(),
    );
};
