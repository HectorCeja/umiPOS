FROM node:26.10.0-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN pnpm fetch --frozen-lockfile
COPY . .
RUN pnpm install --frozen-lockfile --offline
RUN pnpm db:generate
RUN pnpm --filter @nexo/database... build
RUN pnpm deploy --filter @nexo/database /out

FROM node:26.10.0-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S nexo && adduser -S -G nexo nexo
COPY --from=build /out ./
USER nexo
CMD ["sh", "-c", "DATABASE_URL=$MIGRATION_DATABASE_URL ./node_modules/.bin/prisma migrate deploy && DATABASE_URL=$MIGRATION_DATABASE_URL ./node_modules/.bin/tsx prisma/seed.ts"]
