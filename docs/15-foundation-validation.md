# Foundation validation report

## Prompt 10 UX and Design System validation — 2026-07-14

- Baseline prerequisite: `pnpm check`, 33/33 product Playwright, OpenAPI 7.1.0/82 operations and real Compose all green before UI changes.
- `@nexo/ui`: six component/unit tests, strict TypeScript, ESLint zero warnings and production Storybook build green.
- Dedicated browser suite: 8/8, including five axe scans with zero critical/serious violations, keyboard skip-link, POS quantity/server-total display contract and four deterministic visual baselines.
- CI runs `design-system` with Chromium and uploads failure evidence; snapshot updates remain an explicit separate command.
- Docker remained healthy for API, web, worker, PostgreSQL, Redis, MinIO, Mailpit and OpenTelemetry; migrate/minio-init completed code 0.

This evidence does not replace manual screen-reader, hardware POS or primary user research; those remain explicit validation activities, not critical implementation debt.

### Prompt 11 audit correction

The Prompt 11 clean audit exposed that the `@nexo/ui` barrel exported hook-based components without a Next.js client boundary. A prior cached build had masked this. `src/index.ts` now declares `use client`; the correction does not move business logic into UI and is verified by a forced clean web build. Future phase gates must include at least one cache-independent application build.

**Date:** 2026-07-13  
**Runtime used:** Node.js 24.18.0 LTS, pnpm 10.13.1

## Passed locally

| Check                                                 | Result                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Frozen workspace resolution / exact lockfile          | pass                                                                    |
| Prettier over source, configuration and documentation | pass                                                                    |
| ESLint flat config, type-aware, zero warnings allowed | pass                                                                    |
| Strict TypeScript across all apps/packages            | pass                                                                    |
| Prisma schema validation and client generation        | pass                                                                    |
| Vitest base suites                                    | pass — 6 tests; no fake database tests                                  |
| Production builds                                     | pass — API, web standalone, worker and packages                         |
| Storybook static build with a11y addon                | pass                                                                    |
| API deploy artifact                                   | pass — production-only artifact contains entrypoint/dependencies        |
| API process startup                                   | pass                                                                    |
| Liveness                                              | pass — `GET /health/live` returned `200 {"status":"ok"}`                |
| OpenAPI                                               | pass — `/api/openapi.json`, `NEXO API`, OpenAPI 3.0 and technical paths |
| Git/Husky                                             | pass — repository on `main`, `core.hooksPath=.husky/_`                  |
| YAML syntax                                           | pass — Compose and workflow YAML parse successfully                     |

The root gate `pnpm check` passed end-to-end. Storybook was verified separately because its static bundle is a CI artifact rather than the UI library output.

## Real Docker validation — Prompt 3 closure

Docker Engine 29.6.1 and Compose 5.3.1 executed `docker compose up --build --wait` successfully on 2026-07-12. API, web, worker, PostgreSQL 18, Redis, MinIO, Mailpit and OpenTelemetry Collector reached their declared healthy state; migration and MinIO initialization jobs exited successfully.

Observed evidence:

- all four project images built from the frozen workspace;
- all three committed migrations were applied and the idempotent seed completed;
- liveness returned `200 {"status":"ok"}`;
- readiness returned database, Redis and object storage as `up`;
- web returned its production-rendered foundation page;
- runtime/read-only/migration/maintenance roles remained non-superuser and without `BYPASSRLS`;
- the real SQL integration suite proved no-context default deny, A-only reads, B→A update denial, forced RLS on four core tables and required policies, then rolled back.

### Phase 3 audit correction

The Phase 2 Compose volume mounted `/var/lib/postgresql/data`. PostgreSQL 18 stores version-specific data below `/var/lib/postgresql`; Phase 3 corrected the target to `/var/lib/postgresql` and the real runtime validation passed.

### Phase 3 executed evidence

The original Prompt 3 run applied its two then-existing migrations to PostgreSQL 14.23. The resumed closure revalidated the current forward-only chain on PostgreSQL 18 and repeated the A/B isolation suite. OpenAPI remains canonical 3.1.1 and ADR-0026 replaces ADR-0020's temporary exception. See `PHASE_REPORT.md`.

## Warning review

- `pnpm install` reports six deprecated transitive packages owned by Storybook/OpenTelemetry/tooling chains and a Node `url.parse()` deprecation during pnpm deployment/store upload. No direct NEXO source uses that API. Track through Dependabot/SCA; the built API emitted no critical runtime warning.
- Production startup initially exposed missing optional peers for ValidationPipe and Swagger/Fastify. `class-validator`, `class-transformer` and `@fastify/static` were added explicitly; startup, liveness and OpenAPI were retested successfully.
- Production observability storage, cloud IaC, artifact signature/provenance publication and action SHA pinning remain pre-production work tied to cloud/release decisions.
- Redis reports host `vm.overcommit_memory` disabled; the Collector reports its local health-check extension as unmaintained; MinIO reports a newer local image exists. These are non-blocking local-infrastructure risks, not evidence of a tenancy or migration failure, and require dependency/host review before production.

## GitHub Actions status

Workflow YAML and every quality-job command were validated locally. Actual GitHub execution cannot occur until the repository is pushed. Protected `main`, required checks, CodeQL enablement and organization policy are external configuration to apply when the remote is created.

## Prompt 5 executed evidence

On 2026-07-13 `pnpm check` passed on Node 24.18.0. Canonical OpenAPI validated 27 operations and compatibility baseline 3.0.0; engine 4/4, API 11/11 and SDK tests passed. `docker compose up --build --wait` rebuilt API, web, worker and migration images and reached healthy status for every long-running service. PostgreSQL reported eight migrations and no pending migration; seed v7 completed.

The runtime-equivalent RLS SQL returned `1` for every assertion, including default deny on authorization tables, Alpha-only reads and Beta inability to update Alpha assignments/features. Playwright returned 12/12 against real API/PostgreSQL/Redis/Mailpit: five authorization persona/isolation scenarios plus seven Authentication regressions. Live, ready and web returned HTTP 200.

## Prompt 6 executed evidence

On 2026-07-13 the complete `pnpm check` passed on Node 24.18.0/pnpm 10.13.1: Prettier, ESLint with zero warnings, strict TypeScript, all unit/contract suites and production builds. OpenAPI 4.0.0 validated 44 operations, its generated SDK remained synchronized and the compatibility baseline 3.0.0 passed.

`docker compose up --build --wait` rebuilt migration, API, web and worker images. API, web, worker, PostgreSQL, Redis, MinIO, Mailpit and OpenTelemetry reached healthy state; migration and MinIO initialization exited 0. PostgreSQL reported all nine forward-only migrations applied and seed v8 completed.

The runtime-equivalent SQL suite returned `1` for every assertion: no-context default deny, A-only reads, B→A write denial, forced RLS on all 10 tenant-owned tables and at least 30 policies. `pnpm test:e2e:quality` reset durable test state and Redis, then passed 20/20 real tests, including three Control Plane workflows and five Chromium/Linux visual comparisons. Live, ready and web returned HTTP 200.
