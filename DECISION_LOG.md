# NEXO Decision Log

## 2026-07-15 — Product polish direction

Selected the warm hospitality premium direction after comparing it with a refined technology direction in Storybook. The choice responds directly to repeated owner feedback that the prior purple technical dashboard lacked commercial personality. This is a frontend design decision only: no ADR or architecture boundary changes. Diagnostic surfaces may retain the denser technical direction behind progressive disclosure.

## 2026-07-14 — Prompt 12 checkpoint

- Sales Administration uses read models and existing Sales commands; it does not become a POS.
- Manual administrative sale remains disabled until trusted-device policy exists. No ADR is needed because this preserves existing boundaries.
- UMI alignment is explicitly deferred to Phase 13.

This is the required fast index for later prompts. Full rationale lives in `/docs/adr` and foundational ADRs in [docs/10-adrs.md](docs/10-adrs.md).

Phase 3 adds ADR-0023 through ADR-0026. Prompt 4.1A adds ADR-0027. Prompt 4.1B adds ADR-0028. Prompt 5 adds ADR-0029: embedded typed authorization engine with PostgreSQL-authoritative runtime inputs. Prompt 6 adds ADR-0030: verified bootstrap and versioned data-driven onboarding.

| ID      | Status   | Decision                                                 | Consequence / review trigger                                                   |
| ------- | -------- | -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| ADR-001 | Accepted | Modular monolith plus workers                            | Extract only for measured scale/isolation/ownership.                           |
| ADR-002 | Accepted | TypeScript, Next.js, NestJS                              | Annual support/performance review.                                             |
| ADR-003 | Accepted | PostgreSQL system of record                              | Redis/object/browser state are subordinate.                                    |
| ADR-004 | Accepted | Shared DB with `tenant_id` + RLS                         | Negative isolation tests mandatory.                                            |
| ADR-005 | Accepted | REST/OpenAPI + versioned internal events                 | No GraphQL without use-case ADR.                                               |
| ADR-006 | Accepted | Strong consistency for commercial core                   | Reporting/notifications remain eventual.                                       |
| ADR-007 | Accepted | Limited PWA offline, server authoritative                | Conflict rate or hardware evidence may trigger native review.                  |
| ADR-008 | Accepted | Organization is tenant; Branch is scope                  | Both dimensions enforced where relevant.                                       |
| ADR-009 | Accepted | Business type via capabilities, no forks                 | Conditional-growth threshold triggers review.                                  |
| ADR-010 | Accepted | Configurable money/tax engine                            | Snapshots and property tests required.                                         |
| ADR-011 | Accepted | External providers behind ports                          | No vendor SDK in domain/application.                                           |
| ADR-012 | Accepted | OpenTelemetry boundary                                   | Backend remains undecided for production.                                      |
| ADR-013 | Accepted | ASVS 5.0.0 L2 + selected L3                              | Evidence per release.                                                          |
| ADR-014 | Accepted | No card processing/CFDI in MVP                           | Separate future security/legal gates.                                          |
| ADR-015 | Proposed | Managed containers before Kubernetes                     | Finalize with cloud selection.                                                 |
| ADR-016 | Accepted | Analytics from rebuildable projections                   | Freshness and reconciliation observable.                                       |
| ADR-017 | Accepted | pnpm workspaces + Turborepo                              | One exact lockfile; task graph is CI contract.                                 |
| ADR-018 | Accepted | Node 24 LTS, ESM and exact versions                      | Upgrade by controlled PR; no Node Current.                                     |
| ADR-019 | Accepted | Prisma 7 plus SQL migrations                             | ORM cannot weaken RLS/constraints.                                             |
| ADR-020 | Replaced | Temporary Swagger foundation exception                   | Replaced by ADR-0026.                                                          |
| ADR-021 | Accepted | Vitest/testing-library and risk-based integration        | Do not duplicate Jest.                                                         |
| ADR-022 | Accepted | Local Compose parity services, not production topology   | Managed services/IaC follow cloud ADR.                                         |
| ADR-023 | Accepted | Organization root and compound tenant model              | Dependent relations carry tenant boundary.                                     |
| ADR-024 | Accepted | Explicit immutable TenantContext                         | No global or implicit tenant state.                                            |
| ADR-025 | Accepted | Separate database roles and forced RLS                   | Runtime never owns or bypasses tenant tables.                                  |
| ADR-026 | Accepted | Canonical OpenAPI 3.1.1 design-first                     | Contracts precede implementation.                                              |
| ADR-027 | Accepted | Reusable Identity Platform boundary                      | User/email/password domain is pure; auth adapters follow.                      |
| ADR-028 | Accepted | Native verifier + opaque server sessions                 | Re-evaluate for federation, regulation, scale/support triggers.                |
| ADR-029 | Accepted | Embedded DB-backed authorization engine                  | Re-evaluate for relationship scale/custom policy ownership.                    |
| ADR-030 | Accepted | Verified bootstrap + versioned data-driven onboarding    | Only pre-Membership tenant path; templates remain runtime-read.                |
| ADR-031 | Accepted | Descriptive Product with canonical Variant and outbox    | Inventory references Variant only; Product never owns stock.                   |
| ADR-032 | Accepted | Immutable inventory ledger and separate cost engine      | Snapshots rebuild; POS consumes cases/events, never stock fields.              |
| ADR-033 | Accepted | Sales is a headless bounded platform                     | Web, Flutter and UMI consume public contracts only.                            |
| ADR-034 | Accepted | Sale aggregate with exact minor-unit arithmetic          | Server totals and immutable line snapshots are authoritative.                  |
| ADR-035 | Accepted | Hybrid Inventory coordination through public ports       | Local reservation/consume is strong; integration delivery is eventual.         |
| ADR-036 | Accepted | Provider-neutral payment intent/attempt/allocation model | No PAN/CVV or provider SDK in the Sales boundary.                              |
| ADR-037 | Accepted | Scoped idempotency and public UMI event projections      | Payload mismatch conflicts; consumers deduplicate at-least-once delivery.      |
| ADR-038 | Accepted | Semantic design system and adaptive admin/POS shells     | UI displays server truth; Flutter maps behavior natively; UMI stays open.      |
| ADR-039 | Accepted | Cash boundary, immutable ledger and Sales event boundary | Cash owns physical tender; Sales allocations are consumed idempotently.        |
| ADR-040 | Accepted | Reconciliation, exceptional close and custody model      | Blind deterministic count; force/reopen preserve evidence; close/open handoff. |
| ADR-041 | Accepted | Client-neutral Cash contracts and public UMI projections | Allowlisted versioned events; productive UMI/offline remain disabled.          |
| ADR-045 | Accepted | Flutter tokens generated from frozen Web V1 source       | CI detects Dart drift; aliases stay typed.                                     |
| ADR-046 | Accepted | Flutter adaptive/accessibility/platform policy           | Certified thresholds; one preference API.                                      |
| ADR-047 | Accepted | Flutter goldens/assets/quality-mode foundation           | Owner-reviewed baselines; no auto acceptance.                                  |

## Open decisions

- Cloud, region, production container service, KMS/secret manager and observability backend.
- Production federation/enterprise IdP extension; native verifier remains current and provider-neutral.
- Production queue implementation; Redis is local cache/coordination and is not yet selected as durable queue.
- Hardware support matrix and offline limits.
- Customer-authored roles/policies, `CUSTOM` scope and platform-global authority.

No later prompt may silently resolve these. A material selection requires evidence and an ADR.

## Prompt 5 corrective record

The mandatory audit found that Redis account-attempt counters included successful logins for their full window. Successful authentication now clears only that account key; IP rate limiting and durable failed-login lockout remain unchanged. This corrects ADR-0028 behavior without changing its architecture, so no new ADR was required.

## Prompt 6 record

OpenAPI 4.0.0 publishes 44 operations and Authorization registry v2 has 44 permissions. Protected Control Plane writes revalidate the engine from database state in their write transaction. Local E2E quality resets seed plus Redis; CI installs pinned Chromium for five visual baselines.

## Prompt 7 record

ADR-0031 selects a descriptive Product aggregate with a canonical Variant, separate Price/Media/Barcode/Category entities, PostgreSQL search behind a port and transactional outbox. Inventory is explicitly excluded. OpenAPI 5.0.0 has 56 operations; registry v3 adds seven catalog permissions. A distinct `nexo_worker` role can only SELECT/UPDATE outbox and has no BYPASSRLS.

## Prompt 8 record

ADR-0032 selects an append-only inventory ledger keyed exclusively by ProductVariant, derived multidimensional availability, rebuildable snapshots, auditable reservations/transfers and independent cost layers. OpenAPI 6.0.0 has 66 operations. Nine new tenant tables use FORCE/default-deny RLS; Runtime cannot update/delete ledger evidence.

Prompt 9's mandatory audit found that reservation expiry was modeled but not scheduled. Migration 14 grants the existing Worker only the reservation transition and append-only ledger/event/outbox capabilities required to expire reservations. This corrects the implementation of ADR-0032 without changing its decision.

## Prompt 9 record

ADRs 0033–0037 establish the headless Sales boundary, aggregate/money model, Inventory coordination, payment abstraction and idempotent UMI-facing integration foundation. Sales never queries Product or Inventory tables, completed Sales cannot be physically deleted by Runtime, and public integration events expose a minimal versioned projection.

Final validation exposed two implementation defects without changing an architectural decision: Inventory's Sales adapter selected the oldest location rather than one with sufficient availability, and the Worker lacked EXECUTE on the RLS tenant function used by its new expiry policy. The adapter now selects through Inventory's public availability operation with exact quantity comparison; migration 19 grants only function execution, and Worker cycles cannot overlap or crash the process on one failed poll.

## Prompt 11 record

The opening audit found a clean-build Prompt 10 defect: `@nexo/ui` exported client hooks through a barrel without a client boundary. The barrel now declares `use client` and the clean web build passes. Cash uses a framework-free package, exact minor-unit ledger, database-resolved Membership, registry v5 permissions, 16 FORCE-RLS tables and OpenAPI 8.0.0. ADR-0039–0041 govern boundary, custody/reconciliation and client/public-event neutrality.

# 2026-07-16

- [ADR-0054](docs/adr/ADR-0054-private-profile-media-commit.md): private profile media is confirmed and associated atomically with user-scoped FORCE RLS.
