import { describe, expect, test } from 'bun:test';
import { logInteraction } from '../src/ops/logInteraction';
import {
  membershipsWithContactsForList,
  membershipsWithListsForContact,
} from '../src/queries/memberships-with';
import { createContact } from '../src/repos/contacts';
import { createList } from '../src/repos/lists';
import { assignToList } from '../src/repos/memberships';
import { makeTestDb } from '../src/test-helpers';

describe('membershipsWithContactsForList', () => {
  test('joins contact rows and orders by priority then name', () => {
    const db = makeTestDb();
    const list = createList(db, { name: 'L' });
    const lowZ = createContact(db, { full_name: 'Zoe' });
    const lowA = createContact(db, { full_name: 'Alice' });
    const high = createContact(db, { full_name: 'Carl' });
    assignToList(db, { list_id: list.id, contact_id: lowZ.id, priority: 'low' });
    assignToList(db, { list_id: list.id, contact_id: lowA.id, priority: 'low' });
    assignToList(db, { list_id: list.id, contact_id: high.id, priority: 'high' });

    const rows = membershipsWithContactsForList(db, list.id);
    expect(rows.map((r) => r.contact.full_name)).toEqual(['Carl', 'Alice', 'Zoe']);
  });

  test('returns empty array for unknown list', () => {
    const db = makeTestDb();
    expect(membershipsWithContactsForList(db, 'no-such-list')).toEqual([]);
  });
});

describe('membershipsWithListsForContact', () => {
  test('joins list rows for every membership a contact has', () => {
    const db = makeTestDb();
    const a = createList(db, { name: 'List A' });
    const b = createList(db, { name: 'List B' });
    const contact = createContact(db, { full_name: 'Jane' });
    assignToList(db, { list_id: a.id, contact_id: contact.id });
    assignToList(db, { list_id: b.id, contact_id: contact.id });

    const rows = membershipsWithListsForContact(db, contact.id);
    expect(rows.length).toBe(2);
    expect(rows.map((r) => r.list.name).sort()).toEqual(['List A', 'List B']);
  });

  test('reflects status transitions from logInteraction', () => {
    const db = makeTestDb();
    const list = createList(db, { name: 'L' });
    const contact = createContact(db, { full_name: 'Jane' });
    assignToList(db, { list_id: list.id, contact_id: contact.id });
    logInteraction(db, {
      list_id: list.id,
      contact_id: contact.id,
      channel_type: 'email',
      direction: 'outbound',
      body: 'hi',
    });

    const rows = membershipsWithListsForContact(db, contact.id);
    expect(rows[0]!.membership.status).toBe('contacted');
  });
});
