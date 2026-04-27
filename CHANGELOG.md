# Changelog

All notable changes to Budden are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) once it ships v0.1.0.

## [Unreleased]

### Added
- `docker/Dockerfile` and `docker/entrypoint.sh` — multi-stage Bun image with auto-init on first run
- `.github/workflows/ci.yml` — lint + typecheck + test on every push and PR
- `CONTRIBUTING.md` — setup guide, house rules, and how to add MCP tools / core operations
- This changelog

### Changed
- README no longer references the historical build plan

## [0.0.1] — initial development

The pre-public state. Three surfaces over one SQLite DB.

### Phase 1 — Core + CLI
- `@budden/shared`: zod schemas, enums, ULID, time utilities
- `@budden/config`: TOML loader with CLI > env > file > defaults precedence
- `@budden/core`: Drizzle SQLite schema, repos, status state machine, queues, CSV io, typed event emitter
- `@budden/cli`: `budden` binary via `commander`, with `init`, `list`, `contact`, `log`, `reply`, `status`, `today`, `followups`, `inbox`, `import`, `export`, `serve`

### Phase 2 — Web UI
- `@budden/web`: SvelteKit 2 + Svelte 5 + Tailwind v4 + node adapter
- Bearer-token cookie auth via `hooks.server.ts`
- Pages: `/login`, `/`, `/lists`, `/lists/[id]`, `/contacts/[id]`, `/settings`, `/import`, `/search`
- Status-change form, CSV export, search bar in nav

### Phase 3 — MCP server
- `@budden/mcp`: 15 tools across read and write surfaces
- stdio transport for Claude Desktop / Claude Code
- HTTP transport mounted at `/mcp` on the SvelteKit app, bearer-auth-gated
- `--mcp-only` headless mode for SSH-tunnelled / Tailscale deployments
- 5 workflow skills under `skills/` for end users to install in their Claude

### Tests
- 48 real integration tests, no mocks anywhere — in-memory SQLite, real subprocesses for CLI / MCP, real fetch round-trips for the web smoke
