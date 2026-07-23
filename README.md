# NEXO

Prompt 11 Cash Management está en progreso: dominio/ledger/RLS y posting CASH desde Sales están verificados, pero el Quality Gate continúa amarillo por workflows, UI, carreras y performance pendientes. Referencias: [project state](docs/PROJECT_STATE.md), [Cash Platform](docs/CashManagementPlatform.md), [guardrails](ARCHITECTURE_GUARDRAILS.md), [handoff](PROMPT_HANDOFF.md) y [reporte](docs/PHASE_REPORT.md).

Foundation monorepo for the NEXO modular SaaS platform. Identity through Sales are implemented. Product stays descriptive, Inventory owns its ledger, Sales consumes both through public ports, and UI components remain presentation-only.

Before changing the repository, read:

1. [Product and architecture source of truth](docs/README.md)
2. [Mandatory architecture guardrails](ARCHITECTURE_GUARDRAILS.md)
3. [Decision log](DECISION_LOG.md)

## Requirements

- Node.js 24 LTS (exact development version in `.node-version`)
- pnpm 10 through Corepack
- Docker Engine with Compose v2 for the complete local stack

## Start

```sh
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
docker compose up --build
```

Services: web `:3000`, API `:3001`, Swagger `:3001/api/docs`, MinIO `:9000`/console `:9001`, Mailpit UI `:8025`, OTLP `:4317`/`:4318`.

Para probar desde otro dispositivo de la red local usa `DEV_LAN_HOST=<ip-linux> pnpm owner:share` y
consulta [Acceso LAN de desarrollo](docs/DEV_LAN_ACCESS.md). Esta confianza es explícita y exclusiva
del entorno local; no utiliza CORS, CSP ni dominios de cookies wildcard.

For host development, start dependencies with `docker compose up postgres redis minio minio-init mailpit otel-collector`, export both runtime and migration URLs, apply `pnpm db:deploy && pnpm db:seed`, then run `pnpm dev`. Seed intentionally requires `MIGRATION_DATABASE_URL` because runtime cannot delete append-only audit fixtures.

## Quality commands

| Command                                  | Purpose                                                 |
| ---------------------------------------- | ------------------------------------------------------- |
| `pnpm check`                             | format, lint, strict types, tests and production builds |
| `pnpm test:coverage`                     | tests with V8 coverage artifacts                        |
| `pnpm test:e2e:quality`                  | reset fixtures and run real E2E + visual gates          |
| `pnpm --filter @nexo/ui dev`             | Storybook development server                            |
| `pnpm --filter @nexo/ui build-storybook` | static Storybook verification                           |
| `pnpm db:generate`                       | generate Prisma client without connecting               |
| `pnpm db:migrate`                        | create a reviewed development migration                 |
| `pnpm db:deploy`                         | apply committed migrations                              |
| `pnpm db:seed`                           | idempotent infrastructure seed                          |

Visual tests require `pnpm exec playwright install chromium` once locally. CI installs the pinned browser automatically.

Never place production secrets in `.env`. Local credentials in Compose are public development defaults and intentionally unusable as production policy.

# Inventory Platform

Prompt 8 agrega `@nexo/inventory` y un módulo API design-first para ledger, disponibilidad, reservas, transferencias, conteos, ubicaciones y costos. Consulta [Inventory Platform](docs/InventoryPlatform.md) y [ADR-0032](docs/adr/ADR-0032-inventory-ledger-and-cost-boundaries.md). Product continúa sin stock.

# Sales Platform

Prompt 9 agrega `@nexo/sales` y adaptadores API/Worker para ventas, checkout, pagos, recibos, refunds, RLS y eventos. Consulta [Sales Platform](docs/SalesPlatform.md), [Sales Research](docs/SalesResearch.md) y [ADR-0033–0037](docs/adr/README.md). Ningún cliente ni integración externa es autoridad de totales.
