# Foundation dependency register

## Design freeze 12.6

| Dependency                     | Version | Scope      | License     | Purpose                                                             |
| ------------------------------ | ------- | ---------- | ----------- | ------------------------------------------------------------------- |
| `@fontsource-variable/manrope` | 5.2.8   | `@nexo/ui` | SIL OFL 1.1 | Self-hosted variable UI typography with Spanish and tabular figures |

The dependency is packaged at build time and makes no runtime network request. No source
font files were copied independently into the repository.

All runtime and development dependencies are exact and resolved in `pnpm-lock.yaml`. This register explains direct dependencies; transitive packages are governed by lockfile/SCA/SBOM.

Prompt 11 adds no external runtime dependency. `@nexo/cash` is an internal framework-free workspace package using platform TypeScript, Node crypto and the existing PostgreSQL/NestJS adapters.

| Dependency                                          | Scope                       | Justification                                                                  |
| --------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| Node.js 24 LTS / pnpm 10 / Turborepo                | workspace                   | supported runtime, strict workspace installer and small task graph/cache layer |
| TypeScript                                          | all                         | strict types and shared language required by ADR-002                           |
| Next.js, React, React DOM                           | web/UI                      | accepted web architecture and rendering runtime                                |
| NestJS core/common/platform-fastify                 | API                         | accepted modular backend; Fastify reduces HTTP overhead                        |
| `@fastify/static`                                   | API                         | Fastify adapter support required to serve Swagger UI assets                    |
| `@fastify/cookie`                                   | API                         | parse/set hardened host-only authentication and CSRF cookies                   |
| `@nestjs/swagger`                                   | API                         | required Swagger/OpenAPI exposure for technical endpoints                      |
| class-validator, class-transformer                  | API                         | ValidationPipe runtime support for strict DTO boundaries                       |
| RxJS, reflect-metadata                              | API                         | NestJS runtime requirements                                                    |
| Pino, nestjs-pino, pino-pretty                      | API/worker                  | structured production logging, Nest request context, local-only readability    |
| Prisma CLI/client, adapter-pg, pg                   | database                    | mandated typed access/migration and Prisma 7 PostgreSQL driver                 |
| Zod                                                 | config                      | runtime boundary validation with inferred TypeScript types                     |
| ioredis                                             | API                         | Redis readiness and future cache/rate-limit adapter; no durable truth          |
| MinIO client                                        | API                         | S3-compatible object-store readiness and future adapter boundary               |
| Nodemailer                                          | API                         | provider-neutral SMTP port; Mailpit supplies real local verification/recovery  |
| OpenTelemetry API/SDK/exporter/auto-instrumentation | observability               | vendor-neutral traces/context required by ADR-012                              |
| Storybook Next.js+Vite, docs, a11y                  | UI                          | isolated design-system documentation and automated accessibility feedback      |
| ESLint + TypeScript ESLint + globals                | quality                     | flat-config static/type-aware enforcement                                      |
| Prettier + ESLint compatibility                     | quality                     | deterministic formatting without stylistic rule conflicts                      |
| Vitest, coverage-v8                                 | quality                     | one ESM-friendly runner for unit/component coverage                            |
| Playwright                                          | E2E                         | real HTTP/cookie/session tests against Compose services without mocks          |
| `@axe-core/playwright`                              | UI accessibility tests      | enforce zero critical/serious axe findings against real Storybook browser DOM  |
| `@floating-ui/react-dom` 2.1.6 (MIT)                | Web App Shell               | context-menu anchoring with flip, shift, size and auto-update                  |
| Testing Library, jest-dom, jsdom                    | UI/web tests                | behavior/semantic DOM assertions without browser-only unit tests               |
| Husky, lint-staged                                  | developer workflow          | fast staged checks and full pre-push parity; CI remains authoritative          |
| `tsx`                                               | database/worker development | execute ESM TypeScript seed/watch scripts without a second build tool          |

`@nexo/identity`, `@nexo/authorization` and `@nexo/control-plane` are first-party pure-domain packages. Prompts 5 and 6 added no third-party runtime dependency: the policy engine, template validation and onboarding state machine use TypeScript and existing Vitest only. Prompt 4.1B deliberately uses Node 24 built-in Argon2id/HMAC/randomness, avoiding a native password library; only cookie parsing, SMTP and E2E required direct additions.

Not installed intentionally: managed IdP SDK, JWT library, WebAuthn library, GeoIP SDK, queue framework, Axios, GraphQL, date/money library, state manager, CSS framework, feature-flag SDK, cloud SDK or business schema packages. Each awaits a concrete requirement/ADR.

# Prompt 9 additions

- `@nexo/sales`: internal framework-free package; depends only on TypeScript platform APIs and exposes domain/application ports.
- API Sales adapters depend on `@nexo/sales`, public Product/Inventory ports, Authorization and `@nexo/database`; the dependency direction never reverses.
- No new third-party runtime dependency was introduced for Sales. Exact arithmetic uses `bigint`; cryptographic fingerprints use the Node standard library.

# Prompt 10 addition

`@axe-core/playwright` 4.10.2 is the only added package and is development-only. It complements Storybook's a11y addon with a CI assertion in a real Chromium page. No component framework, CSS framework, icon library or state manager was added; native HTML and existing React remain sufficient for the current presentational contract.

# Final owner UI correction

`@floating-ui/react-dom` 2.1.6 is the only new runtime dependency. It is MIT licensed and replaces
manual coordinates with collision-aware `offset`, `flip`, `shift`, `size` and `autoUpdate`. No
second overlay framework or remote runtime was added.
