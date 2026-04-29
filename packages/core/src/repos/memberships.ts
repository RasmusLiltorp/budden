import { type ListMembership, type MembershipStatus, newId, type Priority } from '@budden/shared';
import { and, eq } from 'drizzle-orm';
import type { DB } from '../db/client';
import { list_memberships } from '../db/schema';
import { events } from '../events';
import { assertTransition } from '../status';

const rowToMembership = (r: typeof list_memberships.$inferSelect): ListMembership => ({
  id: r.id,
  list_id: r.list_id,
  contact_id: r.contact_id,
  status: r.status as MembershipStatus,
  priority: (r.priority as Priority | null) ?? null,
  assigned_to: r.assigned_to,
  added_at: r.added_at,
  status_changed_at: r.status_changed_at,
});

export const assignToList = (
  db: DB,
  input: {
    list_id: string;
    contact_id: string;
    priority?: Priority | null;
    status?: MembershipStatus;
  },
): ListMembership => {
  const existing = db
    .select()
    .from(list_memberships)
    .where(
      and(
        eq(list_memberships.list_id, input.list_id),
        eq(list_memberships.contact_id, input.contact_id),
      ),
    )
    .get();
  if (existing) {
    if (input.priority !== undefined) {
      db.update(list_memberships)
        .set({ priority: input.priority })
        .where(eq(list_memberships.id, existing.id))
        .run();
    }
    return rowToMembership({ ...existing, priority: input.priority ?? existing.priority });
  }
  const id = newId();
  const now = new Date();
  db.insert(list_memberships)
    .values({
      id,
      list_id: input.list_id,
      contact_id: input.contact_id,
      status: input.status ?? 'not_contacted',
      priority: input.priority ?? null,
      assigned_to: null,
      added_at: now,
      status_changed_at: now,
    })
    .run();
  return rowToMembership(
    db.select().from(list_memberships).where(eq(list_memberships.id, id)).get()!,
  );
};

export const getMembership = (db: DB, listId: string, contactId: string): ListMembership | null => {
  const r = db
    .select()
    .from(list_memberships)
    .where(and(eq(list_memberships.list_id, listId), eq(list_memberships.contact_id, contactId)))
    .get();
  return r ? rowToMembership(r) : null;
};

export const setStatus = (
  db: DB,
  listId: string,
  contactId: string,
  to: MembershipStatus,
): ListMembership => {
  const existing = getMembership(db, listId, contactId);
  if (!existing) throw new Error('no membership for contact in list');
  if (existing.status === to) return existing;
  assertTransition(existing.status, to);
  const now = new Date();
  db.update(list_memberships)
    .set({ status: to, status_changed_at: now })
    .where(eq(list_memberships.id, existing.id))
    .run();
  const updated = { ...existing, status: to, status_changed_at: now };
  events.emit('membership.status_changed', {
    membership: updated,
    from: existing.status,
    to,
  });
  return updated;
};

export const membershipsForList = (db: DB, listId: string): ListMembership[] =>
  db
    .select()
    .from(list_memberships)
    .where(eq(list_memberships.list_id, listId))
    .all()
    .map(rowToMembership);

export const membershipsForContact = (db: DB, contactId: string): ListMembership[] =>
  db
    .select()
    .from(list_memberships)
    .where(eq(list_memberships.contact_id, contactId))
    .all()
    .map(rowToMembership);
