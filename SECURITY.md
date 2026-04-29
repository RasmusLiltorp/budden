# Security Policy

## Supported Versions

Budden is in early development. Until 1.0, only the latest commit on `main` receives
security fixes.

| Version | Supported |
| ------- | --------- |
| `main`  | Yes       |
| < 1.0   | Latest only |

## Reporting a Vulnerability

If you find a security issue, please **do not** open a public GitHub issue.

Instead, use one of the following private channels:

1. **GitHub private vulnerability reporting** (preferred):
   open the [Security tab](https://github.com/RasmusLiltorp/budden/security/advisories/new)
   and click "Report a vulnerability".
2. Email: `liltorp03@gmail.com` with subject `[budden security]`.

Please include:

- A description of the issue and the affected component (CLI, web, MCP, core).
- Steps to reproduce, ideally with a minimal example.
- The version (commit SHA) you tested against.
- Any suggested fix or mitigation.

You should receive a response within 72 hours acknowledging receipt. We aim to ship a fix
or a documented mitigation within 14 days for high-severity issues. Lower-severity issues
follow the normal release cadence.

## Scope

In scope:

- The Budden codebase under `apps/`, `packages/`, and `docker/`.
- The bundled SQLite migration generation pipeline.
- The bearer-token auth flow on the web UI and the MCP HTTP transport.

Out of scope (not vulnerabilities in Budden):

- Issues in upstream dependencies (report those upstream; we'll bump versions promptly).
- Issues that require physical access to the machine running Budden.
- Issues that require an attacker to already have the API token.
- Self-XSS via copying CSV-import payloads into your own browser.

## Threat Model

Budden is designed for self-hosting by a single user or a tiny team. The expected
deployment is behind a Tailscale interface or similar private network, not directly
exposed to the public internet.

What Budden does *not* defend against by design:

- A user with the bearer token has full read+write access. There is no per-route ACL.
- The SQLite database file is plaintext on disk. Encrypt the volume if that matters.
- The MCP HTTP transport has no rate limiting. Run it on a private network.

If your deployment requires defending against any of the above, please open an issue
describing the use case before the public release; we'd like to know.
