import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { parse, stringify } from 'smol-toml';

export type Config = {
  db: { path: string };
  server: { port: number; host: string; token: string | null };
  mcp: { enabled: boolean; http_enabled: boolean };
};

export type ConfigOverrides = {
  dbPath?: string;
  port?: number;
  host?: string;
  token?: string;
};

const DEFAULTS: Config = {
  db: { path: join(homedir(), '.budden', 'budden.db') },
  server: { port: 3000, host: '0.0.0.0', token: null },
  mcp: { enabled: true, http_enabled: true },
};

export const configPath = (): string =>
  process.env.BUDDEN_CONFIG ?? join(homedir(), '.budden', 'config.toml');

const readFile = (path: string): Partial<Config> => {
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, 'utf8');
  return parse(raw) as Partial<Config>;
};

const fromEnv = (): Partial<Config> => {
  const out: Partial<Config> = {};
  if (process.env.BUDDEN_DB_PATH) out.db = { path: process.env.BUDDEN_DB_PATH };
  const server: Partial<Config['server']> = {};
  if (process.env.BUDDEN_PORT) server.port = Number(process.env.BUDDEN_PORT);
  if (process.env.BUDDEN_HOST) server.host = process.env.BUDDEN_HOST;
  if (process.env.BUDDEN_TOKEN) server.token = process.env.BUDDEN_TOKEN;
  if (Object.keys(server).length) out.server = { ...DEFAULTS.server, ...server };
  return out;
};

const merge = (base: Config, ...layers: Partial<Config>[]): Config => {
  const out: Config = JSON.parse(JSON.stringify(base));
  for (const l of layers) {
    if (l.db) out.db = { ...out.db, ...l.db };
    if (l.server) out.server = { ...out.server, ...l.server };
    if (l.mcp) out.mcp = { ...out.mcp, ...l.mcp };
  }
  return out;
};

export const loadConfig = (overrides: ConfigOverrides = {}): Config => {
  const file = readFile(configPath());
  const env = fromEnv();
  const cli: Partial<Config> = {};
  if (overrides.dbPath) cli.db = { path: overrides.dbPath };
  const cliServer: Partial<Config['server']> = {};
  if (overrides.port !== undefined) cliServer.port = overrides.port;
  if (overrides.host !== undefined) cliServer.host = overrides.host;
  if (overrides.token !== undefined) cliServer.token = overrides.token;
  if (Object.keys(cliServer).length) cli.server = { ...DEFAULTS.server, ...cliServer };
  return merge(DEFAULTS, file, env, cli);
};

export const saveConfig = (cfg: Config, path: string = configPath()): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, stringify(cfg as Record<string, unknown>));
};

export const getValue = (cfg: Config, key: string): unknown => {
  const parts = key.split('.');
  let cur: unknown = cfg;
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
};

export const setValue = (cfg: Config, key: string, value: string): Config => {
  const out = JSON.parse(JSON.stringify(cfg)) as Config;
  const parts = key.split('.');
  if (parts.length !== 2) throw new Error(`config keys must be section.field, got: ${key}`);
  const [section, field] = parts as [keyof Config, string];
  const sec = out[section] as Record<string, unknown> | undefined;
  if (!sec) throw new Error(`unknown config section: ${section}`);
  if (value === 'true') sec[field] = true;
  else if (value === 'false') sec[field] = false;
  else if (/^-?\d+$/.test(value)) sec[field] = Number(value);
  else sec[field] = value;
  return out;
};
