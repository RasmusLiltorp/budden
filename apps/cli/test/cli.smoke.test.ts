import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repoRoot = `${import.meta.dir}/../../..`;
const cliEntry = `${repoRoot}/apps/cli/src/index.ts`;

let dir: string;
let dbPath: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'budden-test-'));
  dbPath = join(dir, 'budden.db');
});

const run = async (...args: string[]) => {
  const proc = Bun.spawn(['bun', 'run', cliEntry, ...args], {
    env: { ...process.env, BUDDEN_DB_PATH: dbPath, BUDDEN_CONFIG: join(dir, 'config.toml') },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;
  return { stdout, stderr, code };
};

describe('cli smoke', () => {
  test('init -> list create -> contact add -> log -> today', async () => {
    let r = await run('init');
    expect(r.code).toBe(0);

    r = await run('list', 'create', 'Test List', '--json');
    expect(r.code).toBe(0);
    const list = JSON.parse(r.stdout);
    expect(list.name).toBe('Test List');

    r = await run(
      'contact',
      'add',
      '--name',
      'Jane Doe',
      '--list',
      list.id,
      '--priority',
      'high',
      '--json',
    );
    expect(r.code).toBe(0);
    const contact = JSON.parse(r.stdout);
    expect(contact.full_name).toBe('Jane Doe');

    r = await run('today', '--list', list.id, '--json');
    expect(r.code).toBe(0);
    const today = JSON.parse(r.stdout);
    expect(today.length).toBe(1);
    expect(today[0].contact.id).toBe(contact.id);

    r = await run(
      'log',
      contact.id,
      '--list',
      list.id,
      '--channel',
      'linkedin',
      '--body',
      'hello',
      '--json',
    );
    expect(r.code).toBe(0);

    r = await run('today', '--list', list.id, '--json');
    expect(JSON.parse(r.stdout).length).toBe(0);
  });
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});
