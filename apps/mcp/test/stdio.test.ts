import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createList, runMigrations } from '@budden/core';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const stdioEntry = `${import.meta.dir}/../src/stdio.ts`;

let dir: string;
let listId: string;
let client: Client;
let transport: StdioClientTransport;

const seedList = (dbPath: string): string => {
  const db = runMigrations(dbPath);
  const list = createList(db, { name: 'Test List', goal: 'book demos' });
  db.$client.close();
  return list.id;
};

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), 'budden-mcp-test-'));
  const dbPath = join(dir, 'budden.db');
  listId = seedList(dbPath);

  transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', stdioEntry],
    env: {
      ...process.env,
      BUDDEN_DB_PATH: dbPath,
      BUDDEN_CONFIG: join(dir, 'config.toml'),
    },
  });
  client = new Client({ name: 'test', version: '0.0.1' });
  await client.connect(transport);
});

afterEach(async () => {
  await client.close();
  rmSync(dir, { recursive: true, force: true });
});

type Content = { type: string; text: string };
const callJson = async (name: string, args: Record<string, unknown> = {}) => {
  const result = await client.callTool({ name, arguments: args });
  if (result.isError) {
    const text = (result.content as Content[])[0]?.text ?? '';
    throw new Error(`${name} returned error: ${text}`);
  }
  if (result.structuredContent) return result.structuredContent;
  return JSON.parse((result.content as Content[])[0]!.text);
};

describe('mcp stdio server', () => {
  test('list_tools returns the registry', async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    expect(names).toContain('list_lists');
    expect(names).toContain('create_list');
    expect(names).toContain('archive_list');
    expect(names).toContain('add_contact');
    expect(names).toContain('log_interaction');
    expect(names).toContain('get_today_queue');
    expect(names).toContain('search');
    expect(tools.length).toBe(15);
  });

  test('create_list + archive_list lifecycle', async () => {
    const created = (await callJson('create_list', {
      name: 'Q3 fundraising',
      goal: 'book 10 angel intros',
    })) as { list: { id: string; name: string; status: string } };
    expect(created.list.name).toBe('Q3 fundraising');
    expect(created.list.status).toBe('active');

    const before = (await callJson('list_lists')) as { lists: { id: string }[] };
    expect(before.lists.some((l) => l.id === created.list.id)).toBe(true);

    await callJson('archive_list', { id: created.list.id });

    const after = (await callJson('list_lists')) as { lists: { id: string }[] };
    expect(after.lists.some((l) => l.id === created.list.id)).toBe(false);

    const all = (await callJson('list_lists', { include_archived: true })) as {
      lists: { id: string; status: string }[];
    };
    const archived = all.lists.find((l) => l.id === created.list.id);
    expect(archived?.status).toBe('archived');
  });

  test('list_lists shows the seeded list', async () => {
    const result = (await callJson('list_lists')) as { lists: { id: string; name: string }[] };
    expect(result.lists.length).toBe(1);
    expect(result.lists[0]!.name).toBe('Test List');
  });

  test('add_contact + assignment + log_interaction transitions status', async () => {
    const added = (await callJson('add_contact', {
      full_name: 'Jake',
      company: 'Indifferent Broccoli',
      role: 'Founder',
      list_id: listId,
      priority: 'high',
    })) as { contact: { id: string; full_name: string } };

    expect(added.contact.full_name).toBe('Jake');

    const today = (await callJson('get_today_queue', { list_id: listId })) as {
      items: unknown[];
    };
    expect(today.items.length).toBe(1);

    await callJson('log_interaction', {
      contact_id: added.contact.id,
      list_id: listId,
      direction: 'outbound',
      channel_type: 'linkedin',
      body: 'hello',
    });

    const todayAfter = (await callJson('get_today_queue', { list_id: listId })) as {
      items: unknown[];
    };
    expect(todayAfter.items.length).toBe(0);
  });

  test('search returns structured results across entities', async () => {
    await callJson('add_contact', {
      full_name: 'Robin Brämer',
      notes: 'met at conference',
      list_id: listId,
    });
    const r = (await callJson('search', { query: 'Brämer' })) as {
      contacts: { full_name: string }[];
    };
    expect(r.contacts.length).toBe(1);
    expect(r.contacts[0]!.full_name).toBe('Robin Brämer');
  });

  test('error result on unknown list', async () => {
    const result = await client.callTool({
      name: 'get_list',
      arguments: { id: 'no-such-id' },
    });
    expect(result.isError).toBe(true);
  });
});
