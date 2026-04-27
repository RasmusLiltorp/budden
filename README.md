# Budden

> Self-hosted, AI-native CRM for solo founders and small teams doing manual outreach.

Three surfaces, one SQLite DB:

- **CLI** — `budden` binary for terminal-driven workflows.
- **Web UI** — SvelteKit app for visual oversight, accessible when deployed to a VPS.
- **MCP server** — connect Claude Desktop / Claude Code; talk to your CRM in natural language.

Status: **early development**.

## Quick start (dev)

```bash
bun install
bun run db:generate         # generate + bundle SQLite migrations
bun run --filter @budden/web build
./dist/budden init          # creates ~/.budden/budden.db and prints your API token
./dist/budden serve         # web UI + MCP server on http://localhost:3000
```

The CLI binary is built via `bun run build:cli` (single executable in `dist/budden`).

## MCP setup

The MCP server is mounted in two places:

- **stdio** — spawn `bun run apps/mcp/src/stdio.ts` as a subprocess (no auth; trusts the local
  process). Best for Claude Desktop and Claude Code.
- **HTTP** — mounted at `/mcp` on the web server, gated by your bearer token.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "budden": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/budden/apps/mcp/src/stdio.ts"]
    }
  }
}
```

Restart Claude Desktop. You should see Budden's tools (`list_lists`, `log_interaction`,
`get_today_queue`, etc.) in the tool drawer.

### Claude Code

```bash
claude mcp add budden -- bun run /absolute/path/to/budden/apps/mcp/src/stdio.ts
```

### Remote / HTTP

Once `budden serve` is running on a VPS, point any MCP client at
`https://your-host/mcp` with `Authorization: Bearer <token>`. Hardening: bind the server to a
[Tailscale](https://tailscale.com/) interface only — see Deployment below.

### Workflow skills

[`skills/`](./skills/) contains pre-built workflow skills you can drop into
`~/.claude/skills/` so your Claude knows how to use Budden naturally:

- `budden-morning-ritual` — daily campaign briefing
- `budden-log-outreach` — record sends / replies / notes
- `budden-followup-sweep` — draft follow-ups for the queue
- `budden-triage-inbox` — review replies + suggest next actions
- `budden-add-prospect` — create contacts with channels and list assignment

See [skills/README.md](./skills/README.md) for install + customisation.

## Architecture

```
packages/
  shared    — zod schemas, enums, ULID, time utilities
  config    — TOML config loader (CLI flags > env > file > defaults)
  core      — Drizzle SQLite schema + migrations, repos, ops, queues, events, CSV io
apps/
  cli       — `budden` binary (commander); commands wrap core ops 1:1
  web       — SvelteKit + Tailwind v4; bearer-token cookie auth
  mcp       — Model Context Protocol server (stdio + HTTP transports)
```

Everything ultimately reads and writes the same SQLite file.

## Deployment

A Coolify-friendly Dockerfile lives in `docker/`. Mount `/data` as a persistent volume; the
container runs `budden serve` and writes the DB to `/data/budden.db`.

For a single-user self-host, expose only the Tailscale interface and never the public internet.

## License

MIT — see [LICENSE](./LICENSE).
