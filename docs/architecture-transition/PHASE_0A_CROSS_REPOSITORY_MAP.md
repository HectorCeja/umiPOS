# Phase 0A — Cross-Repository Map

## Repository heads

- NEXO: `b6ef871de195484314b78c015ecfde9a5c8697f4`
- UMI: `d5f399c8528fa3dda752aa37281d1b7a2c174348`

The JSON companion is `phase-0a-cross-repository-map.json`.

## Capability map

| NEXO asset          | UMI counterpart                | Maturity    | Decision                  | Exact target                        | Required extraction      | Build-v3 prerequisite            | Retirement gate        | Assistant impact      |
| ------------------- | ------------------------------ | ----------- | ------------------------- | ----------------------------------- | ------------------------ | -------------------------------- | ---------------------- | --------------------- |
| Identity            | UMI identity and auth          | Partial     | RETIRE                    | `apps/umi-api/src/modules/identity` | Security vectors         | Identity and session convergence | UMI session gates      | UMI context only      |
| Control plane       | UMI tenants and staff          | Exists      | RETIRE                    | `apps/umi-api/src/modules/tenants`  | Isolation cases          | Role convergence                 | Cross-scope gate       | Tenant scope required |
| OpenAPI             | `@umi/contract`                | Partial     | RETIRE                    | `packages/contract`                 | Errors and compatibility | Final ownership                  | Dart generation        | Typed tools           |
| Product             | UMI product repository         | Partial     | REIMPLEMENT               | `apps/umi-api/src/modules/pos`      | Catalog rules            | Final tenant schema              | Catalog parity         | Safe catalog reads    |
| Sales               | UMI order repository           | Partial     | REIMPLEMENT               | `apps/umi-api/src/modules/pos`      | Financial vectors        | Order convergence                | Atomic checkout        | Explain status only   |
| Payments            | UMI payment and refund facts   | Partial     | REIMPLEMENT               | UMI POS module                      | Ambiguity vectors        | Ordered migrations               | Reconciliation         | Never charge          |
| Loyalty             | UMI Cash                       | Exists      | RETIRE                    | `apps/umi-api/src/modules/cash`     | Sale linkage             | Final order model                | Loyalty reconciliation | Scoped balance reads  |
| Inventory           | No complete UMI module         | Missing     | REIMPLEMENT               | UMI POS and inventory modules       | Ledger vectors           | Final tenant schema              | Inventory parity       | Anomaly reads         |
| Physical cash       | UMI Cash is a different domain | Missing     | REIMPLEMENT               | UMI POS module                      | Shift and count vectors  | New POS tables                   | Shift parity           | Approval boundaries   |
| Reports             | UMI dashboard                  | Partial     | REIMPLEMENT               | `apps/umi-dashboard/src/screens`    | Metric definitions       | Commerce facts                   | Total reconciliation   | Analytics reads       |
| Flutter POS         | No current app                 | Client only | ADAPT                     | `apps/umi-pos`                      | Widgets and goldens      | Contract foundation              | Client parity          | Help surface          |
| Flutter design      | UMI tokens                     | Partial     | ADAPT                     | `apps/umi-pos`                      | Token and license review | None                             | Design approval        | Accessible UI         |
| KDS concepts        | Swift UMI KDS                  | Exists      | REIMPLEMENT missing parts | `apps/umi-kds`                      | LAN vectors              | KDS scope repair                 | Pilot and parity       | Queue explanations    |
| Observability       | UMI logging                    | Exists      | ADAPT                     | UMI logging                         | Redaction cases          | Gate 1 log repair                | Trace parity           | Diagnostic support    |
| Runbooks and errors | UMI conversation tools         | Partial     | ARCHIVE/ADAPT             | UMI tools                           | Stable errors            | Permissions and reads            | Tool safety gate       | Direct foundation     |

## Observed and planned destinations

The plan uses these canonical paths:

- `apps/umi-api`
- `apps/umi-dashboard`
- `apps/umi-kds`
- `apps/umi-pos`
- `packages/contract`
- `supabase`

The current UMI repository has all paths except:

- `apps/umi-pos`
- root `supabase`

The current migration evidence is in:

- `docs/migration/build-v3`
- `apps/umi-api/db/migrations`

The current checkout-adjacent order code is in:

- `apps/umi-api/src/modules/conversations/orders.repository.ts`
- `apps/umi-api/src/modules/conversations/tools/checkout.tools.ts`

These observed paths are not the final POS module boundary.

## Contradictions

The current UMI repository still contains transitional boundaries.

Examples include:

- `apps/umi-cash` has its own Prisma migrations.
- root `supabase` does not yet exist.
- build-v3 remains a document and SQL build set.
- POS appears in entitlement vocabulary, but complete POS modules do not exist.
- dashboard and API route drift remains documented.
- direct or legacy Supabase access remains documented as migration work.

These facts make the destination partial.

They do not authorize a NEXO backend.

## Cross-repository conclusion

UMI already owns the platform responsibilities.

NEXO supplies behavior, vectors, and client assets.

The correct action is selective extraction after build-v3 gates.
