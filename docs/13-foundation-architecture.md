# Foundation workspace architecture

## Purpose

This workspace began as build, quality, runtime and local infrastructure. Prompts 3–6 added tenant, Identity/Authentication, Authorization and Control Plane; Prompts 7–9 added Product, Inventory and headless Sales. Prompt 10 hardens the presentational boundary without adding commercial authority.

## Layout

```text
apps/
  api/       NestJS 11 + Fastify, canonical OpenAPI, tenancy, authentication/authorization, logging, health
  web/       Next.js App Router foundation shell
  worker/    outbox publication and lifecycle/expiry jobs
packages/
  config/            environment validation
  contracts/         canonical OpenAPI 3.1.1 and compatibility gates
  database/          Prisma client, SQL/RLS migrations, integration evidence and seed
  observability/     OpenTelemetry lifecycle
  authorization/     pure permission registry, RBAC+ABAC engine and immutable context types
  control-plane/      pure template/onboarding domain and invariants
  identity/          reusable User/email/password lifecycle and configuration domain
  product/           descriptive catalog domain and public ports
  inventory/         ledger, availability, reservations and cost domain
  sales/             headless sale/checkout/payment/receipt domain
  typescript-config/ strict reusable compiler profiles
  ui/                design-system boundary and Storybook
infra/
  docker/     reproducible application images
  otel/       local collector pipeline
```

pnpm workspaces own dependencies and one lockfile; Turborepo schedules/cache tasks but does not hide package scripts. Apps may import package public exports. Packages never import apps. `@nexo/ui` has React/Next peer dependencies; server packages are framework-independent except database/telemetry adapters.

## Runtime topology

Local Compose starts PostgreSQL, Redis, MinIO, Mailpit and OpenTelemetry Collector, runs migrations once, then starts API, worker and web. The worker drains transactional outboxes and expiration work. Liveness answers only process health. API readiness validates PostgreSQL, Redis and MinIO. Mailpit is a developer inbox, not a production mail provider. Collector exports to debug locally because production telemetry storage remains open.

## Environment contract

Copy `.env.example` to `.env` for host development. Server variables are parsed once by `@nexo/config`; malformed or missing required values stop startup. `NEXT_PUBLIC_*` is public by definition and may never contain secrets. Compose credentials are deliberately local-only and must not be reused.

## Database lifecycle

`platform_metadata` proves seed lifecycle. Prompt 3 added Organization, Branch, Membership and branch scope tables. Prisma 7 uses the PostgreSQL driver adapter and ESM; authoritative SQL adds compound tenant constraints, `ENABLE/FORCE RLS`, policies and grants. Real integration tests use the non-owner runtime role.

Client generation and schema validation use a non-secret, deliberately invalid local URL when `DATABASE_URL` is absent because those operations do not connect. Runtime uses `DATABASE_URL`; administrative seed requires `MIGRATION_DATABASE_URL` so append-only runtime audit permissions and global authorization definitions are never relaxed. Application startup always uses the validated environment contract.

Commands:

```sh
pnpm db:generate
pnpm db:deploy
pnpm db:seed
```

Development creates migrations explicitly with `pnpm db:migrate`; CI and deployed environments only apply committed migrations.

## Quality and CI

`pnpm check` runs formatting, ESLint flat config with type-aware strict rules, TypeScript, Vitest and builds. Git pre-commit formats/lints staged files; pre-push runs the same full check as CI. Hooks are convenience, never the security boundary. CI separately applies and seeds migrations against PostgreSQL and validates Compose syntax. CodeQL runs on PR/main/schedule.

Storybook is owned by `@nexo/ui`, uses Next.js+Vite and includes accessibility checks. Prompt 10 adds semantic tokens, admin/POS presentational patterns, component tests, real-browser axe assertions and governed visual baselines; no component calculates commercial truth.

## API and telemetry

Swagger UI is `/api/docs`; JSON is `/api/openapi.json`. `packages/contracts/openapi/openapi.json` is the OpenAPI 3.1.1 source of truth; the former foundation `/v1` endpoint was removed. Health remains version-neutral at `/health/live` and `/health/ready`.

Pino produces JSON in non-development environments and redacts authorization, cookies and CSRF. OpenTelemetry starts before NestJS and exports traces through OTLP HTTP. Authentication security events are durable structured records; production SIEM/log retention remains an open infrastructure decision.

## Dependency policy

See [14-dependency-register.md](14-dependency-register.md). Exact versions and frozen lockfile are mandatory. Packages are selected only for a current foundation responsibility; queues, auth, feature flags, HTTP clients, date/money libraries and business validation are not installed prematurely.

## Known foundation debt

- Production cloud/IaC, secret manager, telemetry backend and artifact signing await ADR-015/cloud selection.
- OpenAPI product contract 4.0.0, compatibility baseline 3.0.0, generated SDK, backend manifests and real E2E form the conformance chain.
- RLS was re-demonstrated with real PostgreSQL and the production-equivalent runtime role in Prompt 6 across 10 tenant tables.
- Docker validation is green. Local host/kernel and pinned-service warnings remain documented operational review items.
