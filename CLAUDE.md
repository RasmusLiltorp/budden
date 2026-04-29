# Budden - repo guide for Claude Code

Self-hosted, AI-native CRM. Three surfaces (CLI, web, MCP) over one SQLite DB. Bun-only stack.

## What's where

```
packages/
  shared    zod schemas, enums, ULID, time utils         (no DB, no I/O)
  config    TOML loader; precedence: CLI > env > file > defaults
  core      Drizzle schema + migrations, repos, ops, queries, events, CSV
apps/
  cli       commander binary (`budden`); commands wrap core ops 1:1
  web       SvelteKit 2 + Svelte 5 + Tailwind v4 + node adapter
  mcp       Model Context Protocol server (stdio + HTTP transports)
skills/     workflow skills the END USER installs in their Claude - not for this repo
```

`apps/web` mounts the MCP HTTP transport at `/mcp` (bearer-gated). `apps/cli`'s `serve` command starts both, or `--mcp-only` for headless.

## Common commands

```bash
bun install
bun run db:generate           # drizzle-kit + bundle migrations into src/db/migrations-bundle.ts
bun run build                 # generate → web build → CLI binary at dist/budden
bun run dev                   # web dev server (vite) only - CLI/MCP run from source via bun
bun run lint                  # biome
bun run typecheck             # tsc + svelte-check across all packages
bun test                      # all tests (no mocks anywhere - see "Tests" below)
./dist/budden init            # creates ~/.budden/budden.db + token
./dist/budden serve           # web + /mcp on the configured port
./dist/budden serve --mcp-only
```

CLI from source: `bun run apps/cli/src/index.ts <cmd>`. MCP stdio from source: `bun run apps/mcp/src/stdio.ts`.

## Workflow rules

Before declaring work complete:
1. `bun run lint` - must be clean
2. `bun run typecheck` - must be clean
3. `bun test` - all green

Don't run `npm run build`, `bun run build`, or any deploy command without explicit permission.

Don't add features beyond what was asked. A bug fix doesn't need a refactor riding along. No premature abstractions, no "while we're here" cleanups unless I asked.

Phase ordering matters: Phase 1 (core + CLI) is dogfoodable before Phase 2 (web) starts. Don't ship Phase N+1 work in a Phase N PR.

## Code style

- **No mocks.** All tests are real integration: in-memory SQLite via `bun:sqlite`, real migrations, real subprocesses for CLI/MCP. Use `makeTestDb()` from `packages/core/src/test-helpers.ts`.
- **No file over 200 lines.** Split by purpose. The whole repo is currently under that ceiling - don't break it.
- **No comments explaining WHAT.** Identifiers should be self-explanatory. Only comment a non-obvious WHY: a hidden constraint, a workaround, an invariant a future reader would miss.
- **No `as` casts on untrusted input.** Use the zod parsers in `@budden/shared` (`Direction.parse(...)`, `MembershipStatus.parse(...)`, etc.). Form actions, MCP tool args, and HTTP bodies all count as untrusted.
- **Status transitions go through `setStatus()`** in `packages/core/src/repos/memberships.ts`. Don't poke `list_memberships.status` directly - it bypasses the state machine and the event emitter.
- **All-Bun.** No pnpm, no npm scripts, no `node`. Use `bun --bun x ...` when invoking tools that may auto-detect Node (vite is the main one).
- **Don't add top-level deps without asking.** Stack is locked: drizzle-orm, drizzle-kit, commander, @modelcontextprotocol/sdk, zod, smol-toml, ulid, biome, vitest, SvelteKit, Tailwind v4. Anything else needs a reason.

## Adding a new MCP tool

1. Drop a new file in `apps/mcp/src/tools/<verb-noun>.ts` exporting a `Tool<...>` from `apps/mcp/src/types.ts`.
2. Use zod for `inputSchema`. Reuse enums from `@budden/shared` (e.g. `MembershipStatus`, `Priority`, `ChannelType`) - don't redefine.
3. Delegate to `@budden/core`. Tools should be thin: validate args → call ops → `ok(...)`.
4. Read tools return structured data; let Claude format it.
5. Register in `apps/mcp/src/tools/index.ts`.
6. Add a test case in `apps/mcp/test/stdio.test.ts` that calls it via the real protocol.

## Adding a new core operation

1. If it touches one table, put it in `packages/core/src/repos/<entity>.ts`. If it spans tables, put it in `packages/core/src/queries/` (read) or `packages/core/src/ops/` (write).
2. Status changes always go through `setStatus`. Auto-transitions from interactions go through `inferStatusFromInteraction` in `packages/core/src/status.ts`.
3. Emit an event via `events` if external code might care (`list.created`, `interaction.logged`, `membership.status_changed`, `followup.due`).
4. Add a test in `packages/core/test/<feature>.test.ts` using `makeTestDb()`.
5. Re-export from `packages/core/src/index.ts` if it's part of the public surface.

## Tests - the no-mocks contract

Everything is real. Search the repo: `mock`, `spyOn`, `stub` should return zero results. If a test feels like it needs a mock, the answer is almost always "use a real in-memory DB / spawn a real subprocess instead." We have no external dependencies - there's nothing to mock.

Test entry points:
- `packages/core/test/*.test.ts` - `makeTestDb()` + real Drizzle calls
- `packages/config/test/config.test.ts` - real TOML files in tmp dir + real env mutations
- `apps/cli/test/cli.smoke.test.ts` - `Bun.spawn(['bun', 'run', cliEntry, ...])` with isolated DB
- `apps/mcp/test/stdio.test.ts` - real MCP `Client` over `StdioClientTransport` to a real subprocess
- `apps/mcp/test/http.test.ts` - `Bun.serve()` + real MCP `StreamableHTTPClientTransport`
- `apps/web/test/smoke.test.ts` - spawns the real Node-adapter build + `fetch()` round trips

## Where the docs live

- `README.md` - user-facing intro, install, MCP setup
- `CHANGELOG.md` - release notes (Keep a Changelog format)
- `CONTRIBUTING.md` - how to set up, send a PR, run the full check
- `skills/` - workflow skills for **end users** to install in their personal Claude (not for this repo)
- inline JSDoc - none. We rely on names + zod schemas + small files. If you find yourself wanting a comment, see if the code can be clearer first.

## Don'ts

- Don't deploy or push without explicit permission.
- Don't credit yourself in commits or PR descriptions.
- Don't reach for `--no-verify` to skip a failing hook. Diagnose and fix.
- Don't introduce backwards-compatibility shims in pre-v1 code. Just change it.
- Don't write "WHAT" comments. Don't reference a current task in a comment ("added for issue #42") - that belongs in the PR description and rots in the codebase.
- Don't bypass the auth hook in `apps/web/src/hooks.server.ts`. New routes are private by default; add to `isPublic()` only with reason (currently only `/login` and `/mcp` are public - `/mcp` carries its own bearer).
