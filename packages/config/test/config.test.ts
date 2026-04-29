import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getValue, loadConfig, saveConfig, setValue } from '../src';

let dir: string;
let configFile: string;

const ENV_KEYS = ['BUDDEN_CONFIG', 'BUDDEN_DB_PATH', 'BUDDEN_PORT', 'BUDDEN_HOST', 'BUDDEN_TOKEN'];
const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'budden-config-test-'));
  configFile = join(dir, 'config.toml');
  for (const k of ENV_KEYS) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
  process.env.BUDDEN_CONFIG = configFile;
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  rmSync(dir, { recursive: true, force: true });
});

describe('loadConfig precedence', () => {
  test('falls back to defaults when no file or env', () => {
    const cfg = loadConfig();
    expect(cfg.server.port).toBe(3000);
    expect(cfg.server.host).toBe('0.0.0.0');
    expect(cfg.server.token).toBe(null);
    expect(cfg.mcp.enabled).toBe(true);
  });

  test('config file values override defaults', () => {
    writeFileSync(
      configFile,
      `[db]\npath = "${join(dir, 'x.db')}"\n[server]\nport = 4000\nhost = "127.0.0.1"\ntoken = "abc"\n[mcp]\nenabled = true\nhttp_enabled = true\n`,
    );
    const cfg = loadConfig();
    expect(cfg.db.path).toBe(join(dir, 'x.db'));
    expect(cfg.server.port).toBe(4000);
    expect(cfg.server.token).toBe('abc');
  });

  test('env vars override file', () => {
    writeFileSync(configFile, `[server]\nport = 4000\ntoken = "from-file"\n`);
    process.env.BUDDEN_PORT = '5555';
    process.env.BUDDEN_TOKEN = 'from-env';
    const cfg = loadConfig();
    expect(cfg.server.port).toBe(5555);
    expect(cfg.server.token).toBe('from-env');
  });

  test('CLI overrides beat env and file', () => {
    writeFileSync(configFile, '[server]\nport = 4000\n');
    process.env.BUDDEN_PORT = '5555';
    const cfg = loadConfig({ port: 9999, token: 'from-cli' });
    expect(cfg.server.port).toBe(9999);
    expect(cfg.server.token).toBe('from-cli');
  });
});

describe('getValue / setValue', () => {
  test('round-trips through saveConfig', () => {
    const cfg = loadConfig();
    const next = setValue(cfg, 'server.port', '4242');
    saveConfig(next, configFile);
    const reloaded = loadConfig();
    expect(reloaded.server.port).toBe(4242);
    expect(getValue(reloaded, 'server.port')).toBe(4242);
  });

  test('coerces booleans and strings', () => {
    const cfg = loadConfig();
    const next = setValue(cfg, 'mcp.http_enabled', 'false');
    expect(next.mcp.http_enabled).toBe(false);
    const stringified = setValue(cfg, 'server.token', 'tok-abc');
    expect(stringified.server.token).toBe('tok-abc');
  });

  test('rejects unknown sections', () => {
    const cfg = loadConfig();
    expect(() => setValue(cfg, 'nope.x', 'y')).toThrow();
  });

  test('getValue returns undefined for unknown keys', () => {
    const cfg = loadConfig();
    expect(getValue(cfg, 'server.unknown')).toBe(undefined);
    expect(getValue(cfg, 'no.such.thing')).toBe(undefined);
  });
});
