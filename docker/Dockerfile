# syntax=docker/dockerfile:1.7

FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock tsconfig.base.json tsconfig.json biome.json ./
COPY packages ./packages
COPY apps ./apps

RUN bun install --frozen-lockfile
RUN bun run db:generate
RUN bun run --filter @budden/web build

FROM oven/bun:1-slim
WORKDIR /app

COPY --from=builder /app/apps/web/build ./apps/web/build
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/cli ./apps/cli
COPY --from=builder /app/apps/mcp ./apps/mcp
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json
COPY docker/entrypoint.sh /usr/local/bin/budden-entrypoint
RUN chmod +x /usr/local/bin/budden-entrypoint

ENV BUDDEN_DB_PATH=/data/budden.db
ENV BUDDEN_CONFIG=/data/config.toml
ENV PORT=3000
ENV HOST=0.0.0.0
ENV ORIGIN=http://localhost:3000
ENV NODE_ENV=production

VOLUME /data
EXPOSE 3000

ENTRYPOINT ["budden-entrypoint"]
