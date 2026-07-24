FROM node:24.18.0-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN pnpm fetch --frozen-lockfile
COPY . .
RUN pnpm install --frozen-lockfile --offline
RUN pnpm --filter @nexo/web... build

FROM node:24.18.0-alpine AS runtime
ARG NEXO_SOURCE_FINGERPRINT=unversioned
LABEL org.nexo.source-fingerprint="${NEXO_SOURCE_FINGERPRINT}"
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
RUN addgroup -S nexo && adduser -S -G nexo nexo
COPY --from=build /workspace/apps/web/.next/standalone ./
COPY --from=build /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /workspace/apps/web/public ./apps/web/public
USER nexo
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
