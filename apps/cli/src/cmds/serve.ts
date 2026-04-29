import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '@budden/config';
import { createHttpHandler } from '@budden/mcp';
import { Command } from 'commander';
import { fail } from '../util';

type ServeOpts = { port?: string; host?: string; mcpOnly?: boolean };

const findWebBuild = (): string | null => {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(here, '../../web/build/index.js'),
    resolve(here, '../../../apps/web/build/index.js'),
    resolve(process.cwd(), 'apps/web/build/index.js'),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
};

const startMcpOnly = (host: string, port: number, token: string | null): void => {
  const handler = createHttpHandler({ token });
  Bun.serve({
    hostname: host,
    port,
    fetch: async (request) => {
      const url = new URL(request.url);
      if (url.pathname !== '/mcp') return new Response('not found', { status: 404 });
      return handler(request);
    },
  });
  console.log(`✓ MCP HTTP  http://${host}:${port}/mcp  (Authorization: Bearer <token>)`);
  if (!token) {
    console.warn('⚠ No API token configured — /mcp is unauthenticated. Run `budden init`.');
  }
};

const startWebPlusMcp = async (host: string, port: number, token: string | null): Promise<void> => {
  const webBuild = findWebBuild();
  if (!webBuild) {
    fail('web build not found — run `bun run build:web` first');
  }

  process.env.PORT = String(port);
  process.env.HOST = host;
  process.env.ORIGIN ??= `http://${host}:${port}`;

  const origin = process.env.ORIGIN;
  console.log(`✓ Web UI    ${origin}`);
  console.log(`✓ MCP HTTP  ${origin}/mcp  (Authorization: Bearer <token>)`);
  if (!token) {
    console.warn('⚠ No API token configured — /mcp is unauthenticated. Run `budden init`.');
  }

  await import(webBuild!);
};

export const serveCmd = new Command('serve')
  .description('Start the web UI; MCP server is mounted at /mcp.')
  .option('--port <n>', 'override port')
  .option('--host <h>', 'override host')
  .option('--mcp-only', 'serve MCP HTTP only (no web UI) — useful behind SSH tunnel / Tailscale')
  .action(async (opts: ServeOpts) => {
    const cfg = loadConfig();
    const port = opts.port ? Number(opts.port) : cfg.server.port;
    const host = opts.host ?? cfg.server.host;
    const token = cfg.server.token;

    if (opts.mcpOnly) {
      startMcpOnly(host, port, token);
      return;
    }
    await startWebPlusMcp(host, port, token);
  });
