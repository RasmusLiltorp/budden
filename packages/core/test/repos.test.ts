import { describe, expect, test } from 'bun:test';
import { addChannel, channelsForContact } from '../src/repos/channels';
import { createCompany, findOrCreateCompany } from '../src/repos/companies';
import { createContact, getContact } from '../src/repos/contacts';
import { archiveList, createList, getList, listLists } from '../src/repos/lists';
import { assignToList, getMembership, setStatus } from '../src/repos/memberships';
import { makeTestDb } from '../src/test-helpers';

describe('lists repo', () => {
  test('create + get + list + archive', () => {
    const db = makeTestDb();
    const a = createList(db, { name: 'A' });
    createList(db, { name: 'B' });
    expect(getList(db, a.id)?.name).toBe('A');
    expect(listLists(db).length).toBe(2);
    archiveList(db, a.id);
    expect(listLists(db).length).toBe(1);
    expect(listLists(db, { includeArchived: true }).length).toBe(2);
  });
});

describe('contacts + channels + companies', () => {
  test('create contact with company and channel', () => {
    const db = makeTestDb();
    const co = createCompany(db, { name: 'Acme' });
    const c = createContact(db, { full_name: 'Jane', company_id: co.id });
    addChannel(db, { contact_id: c.id, type: 'email', handle: 'jane@acme.io', is_primary: true });
    expect(getContact(db, c.id)?.full_name).toBe('Jane');
    const channels = channelsForContact(db, c.id);
    expect(channels.length).toBe(1);
    expect(channels[0]!.is_primary).toBe(true);
  });

  test('findOrCreateCompany dedupes', () => {
    const db = makeTestDb();
    const a = findOrCreateCompany(db, 'Acme');
    const b = findOrCreateCompany(db, 'Acme');
    expect(a.id).toBe(b.id);
  });

  test('only one primary channel per contact', () => {
    const db = makeTestDb();
    const c = createContact(db, { full_name: 'Jane' });
    addChannel(db, { contact_id: c.id, type: 'email', handle: 'a@x.io', is_primary: true });
    addChannel(db, { contact_id: c.id, type: 'linkedin', handle: 'jane', is_primary: true });
    const ch = channelsForContact(db, c.id);
    expect(ch.filter((x) => x.is_primary).length).toBe(1);
  });
});

describe('memberships + status', () => {
  test('assign + setStatus + transition validation', () => {
    const db = makeTestDb();
    const list = createList(db, { name: 'L' });
    const c = createContact(db, { full_name: 'Jane' });
    const m = assignToList(db, { list_id: list.id, contact_id: c.id, priority: 'high' });
    expect(m.status).toBe('not_contacted');

    const m2 = setStatus(db, list.id, c.id, 'contacted');
    expect(m2.status).toBe('contacted');
    expect(m2.status_changed_at.getTime()).toBeGreaterThanOrEqual(m.status_changed_at.getTime());

    expect(() => setStatus(db, list.id, c.id, 'closed_won')).toThrow();
  });

  test('assignToList is idempotent', () => {
    const db = makeTestDb();
    const list = createList(db, { name: 'L' });
    const c = createContact(db, { full_name: 'Jane' });
    const a = assignToList(db, { list_id: list.id, contact_id: c.id });
    const b = assignToList(db, { list_id: list.id, contact_id: c.id });
    expect(a.id).toBe(b.id);
    expect(getMembership(db, list.id, c.id)?.id).toBe(a.id);
  });
});
