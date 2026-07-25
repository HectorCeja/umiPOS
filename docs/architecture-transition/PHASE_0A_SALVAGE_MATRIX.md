# Phase 0A — Salvage Matrix

## Repository context

- NEXO HEAD: `b6ef871de195484314b78c015ecfde9a5c8697f4`
- UMI HEAD: `d5f399c8528fa3dda752aa37281d1b7a2c174348`
- Detailed record: `phase-0a-salvage-manifest.json`

## Decision rules

| Decision    | Meaning                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| KEEP        | Transfer a small, reviewed, platform-neutral asset.                     |
| ADAPT       | Preserve useful code or behavior after UMI integration changes.         |
| REIMPLEMENT | Preserve behavior or invariants, but rebuild the implementation in UMI. |
| RETIRE      | Remove the asset from active development after its replacement gate.    |
| ARCHIVE     | Keep the asset only as evidence or reference.                           |

KEEP never means an unreviewed directory copy.

## Applications

| Asset           | Decision    | UMI status     | Target                           | Assistant readiness                       |
| --------------- | ----------- | -------------- | -------------------------------- | ----------------------------------------- |
| `apps/api`      | REIMPLEMENT | Partial        | `apps/umi-api/src/modules/pos`   | Stable errors and audited events required |
| `apps/web`      | RETIRE      | Exists         | `apps/umi-dashboard/src/screens` | Management reads and guided actions       |
| `apps/worker`   | RETIRE      | Exists         | `apps/umi-api/src/jobs`          | Redacted queue diagnostics                |
| `apps/nexo_pos` | ADAPT       | Client missing | `apps/umi-pos`                   | Operator help surface only                |

## Packages

| Asset                          | Decision    | UMI status     | Target                           | Main reusable value         |
| ------------------------------ | ----------- | -------------- | -------------------------------- | --------------------------- |
| `packages/authorization`       | RETIRE      | Exists         | `apps/umi-api/src/modules/auth`  | Negative permission vectors |
| `packages/cash`                | REIMPLEMENT | Partial        | `apps/umi-api/src/modules/pos`   | Shift and ledger rules      |
| `packages/config`              | RETIRE      | Exists         | `apps/umi-api/src/shared/config` | Fail-fast cases             |
| `packages/contracts`           | RETIRE      | Partial        | `packages/contract`              | Compatibility discipline    |
| `packages/control-plane`       | RETIRE      | Exists         | UMI tenants and staff            | Isolation cases             |
| `packages/database`            | RETIRE      | Partial        | UMI Supabase migrations          | Constraints and RLS cases   |
| `packages/identity`            | RETIRE      | Partial        | UMI identity and auth            | Security vectors            |
| `packages/inventory`           | REIMPLEMENT | Missing        | UMI POS and inventory modules    | Movement semantics          |
| `packages/nexo_flutter_design` | ADAPT       | Client missing | `apps/umi-pos`                   | Widgets, tokens, goldens    |
| `packages/observability`       | ADAPT       | Exists         | UMI logging                      | Correlation and redaction   |
| `packages/product`             | REIMPLEMENT | Partial        | UMI catalog                      | Variants and pricing        |
| `packages/sales`               | REIMPLEMENT | Partial        | UMI POS checkout                 | Financial invariants        |
| `packages/sdk`                 | RETIRE      | Partial        | `packages/contract`              | Generation drift pattern    |
| `packages/typescript-config`   | RETIRE      | Exists         | UMI root toolchain               | Strictness reference        |
| `packages/ui`                  | ADAPT       | Exists         | UMI dashboard                    | Accessible patterns         |

## Infrastructure

| Asset                        | Decision | UMI status                   | Retirement gate              |
| ---------------------------- | -------- | ---------------------------- | ---------------------------- |
| NEXO PostgreSQL              | RETIRE   | UMI database partial         | Build-v3 cutover and restore |
| Prisma schema and migrations | RETIRE   | UMI migration ledger partial | Ordered Supabase migrations  |
| NEXO Redis                   | RETIRE   | UMI runtime exists           | Queue and rate-limit parity  |
| NEXO MinIO                   | RETIRE   | UMI media path missing       | UMI media integrity          |
| NEXO Compose                 | ARCHIVE  | UMI local stack exists       | NEXO archive                 |
| NEXO OpenTelemetry runtime   | RETIRE   | UMI logging exists           | UMI trace parity             |
| Mailpit                      | RETIRE   | UMI test infrastructure      | NEXO identity retirement     |
| NEXO CI                      | ARCHIVE  | UMI CI exists                | UMI replacement gates        |
| Portable LAN discovery       | KEEP     | UMI KDS partial              | Signed LAN certification     |
| Runtime freshness principle  | KEEP     | UMI CI exists                | UMI mismatch test            |

## Test assets

| Group                              | Decision    | Target gate                       |
| ---------------------------------- | ----------- | --------------------------------- |
| Pure money and idempotency vectors | KEEP        | Contract and POS unit gate        |
| Domain unit tests                  | ADAPT       | UMI domain unit gate              |
| API integration tests              | REIMPLEMENT | UMI API integration gate          |
| RLS SQL tests                      | REIMPLEMENT | Build-v3 security gate            |
| Playwright business suites         | REIMPLEMENT | UMI API, dashboard, and POS gates |
| Flutter tests and goldens          | ADAPT       | Umi POS client gate               |
| Web visual snapshots               | ARCHIVE     | UMI design review                 |
| Evidence and video suites          | ARCHIVE     | Historical reference              |

## Business capabilities

| Capability                      | Decision                     | UMI maturity            | Planned destination                |
| ------------------------------- | ---------------------------- | ----------------------- | ---------------------------------- |
| Identity and dashboard sessions | RETIRE NEXO                  | Partial                 | UMI auth                           |
| Businesses, branches, and staff | RETIRE NEXO                  | Exists                  | UMI tenants and staff              |
| Entitlements                    | RETIRE NEXO                  | Exists, POS key present | `packages/contract` and UMI guards |
| Device enrollment               | REIMPLEMENT                  | Partial through KDS     | UMI POS module                     |
| Operator sessions               | REIMPLEMENT                  | Missing                 | UMI POS module                     |
| Catalog                         | REIMPLEMENT                  | Partial                 | UMI catalog and POS                |
| Checkout                        | REIMPLEMENT                  | Partial order writer    | UMI POS module                     |
| Payments and refunds            | REIMPLEMENT                  | Partial schema          | UMI POS module                     |
| Loyalty and wallet              | RETIRE NEXO                  | Exists                  | UMI Cash                           |
| Physical cash                   | REIMPLEMENT                  | Missing                 | UMI POS module                     |
| Inventory                       | REIMPLEMENT                  | Missing                 | UMI inventory                      |
| Receipts                        | REIMPLEMENT                  | Missing                 | UMI POS module                     |
| Reporting                       | REIMPLEMENT                  | Partial                 | UMI dashboard                      |
| Offline journal                 | REIMPLEMENT                  | Client-only             | `apps/umi-pos`                     |
| Hardware adapters               | REIMPLEMENT                  | Missing                 | `apps/umi-pos`                     |
| KDS                             | REIMPLEMENT missing behavior | Exists                  | UMI KDS and API                    |
| Umi Assistant tools             | REIMPLEMENT later            | Partial platform tools  | UMI conversations tools            |

## Non-survival list

The following NEXO components cannot survive:

- API and database authority
- identity and sessions
- organizations and branches
- memberships and RBAC
- financial and inventory writers
- worker and outbox
- dashboard application
- OpenAPI source and TypeScript SDK
- standalone infrastructure
- fake UMI sinks
- unused device outboxes
- reconciliation bridges

## Extraction controls

Each extraction needs:

- a source license check
- a source path and checksum
- a UMI owner
- a target gate
- a replacement test
- a deletion prerequisite
- a proof that no NEXO authority enters UMI
