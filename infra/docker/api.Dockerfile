FROM node:26.5.0-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN pnpm fetch --frozen-lockfile
COPY . .
RUN pnpm install --frozen-lockfile --offline
RUN pnpm db:generate
RUN pnpm --filter @nexo/api... build
RUN pnpm deploy --filter @nexo/api --prod /out

FROM node:26.5.0-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S nexo && adduser -S -G nexo nexo
COPY --from=build /out ./
USER nexo
EXPOSE 3001
CMD ["node", "dist/main.js"]
