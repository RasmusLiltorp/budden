import { type Direction, type Interaction, type InteractionChannel, newId } from '@budden/shared';
import { and, desc, eq, like, or } from 'drizzle-orm';
import type { DB } from '../db/client';
import { interactions } from '../db/schema';

const rowToInteraction = (r: typeof interactions.$inferSelect): Interaction => ({
  id: r.id,
  list_id: r.list_id,
  contact_id: r.contact_id,
  channel_type: r.channel_type as InteractionChannel,
  direction: r.direction as Direction,
  subject: r.subject,
  body: r.body,
  occurred_at: r.occurred_at,
  created_at: r.created_at,
  metadata: r.metadata ?? null,
});

export const insertInteraction = (
  db: DB,
  input: {
    list_id: string;
    contact_id: string;
    channel_type: InteractionChannel;
    direction: Direction;
    subject?: string | null;
    body?: string | null;
    occurred_at?: Date;
    metadata?: Record<string, unknown> | null;
  },
): Interaction => {
  const id = newId();
  const now = new Date();
  db.insert(interactions)
    .values({
      id,
      list_id: input.list_id,
      contact_id: input.contact_id,
      channel_type: input.channel_type,
      direction: input.direction,
      subject: input.subject ?? null,
      body: input.body ?? null,
      occurred_at: input.occurred_at ?? now,
      created_at: now,
      metadata: input.metadata ?? null,
    })
    .run();
  return rowToInteraction(db.select().from(interactions).where(eq(interactions.id, id)).get()!);
};

export const interactionsForContact = (
  db: DB,
  contactId: string,
  opts: { listId?: string } = {},
): Interaction[] => {
  const where = opts.listId
    ? and(eq(interactions.contact_id, contactId), eq(interactions.list_id, opts.listId))
    : eq(interactions.contact_id, contactId);
  return db
    .select()
    .from(interactions)
    .where(where)
    .orderBy(desc(interactions.occurred_at))
    .all()
    .map(rowToInteraction);
};

export const lastInteraction = (
  db: DB,
  listId: string,
  contactId: string,
  direction?: Direction,
): Interaction | null => {
  const where = direction
    ? and(
        eq(interactions.list_id, listId),
        eq(interactions.contact_id, contactId),
        eq(interactions.direction, direction),
      )
    : and(eq(interactions.list_id, listId), eq(interactions.contact_id, contactId));
  const r = db
    .select()
    .from(interactions)
    .where(where)
    .orderBy(desc(interactions.occurred_at))
    .limit(1)
    .get();
  return r ? rowToInteraction(r) : null;
};

export const searchInteractions = (db: DB, q: string): Interaction[] => {
  const pat = `%${q}%`;
  return db
    .select()
    .from(interactions)
    .where(or(like(interactions.body, pat), like(interactions.subject, pat)))
    .all()
    .map(rowToInteraction);
};
