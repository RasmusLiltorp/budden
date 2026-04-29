# Docker

A multi-stage Bun image that builds the web bundle and MCP server, then runs the SvelteKit Node-adapter output. The CLI is not included — `budden init` is a setup step you run on the host or via `docker exec`.

## Build

From the repo root:

```bash
docker build -f docker/Dockerfile -t budden:latest .
```

## Run

```bash
docker run -d \
  --name budden \
  -p 3000:3000 \
  -v budden-data:/data \
  budden:latest
```

The entrypoint auto-runs `budden init` if `/data/config.toml` doesn't exist, then starts the web server. Tail the logs the first time to capture the printed token:

```bash
docker logs -f budden
```

You'll see the token printed once. Save it. (Or mount your existing `~/.budden/` to `/data` to reuse an existing config.)

## Coolify

Point Coolify at this repo, set `Dockerfile` path to `docker/Dockerfile`, mount `/data` as a persistent volume. Expose port 3000 (or proxy via Caddy/Nginx).

## Hardening

For a single-user self-host:

- Bind to a [Tailscale](https://tailscale.com/) interface only — never expose `:3000` to the public internet.
- Rotate the API token from `/settings` after first login.
- Back up `/data/budden.db` regularly (it's the entire CRM in one file).

The MCP HTTP transport is mounted at `/mcp`, bearer-auth-gated by the same token.
