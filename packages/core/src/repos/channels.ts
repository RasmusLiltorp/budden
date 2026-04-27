import { type Channel, type ChannelType, newId } from '@budden/shared';
import { and, eq } from 'drizzle-orm';
import type { DB } from '../db/client';
import { channels } from '../db/schema';

const rowToChannel = (r: typeof channels.$inferSelect): Channel => ({
  id: r.id,
  contact_id: r.contact_id,
  type: r.type as ChannelType,
  handle: r.handle,
  is_primary: r.is_primary,
  verified: r.verified,
  created_at: r.created_at,
});

export const addChannel = (
  db: DB,
  input: {
    contact_id: string;
    type: ChannelType;
    handle: string;
    is_primary?: boolean;
    verified?: boolean;
  },
): Channel => {
  const id = newId();
  if (input.is_primary) {
    db.update(channels)
      .set({ is_primary: false })
      .where(eq(channels.contact_id, input.contact_id))
      .run();
  }
  db.insert(channels)
    .values({
      id,
      contact_id: input.contact_id,
      type: input.type,
      handle: input.handle,
      is_primary: input.is_primary ?? false,
      verified: input.verified ?? false,
      created_at: new Date(),
    })
    .run();
  return rowToChannel(db.select().from(channels).where(eq(channels.id, id)).get()!);
};

export const channelsForContact = (db: DB, contactId: string): Channel[] =>
  db.select().from(channels).where(eq(channels.contact_id, contactId)).all().map(rowToChannel);

export const findChannelByHandle = (db: DB, type: ChannelType, handle: string): Channel | null => {
  const r = db
    .select()
    .from(channels)
    .where(and(eq(channels.type, type), eq(channels.handle, handle)))
    .get();
  return r ? rowToChannel(r) : null;
};
