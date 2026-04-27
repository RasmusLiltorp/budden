import { describe, expect, test } from 'bun:test';
import { exportCsv, importCsv, parseCsv } from '../src/io';
import { createList } from '../src/repos/lists';
import { membershipsForList } from '../src/repos/memberships';
import { makeTestDb } from '../src/test-helpers';

describe('csv parsing', () => {
  test('handles quoted commas', () => {
    const rows = parseCsv('name,role\n"Smith, Jane","CEO, Founder"');
    expect(rows[0]).toEqual({ name: 'Smith, Jane', role: 'CEO, Founder' });
  });
});

describe('csv import', () => {
  test('creates contacts and dedupes by channel', () => {
    const db = makeTestDb();
    const l = createList(db, { name: 'L' });
    const csv = `name,email,linkedin,company,role
Jane Doe,jane@acme.io,,Acme,CTO
John Smith,,linkedin.com/in/jsmith,Beta,CEO
Jane Dupe,jane@acme.io,,Acme,Other`;
    const r = importCsv(db, csv, { listId: l.id });
    expect(r.created).toBe(2);
    expect(r.duplicates).toBe(1);
    expect(membershipsForList(db, l.id).length).toBe(2);
  });
});

describe('csv export', () => {
  test('round-trip', () => {
    const db = makeTestDb();
    const l = createList(db, { name: 'L' });
    const csv = 'name,email\nA,a@x.io\nB,b@y.io';
    importCsv(db, csv, { listId: l.id });
    const out = exportCsv(db, l.id);
    expect(out.includes('a@x.io')).toBe(true);
    expect(out.includes('b@y.io')).toBe(true);
  });
});
