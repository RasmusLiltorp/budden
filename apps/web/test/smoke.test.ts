import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { saveConfig } from '@budden/config';
import { runMigrations } from '@budden/core';

const here = dirname(fileURLToPath(import.meta.url));
const buildEntry = resolve(here, '..', 'build', 'index.js');

let dir: string;
let proc: ReturnType<typeof Bun.spawn>;
let port: number;
let cookie = '';
const TOKEN = 'web-smoke-token';

const findFreePort = async (): Promise<number> => {
  const server = Bun.serve({ port: 0, fetch: () => new Response('') });
  const p = server.port;
  server.stop(true);
  return p;
};

const waitForReady = async (url: string, timeoutMs = 5000): Promise<void> => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status > 0) return;
    } catch {
      // not ready yet
    }
    await Bun.sleep(50);
  }
  throw new Error(`server at ${url} did not start within ${timeoutMs}ms`);
};

beforeAll(async () => {
  if (!existsSync(buildEntry)) {
    throw new Error(`web build not found at ${buildEntry} — run 'bun run build:web' first`);
  }

  dir = mkdtempSync(join(tmpdir(), 'budden-web-smoke-'));
  const dbPath = join(dir, 'budden.db');
  const configPath = join(dir, 'config.toml');

  process.env.BUDDEN_DB_PATH = dbPath;
  process.env.BUDDEN_CONFIG = configPath;

  saveConfig(
    {
      db: { path: dbPath },
      server: { port: 3000, host: '0.0.0.0', token: TOKEN },
      mcp: { enabled: true, http_enabled: true },
    },
    configPath,
  );

  const db = runMigrations(dbPath);
  db.$client.close();

  port = await findFreePort();
  proc = Bun.spawn(['bun', buildEntry], {
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      ORIGIN: `http://127.0.0.1:${port}`,
      BUDDEN_DB_PATH: dbPath,
      BUDDEN_CONFIG: configPath,
    },
    stdout: 'ignore',
    stderr: 'pipe',
  });

  await waitForReady(`http://127.0.0.1:${port}/login`);
});

afterAll(() => {
  proc.kill();
  rmSync(dir, { recursive: true, force: true });
});

describe('web smoke', () => {
  const url = (path: string) => `http://127.0.0.1:${port}${path}`;

  test('protected page redirects to /login', async () => {
    const res = await fetch(url('/'), { redirect: 'manual' });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toContain('/login');
  });

  test('login with valid token sets a session cookie', async () => {
    const res = await fetch(url('/login'), {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        origin: url(''),
      },
      body: `token=${encodeURIComponent(TOKEN)}`,
    });
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('budden_token=');
    cookie = setCookie!.split(';')[0]!;
  });

  test('authed dashboard renders', async () => {
    const res = await fetch(url('/'), { headers: { cookie } });
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('Dashboard');
  });

  test('list create + detail flow', async () => {
    const create = await fetch(url('/lists?/create'), {
      method: 'POST',
      redirect: 'manual',
      headers: {
        cookie,
        'content-type': 'application/x-www-form-urlencoded',
        origin: url(''),
      },
      body: 'name=SmokeList&goal=test',
    });
    expect([200, 303]).toContain(create.status);

    const lists = await fetch(url('/lists'), { headers: { cookie } });
    const html = await lists.text();
    expect(html).toContain('SmokeList');
  });

  test('csv export returns text/csv with attachment', async () => {
    const lists = await fetch(url('/lists'), { headers: { cookie } });
    const html = await lists.text();
    const match = html.match(/\/lists\/([0-9A-Z]+)/);
    expect(match).toBeTruthy();
    const listId = match![1]!;

    const csv = await fetch(url(`/lists/${listId}/export.csv`), { headers: { cookie } });
    expect(csv.status).toBe(200);
    expect(csv.headers.get('content-type')).toContain('text/csv');
    expect(csv.headers.get('content-disposition')).toContain('attachment');
    expect(await csv.text()).toContain('id,name,role,email,linkedin,notes');
  });
});
