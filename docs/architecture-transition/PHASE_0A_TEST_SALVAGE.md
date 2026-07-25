# Phase 0A — Test Salvage

## Context

- NEXO HEAD: `b6ef871de195484314b78c015ecfde9a5c8697f4`
- UMI HEAD: `d5f399c8528fa3dda752aa37281d1b7a2c174348`

Current pass status does not control salvage value.

The behavior that a test proves controls its decision.

## Major suite map

| Current suite                               | Behavior                    | Decision            | UMI target             | Fixture needs            | NEXO coupling | Assistant relevance       |
| ------------------------------------------- | --------------------------- | ------------------- | ---------------------- | ------------------------ | ------------- | ------------------------- |
| `packages/sales/src/index.test.ts`          | Money, totals, idempotency  | KEEP                | UMI POS unit tests     | Pure vectors             | Low           | Stable explanations       |
| `packages/cash/src/index.test.ts`           | Cash states and ledger      | PORT                | UMI POS unit tests     | Pure vectors             | Medium        | Approval and variance     |
| `packages/product/src/index.test.ts`        | Catalog rules               | PORT                | UMI catalog tests      | Deterministic catalog    | Medium        | Catalog tools             |
| `packages/inventory/src/index.test.ts`      | Inventory states            | PORT                | UMI inventory tests    | Movement vectors         | Medium        | Inventory explanations    |
| `packages/authorization/src/engine.test.ts` | Permission evaluation       | REWRITE AGAINST UMI | UMI auth tests         | UMI roles                | High          | Tool permission gate      |
| `packages/database/tests`                   | RLS and isolation           | REWRITE AGAINST UMI | Build-v3 security gate | UMI schemas and roles    | High          | Tool isolation gate       |
| `apps/api/**/*.spec.ts`                     | NEXO API behavior           | REWRITE AGAINST UMI | UMI API tests          | UMI data                 | High          | Stable API errors         |
| `tests/e2e/*identity*`                      | NEXO identity               | RETIRE/ARCHIVE      | UMI auth tests         | UMI sessions             | High          | Identity-aware tools      |
| `tests/e2e/*authorization*`                 | Denial and escalation       | REWRITE AGAINST UMI | UMI security E2E       | Dedicated roles          | High          | Consequential action gate |
| `tests/e2e/*product*`                       | Catalog UI and integrity    | REWRITE AGAINST UMI | UMI dashboard and POS  | Owned products           | High          | Catalog reads             |
| `tests/e2e/*inventory*`                     | Stock and ledger behavior   | REWRITE AGAINST UMI | UMI inventory          | Owned branches and stock | High          | Anomaly reads             |
| `tests/e2e/*sales*`                         | Sales and receipts          | REWRITE AGAINST UMI | UMI API and dashboard  | Owned sales              | High          | Sales summaries           |
| `tests/e2e/*cash*`                          | Physical cash               | REWRITE AGAINST UMI | UMI POS and dashboard  | Register and shift       | High          | Shift guidance            |
| `tests/e2e/reports-*`                       | Metrics                     | REWRITE AGAINST UMI | UMI reports            | Fixed clock and sales    | High          | Management analytics      |
| `tests/e2e/*nexoselect*`                    | Accessible selection        | PORT                | UMI dashboard tests    | None                     | Medium        | Accessible tool UI        |
| Web visual snapshots                        | NEXO pixel state            | ARCHIVE             | Design reference       | Frozen data              | High          | Reference only            |
| Flutter tests                               | Client state and UI         | PORT                | `apps/umi-pos`         | Generated UMI models     | Medium        | Operator help             |
| Flutter goldens                             | Visual and accessibility    | PORT after review   | `apps/umi-pos`         | UMI brand                | Medium        | Accessible help           |
| Evidence/video tests                        | Historical certification    | ARCHIVE             | Archive                | None                     | High          | No runtime role           |
| Runtime freshness tests                     | Stale runtime detection     | KEEP                | UMI CI                 | Images                   | Low           | Diagnostic metadata       |
| LAN tests                                   | Portable development access | PORT/REWRITE        | POS/KDS LAN gate       | Certified network        | Medium        | Network diagnostics       |

## Prisma dependency

The following test classes depend on Prisma and must be rewritten:

- database seed tests
- migration tests
- NEXO RLS SQL tests
- API integration fixtures
- Playwright fixture bootstrap
- Alpha organization and branch fixtures

Do not translate Prisma fixtures into UMI migrations.

Create UMI-owned fixtures through approved APIs or migration seeds.

## Alpha fixture dependency

Many Playwright suites use:

- Alpha Owner
- Organization Alpha
- the canonical branch
- shared products
- shared onboarding state

These fixtures cannot enter UMI.

Each UMI suite needs:

- owned business
- owned branch
- owned users and roles
- owned command IDs
- owned financial records
- deterministic clock where needed

## Target gates

| Gate   | Extracted proof                                          |
| ------ | -------------------------------------------------------- |
| Gate 1 | RLS, privileged functions, roles, SQL preflight          |
| Gate 2 | Contract generation, device trust, idempotency           |
| Gate 3 | Flutter state, security, accessibility, sequential sales |
| Gate 4 | Atomic sale, cash, inventory, loyalty, receipt, refund   |
| Gate 5 | Offline replay, LAN delivery, fallback, reconciliation   |
| Gate 6 | Hardware, pilot, redacted trace                          |
| Gate 7 | Provider ambiguity and settlement                        |
| Gate 8 | Swift and Flutter KDS parity                             |

## Extraction priority

1. Money and rounding vectors
2. Idempotency and response-loss vectors
3. Payment ambiguity vectors
4. RLS and branch-denial scenarios
5. Cash shift state and concurrency
6. Receipt ownership and snapshot cases
7. Inventory movement cases
8. Flutter accessibility and recovery
9. KDS LAN and provisional mapping
10. Dashboard workflows

## Retire without repair

Do not repair a legacy test when it proves only:

- NEXO route shape
- NEXO Prisma behavior
- NEXO session cookies
- NEXO dashboard pixel state
- evidence video generation
- fake UMI sinks
- a dual-platform bridge
