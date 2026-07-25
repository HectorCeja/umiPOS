# Phase 0A — Architecture Salvage Inventory

## Decision

UmiPOS is an application of UMI.

NEXO cannot remain a production authority.

This phase permits selective extraction only.

## Provenance

| Item          | NEXO source                                | UMI destination                            |
| ------------- | ------------------------------------------ | ------------------------------------------ |
| Repository    | `HectorCeja/umiPOS`                        | `umiconsulting/umi`                        |
| Local root    | `/home/hceja/Documents/nexo`               | `/home/hceja/Documents/umi`                |
| Branch        | `architecture/umi-pos-transition`          | `architectureUMIposIntegration`            |
| HEAD          | `b6ef871de195484314b78c015ecfde9a5c8697f4` | `d5f399c8528fa3dda752aa37281d1b7a2c174348` |
| Upstream      | `origin/architecture/umi-pos-transition`   | None                                       |
| Initial state | Clean                                      | Clean                                      |

The source branch descends from `origin/transition/nexo-rc-baseline`.

The local remote ref resolves to the same frozen commit:
`b6ef871de195484314b78c015ecfde9a5c8697f4`.

No production UmiPOS data exists.

No schema or row migration is required.

## Authoritative inputs

The review used these primary inputs:

- `/home/hceja/Downloads/UMIPOS_FUSION_IMPLEMENTATION_PLAN.md`
- `apps`, `packages`, `infra`, `tests`, and `docs` in NEXO
- `apps/umi-api`, `apps/umi-dashboard`, and `apps/umi-kds` in UMI
- `packages/contract` and `packages/tokens` in UMI
- `docs/migration/build-v3` in UMI
- UMI architecture, migration, governance, and security documents

The supplied filename included `(1)`.

The workspace contains the same plan without that suffix.

## Main finding

UMI has the correct authority boundary.

UMI does not yet have complete POS behavior.

The destination state is:

- Identity, businesses, branches, staff, and entitlements already exist in UMI.
- KDS exists as a Swift client with a UMI backend projection.
- Loyalty and stored value exist in the UMI Cash module.
- The dashboard exists and must remain the only back-office application.
- `packages/contract` exists but lacks the complete POS contract emitter.
- Build-v3 defines the target schemas but is not yet a final migration authority.
- Checkout, physical cash, inventory, receipts, provider payments, and refunds remain partial or missing.
- `apps/umi-pos` does not exist.

## Decisions

The source application decisions are:

| NEXO application | Decision    | Destination                                              |
| ---------------- | ----------- | -------------------------------------------------------- |
| API              | REIMPLEMENT | `apps/umi-api/src/modules/pos`                           |
| Web dashboard    | RETIRE      | Selected UI enters `apps/umi-dashboard`                  |
| Worker           | RETIRE      | Selected failure behavior enters `apps/umi-api/src/jobs` |
| Flutter POS      | ADAPT       | New `apps/umi-pos`                                       |

The highest-value assets are:

- Flutter visual and accessibility components
- deterministic money and rounding vectors
- idempotency and response-loss vectors
- payment ambiguity rules
- receipt snapshot rules
- cash shift and append-only ledger requirements
- inventory movement concepts
- device enrollment, rotation, revocation, and audit requirements
- cross-tenant and cross-branch denial cases
- runtime freshness and redacted trace correlation principles

The highest-risk assets are:

- NEXO API authority
- Prisma schema and migrations
- NEXO identity and session code
- organizations, branches, memberships, and RBAC
- sales, payments, inventory, and cash persistence
- NEXO worker and outbox
- standalone PostgreSQL, Redis, MinIO, and telemetry stack
- handwritten Flutter API maps
- plaintext local financial recovery
- fake production hardware adapters
- dual-platform and reconciliation-bridge proposals

## Build-v3 blockers

Gate 1 blocks backend and database implementation.

The following work remains material:

- one ordered Supabase migration authority
- zero unresolved backend SQL
- final role and grant behavior
- privileged function repair
- KDS view ownership repair
- dashboard route and auth convergence
- staging promotion
- backup and restore rehearsal

These blockers do not prevent inventory or test extraction.

They do prevent POS database and backend implementation.

## Umi Assistant

Phase 0A does not implement Umi Assistant.

The future layer must use:

- typed contracts
- stable error codes
- permission-aware tools
- deterministic read models
- redacted trace correlation
- explicit audit facts
- fresh PIN and manager approval boundaries
- human confirmation for consequential actions

The assistant cannot bypass RLS, device trust, permissions, or financial invariants.

## Recommended Phase 0B batches

1. Freeze the source and supersession map.
2. Extract pure financial and operational vectors.
3. Create the UMI contract and permission gap map.
4. Review Flutter assets and licenses.
5. Create the test replacement map.
6. Prepare build-v3-blocked work without implementation.
7. Archive retired NEXO authority after replacement gates exist.

## Scope confirmation

This phase changed documentation and manifests only.

It did not modify product code, contracts, schemas, migrations, tests, workflows, or dependencies.

It did not run legacy Playwright or Docker certification.

It did not migrate data.

It did not create a commit or push.
