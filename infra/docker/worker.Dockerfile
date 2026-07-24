FROM node:24.18.0-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN pnpm fetch --frozen-lockfile
COPY . .
RUN pnpm install --frozen-lockfile --offline
RUN pnpm db:generate
RUN pnpm --filter @nexo/worker... build
RUN pnpm deploy --filter @nexo/worker --prod /out

FROM node:24.18.0-alpine AS runtime
ARG NEXO_SOURCE_FINGERPRINT=unversioned
LABEL org.nexo.source-fingerprint="${NEXO_SOURCE_FINGERPRINT}"
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S nexo && adduser -S -G nexo nexo
COPY --from=build /out ./
USER nexo
CMD ["node", "dist/main.js"]
