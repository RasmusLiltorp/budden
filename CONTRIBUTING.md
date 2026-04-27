# Contributing to Budden

Thanks for considering a contribution. Budden is small, opinionated, and Bun-only — these guidelines exist so PRs land cleanly.

## Setup

```bash
bun install
bun run db:generate           # bundles SQLite migrations into a TS file
bun run --filter @budden/web build
./dist/budden init            # creates ~/.budden/budden.db + a fresh API token
```

You should now be able to:

- `bun run dev` — SvelteKit dev server (web only)
- `bun run apps/cli/src/index.ts <cmd>` — CLI from source
- `bun run apps/mcp/src/stdio.ts` — MCP server from source

## Before opening a PR

The CI runs the same three checks. PRs that fail any of them won't merge:

```bash
bun run lint        # biome — must be clean
bun run typecheck   # tsc + svelte-check across all packages
bun test            # all 48 tests must pass
```

## House rules

- **No mocks in tests.** Budden has no external dependencies — everything is real integration. SQLite is in-memory via `bun:sqlite` (`makeTestDb()` in `packages/core/src/test-helpers.ts`). CLI and MCP tests spawn real subprocesses. Web tests spawn the real Node-adapter build.
- **No file over 200 lines.** If you're adding to a file that's already close, split by purpose. Most files in the repo are 50–120 lines.
- **No comments explaining WHAT.** Identifiers should carry meaning. Comment only non-obvious WHY: hidden constraints, workarounds, invariants a future reader would miss.
- **Status transitions go through `setStatus()`** in `packages/core/src/repos/memberships.ts`. Don't poke `list_memberships.status` directly — it bypasses the state machine and the event emitter.
- **No `as` casts on untrusted input.** Use the zod parsers in `@budden/shared` (`Direction.parse(...)`, `MembershipStatus.parse(...)`, etc.). Form actions, MCP tool args, and HTTP bodies all count as untrusted.
- **All-Bun.** No pnpm, no npm, no `node`. Use `bun --bun x ...` when invoking tools that auto-detect Node (`vite` mainly).
- **Don't add top-level dependencies without discussion.** The stack is locked: drizzle-orm, drizzle-kit, commander, @modelcontextprotocol/sdk, zod, smol-toml, ulid, biome, SvelteKit, Tailwind v4. Anything else needs a reason in the PR description.

## Adding an MCP tool

1. New file at `apps/mcp/src/tools/<verb-noun>.ts` exporting a `Tool<...>` from `apps/mcp/src/types.ts`.
2. Use zod for `inputSchema`. Reuse enums from `@budden/shared` (`MembershipStatus`, `Priority`, `ChannelType`) — don't redefine.
3. Delegate to `@budden/core`. Tools should be thin: validate args → call ops → `ok(...)`.
4. Read tools return structured data; let Claude format it. Don't pre-format prose.
5. Register in `apps/mcp/src/tools/index.ts`.
6. Add a test case in `apps/mcp/test/stdio.test.ts` that calls it via the real protocol.

## Adding a core operation

1. Single-table → `packages/core/src/repos/<entity>.ts`. Cross-table read → `queries/`. Cross-table write → `ops/`.
2. Status changes always go through `setStatus`. Auto-transitions from interactions go through `inferStatusFromInteraction` in `packages/core/src/status.ts`.
3. Emit an event via `events` if external code might care.
4. Add a test in `packages/core/test/<feature>.test.ts` using `makeTestDb()`.
5. Re-export from `packages/core/src/index.ts` if it's part of the public surface.

## Commit messages

- Imperative present tense ("add X", not "added X" or "adds X").
- First line under 70 chars.
- Body explains the *why* if the change isn't self-evident.
- Don't credit AI tools in commit messages.

## Code of conduct

Be kind. We're a small project and there's no formal CoC — but treat contributors the way you'd want to be treated. If something feels off, [open an issue](https://github.com/RasmusLiltorp/budden/issues).
