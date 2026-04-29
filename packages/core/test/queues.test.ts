import { describe, expect, test } from 'bun:test';
import { daysAgo } from '@budden/shared';
import { eq } from 'drizzle-orm';
import { list_memberships } from '../src/db/schema';
import { logInteraction } from '../src/ops/logInteraction';
import { getFollowupQueue, getInbox, getTodayQueue } from '../src/queries/queues';
import { createContact } from '../src/repos/contacts';
import { createList } from '../src/repos/lists';
import { assignToList } from '../src/repos/memberships';
import { makeTestDb } from '../src/test-helpers';

describe('today queue', () => {
  test('returns only not_contacted, sorted by priority', () => {
    const db = makeTestDb();
    const l = createList(db, { name: 'L' });
    const a = createContact(db, { full_name: 'A' });
    const b = createContact(db, { full_name: 'B' });
    assignToList(db, { list_id: l.id, contact_id: a.id, priority: 'low' });
    assignToList(db, { list_id: l.id, contact_id: b.id, priority: 'high' });
    const items = getTodayQueue(db, l.id);
    expect(items.length).toBe(2);
    expect(items[0]!.contact.id).toBe(b.id);
  });
});

describe('followup queue', () => {
  test('flags contacts past lookback with no inbound', () => {
    const db = makeTestDb();
    const l = createList(db, { name: 'L' });
    const old = createContact(db, { full_name: 'Old' });
    const fresh = createContact(db, { full_name: 'Fresh' });
    assignToList(db, { list_id: l.id, contact_id: old.id });
    assignToList(db, { list_id: l.id, contact_id: fresh.id });

    logInteraction(db, {
      list_id: l.id,
      contact_id: old.id,
      channel_type: 'email',
      direction: 'outbound',
      body: 'hi',
      occurred_at: daysAgo(10),
    });
    logInteraction(db, {
      list_id: l.id,
      contact_id: fresh.id,
      channel_type: 'email',
      direction: 'outbound',
      body: 'hi',
    });

    db.update(list_memberships)
      .set({ status_changed_at: daysAgo(10) })
      .where(eq(list_memberships.contact_id, old.id))
      .run();

    const items = getFollowupQueue(db, l.id, 5);
    expect(items.length).toBe(1);
    expect(items[0]!.contact.id).toBe(old.id);
  });
});

describe('inbox', () => {
  test('shows replied contacts', () => {
    const db = makeTestDb();
    const l = createList(db, { name: 'L' });
    const c = createContact(db, { full_name: 'Jane' });
    assignToList(db, { list_id: l.id, contact_id: c.id });
    logInteraction(db, {
      list_id: l.id,
      contact_id: c.id,
      channel_type: 'email',
      direction: 'outbound',
      body: 'hi',
    });
    logInteraction(db, {
      list_id: l.id,
      contact_id: c.id,
      channel_type: 'email',
      direction: 'inbound',
      body: 'hey',
    });
    const items = getInbox(db, l.id);
    expect(items.length).toBe(1);
    expect(items[0]!.contact.id).toBe(c.id);
  });
});
