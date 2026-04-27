import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createList, runMigrations } from '@budden/core';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createHttpHandler } from '../src/http';

let dir: string;
let server: ReturnType<typeof Bun.serve>;
let listId: string;
const TOKEN = 'integration-test-token';

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'budden-mcp-http-'));
  process.env.BUDDEN_DB_PATH = join(dir, 'budden.db');
  process.env.BUDDEN_CONFIG = join(dir, 'config.toml');

  const db = runMigrations(process.env.BUDDEN_DB_PATH);
  listId = createList(db, { name: 'HTTP Test List' }).id;
  db.$client.close();

  const handler = createHttpHandler({ token: TOKEN });
  server = Bun.serve({
    port: 0,
    fetch: async (req) => {
      const url = new URL(req.url);
      if (url.pathname !== '/mcp') return new Response('not found', { status: 404 });
      return handler(req);
    },
  });
});

afterEach(() => {
  server.stop(true);
  rmSync(dir, { recursive: true, force: true });
});

const baseUrl = () => new URL(`http://localhost:${server.port}/mcp`);

describe('mcp http transport', () => {
  test('rejects requests without bearer', async () => {
    const res = await fetch(baseUrl(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    expect(res.status).toBe(401);
  });

  test('rejects requests with wrong bearer', async () => {
    const res = await fetch(baseUrl(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        authorization: 'Bearer wrong',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    expect(res.status).toBe(401);
  });

  test('full client round trip with valid bearer', async () => {
    const transport = new StreamableHTTPClientTransport(baseUrl(), {
      requestInit: { headers: { authorization: `Bearer ${TOKEN}` } },
    });
    const client = new Client({ name: 'test', version: '0.0.1' });
    await client.connect(transport);

    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toContain('list_lists');

    const result = await client.callTool({ name: 'list_lists', arguments: {} });
    const text = (result.content as { type: string; text: string }[])[0]!.text;
    const parsed = JSON.parse(text);
    expect(parsed.lists.length).toBe(1);
    expect(parsed.lists[0].id).toBe(listId);

    await client.close();
  });
});
