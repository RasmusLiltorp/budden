import { describe, expect, test } from 'bun:test';
import { events } from '../src/events';
import { logInteraction } from '../src/ops/logInteraction';
import { createContact } from '../src/repos/contacts';
import { interactionsForContact } from '../src/repos/interactions';
import { createList } from '../src/repos/lists';
import { assignToList, getMembership } from '../src/repos/memberships';
import { makeTestDb } from '../src/test-helpers';

describe('logInteraction', () => {
  test('outbound on not_contacted transitions to contacted', () => {
    const db = makeTestDb();
    const l = createList(db, { name: 'L' });
    const c = createContact(db, { full_name: 'Jane' });
    assignToList(db, { list_id: l.id, contact_id: c.id });
    logInteraction(db, {
      list_id: l.id,
      contact_id: c.id,
      channel_type: 'linkedin',
      direction: 'outbound',
      body: 'hi',
    });
    expect(getMembership(db, l.id, c.id)?.status).toBe('contacted');
  });

  test('inbound transitions to replied', () => {
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
    expect(getMembership(db, l.id, c.id)?.status).toBe('replied');
  });

  test('note does not change status', () => {
    const db = makeTestDb();
    const l = createList(db, { name: 'L' });
    const c = createContact(db, { full_name: 'Jane' });
    assignToList(db, { list_id: l.id, contact_id: c.id });
    logInteraction(db, {
      list_id: l.id,
      contact_id: c.id,
      channel_type: 'other',
      direction: 'note',
      body: 'mentioned at conference',
    });
    expect(getMembership(db, l.id, c.id)?.status).toBe('not_contacted');
    expect(interactionsForContact(db, c.id).length).toBe(1);
  });

  test('emits interaction.logged event', () => {
    const db = makeTestDb();
    const l = createList(db, { name: 'L' });
    const c = createContact(db, { full_name: 'Jane' });
    assignToList(db, { list_id: l.id, contact_id: c.id });
    let received = false;
    const off = events.on('interaction.logged', () => {
      received = true;
    });
    logInteraction(db, {
      list_id: l.id,
      contact_id: c.id,
      channel_type: 'email',
      direction: 'outbound',
      body: 'hi',
    });
    off();
    expect(received).toBe(true);
  });

  test('auto-creates membership if absent', () => {
    const db = makeTestDb();
    const l = createList(db, { name: 'L' });
    const c = createContact(db, { full_name: 'Jane' });
    logInteraction(db, {
      list_id: l.id,
      contact_id: c.id,
      channel_type: 'email',
      direction: 'outbound',
      body: 'hi',
    });
    expect(getMembership(db, l.id, c.id)?.status).toBe('contacted');
  });
});
