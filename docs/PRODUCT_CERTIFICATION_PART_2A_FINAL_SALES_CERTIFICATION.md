# NEXO Product Certification Part 2A — Final Sales Certification

## Veredicto

**PASS WITH OBSERVATIONS**

## Executive Summary

Commerce Core was exercised as one deployed system from Product and Pricing through reservation, checkout, exact payment, Cash posting, Inventory consumption, immutable Receipt, partial and total Refund, Inventory/Cash compensation, API restart, idempotent replay, Events and Outbox. The final authoritative reconciliation was `REFUNDED:23200:23200:1:0:3.000000:0`: MXN 232.00 sold, paid and refunded; one Receipt; zero net Cash; three units in the Inventory ledger after compensation; zero pending Sales outbox records.

No logical duplicate Sale, Payment, Cash movement, Receipt, Refund or Inventory movement was produced. Final directed results are 94 PASS, 0 FAIL and 0 BLOCKED. The verdict is not unconditional PASS because Reporting remains only a source contract, Sales/Cash domain-specific tracing is partial, and Product/Inventory outbox delivery is less capable than the Sales/Cash claim-and-quarantine pipeline.

The architecture and ownership defined in `UMI_NEXO_PLATFORM_CONSOLIDATION_STRATEGY.md` remained unchanged. UMI identifiers were consumed only as authoritative references; no Customer, Identity, Organization or Branch aggregate was created in NEXO.

## Cross-Domain Consistency

The new `commerce-domain-closure.spec.ts` creates a physical product and active price, receives three units, creates the same Sale ten times concurrently under one idempotency key, sells two units, pays and closes it, requests its Receipt ten times, restarts the API, replays Sale creation, applies a partial Refund and then the final Refund, replays both approvals and closes the Cash session.

The database assertion joins authoritative Sales, Payments, Refunds, Receipt, Cash ledger, Inventory ledger and Sales Outbox state. It passed exactly, with one Sale and Receipt, payments equal to refunds, Cash net zero, stock restored to its received quantity and no pending event.

## Sales

One authoritative Sale survived ten concurrent creates and an API-restart replay. It moved through checkout and completion once, retained actor, tenant, branch, timestamps and correlation, and ended `REFUNDED` only after its complete financial compensation. No orphan or impossible Sale state was observed.

## Payments

The completed Sale contains one valid CASH allocation for `23200` minor units. Payment total equals Sale total. Refund total never exceeded captured funds and replay did not create a second allocation or negative balance.

## Cash

Opening, Sale posting, partial and final cash compensation and closing were exercised against an isolated CashSession. The authoritative ledger net is zero after full Refund. The session closed successfully with no pending Cash postings; Cash pending outbox is zero.

## Inventory

Three physical units were received, two reserved and consumed by the Sale, and `0.5 + 1.5` were restored through append-only refund movements. Final ledger quantity is `3.000000`. SERVICE behavior and unrelated Inventory flows were not recertified.

## Refunds

Partial and total Refunds were approved and replayed after Sale completion and API restart. Their sum is exactly `23200`; repeated approval returned canonical state and did not duplicate financial or Inventory compensation.

## Receipts

Ten concurrent Receipt requests converged to one immutable official Receipt. Receipt data continued to describe the completed transaction while refunds remained separate historical compensation. Reprint feedback prevents double submit and does not create a new Receipt.

## Recovery

The API was restarted after commit and before replay. A transient connection reset at the restart boundary produced no false success and the same Sale idempotency key returned the original aggregate. Flutter durable payment checkpoints, restart restoration and query-only recovery passed locally and against the Docker API.

## Observability

API, Worker and OpenTelemetry Collector were healthy. The collector received trace batches during the integrated flow (including batches of 12 spans around closure) and continuous metrics with 16 metrics and 68–70 data points per API resource sample. API logs retained `x-request-id`, response status and duration while cookies, CSRF and device credentials were redacted.

Observation: Sales and Cash depend primarily on Node HTTP/database automatic instrumentation; explicit business spans are stronger in Product, Inventory and Control Plane. Collector debug batch evidence proves receipt, but does not by itself prove an exhaustive no-orphan-span invariant for every domain transition.

## Auditability

The certified Sale retains actor, tenant, branch, correlation, created/completed timestamps and 14 Sales events. Cash ledger entries retain actor, membership, source, Sale/allocation references, idempotency and correlation. Receipt and Refund history is immutable. Denied authorization is observable through request results and structured logs, although denial-specific audit records remain non-uniform.

## Authorization

The final flow used authorized Owner and Supervisor actors. Existing 45-case administration coverage reconfirmed default deny, permission enforcement, branch scope and hidden cross-tenant resources. Recovery and replay use the original authenticated context and do not expose privileged mutation endpoints.

## RLS

Core adversarial RLS SQL and Cash workflow RLS SQL passed. Runtime tables have RLS/FORCE RLS, default-deny without tenant context, tenant switching protection and restricted Worker privileges. Branch isolation remains ABAC/composite-reference based rather than branch-level SQL RLS, as documented by the architecture baseline.

## Events

The integrated Sale produced 14 append-only Sales events with one aggregate correlation lineage, actor and timestamps. Events represent Sale, Payment, Receipt and Refund transitions without provider secrets or card data.

## Outbox

Sales and Cash use transactional Outbox records, concurrent claims, leases, bounded retries and quarantine. Final pending counts are Sales 0 and Cash 0. Fifteen inherited Sales quarantine records remain: thirteen historical invalid certification fixtures and two intentional Part 4 recovery probes. Cash quarantine is zero.

Product and Inventory outboxes publish to a local logging sink and do not claim external broker exactly-once delivery. This is a documented capability boundary, not a failed financial consistency assertion.

## OpenAPI

PASS. The authoritative contract validates 144 unique operations, security and schemas. Compatibility against 3.0.0 passes. No non-existent Reporting aggregate, offline financial mutation, provider settlement or UMI-owned Customer CRUD is announced.

## SDK

PASS. Generation drift check, two SDK contract tests, typecheck and build passed. No regeneration was required because the public Commerce contract did not change.

## Flutter

PASS. Flutter 3.44.6 / Dart 3.12.2 analyze passed; 41 local runtime, SQLite checkpoint, payment safety, UI and recovery tests passed; one real Docker API flow passed. The SQLite native hook now uses the supported runtime system library rather than downloading a precompiled GitHub asset during the gate.

The first two attempts were blocked by a GitHub network timeout and then exposed that this host only ships the versioned runtime library. Those intermediate failures are retained as evidence; after the reproducible system-library configuration, product assertions passed with no retry flake.

## Web

PASS. Forty-five Playwright cases passed for Sales overview/history/detail/timeline, Refund evidence, Receipt retrieval/reprint, operational exceptions, permissions, tenant/branch isolation, conflicts and the explicit absence of a general Web POS. No false success, console/network failure or server 500 occurred.

## Reporting Contracts

Reporting is not implemented in this phase. Its real source contract is sufficient for later read models: tenant/organization/branch identifiers, UMI customer reference, Sale/Payment/Refund/Receipt identifiers and states, exact minor-unit totals and currency, immutable product/price snapshots, actor, timestamps, business date, origin, correlation and append-only Inventory/Cash movements. No analytical query or BI aggregate was added.

## Defectos encontrados

1. **No material / operability:** the sqlite3 native hook default downloaded a release binary from GitHub during Flutter execution, making the certified runtime gate dependent on external network availability.
2. **Test harness:** cleanup at the intentional API restart boundary initially surfaced `ECONNRESET`; authoritative state was already correct.

No material Commerce consistency defect was reproduced.

## Correcciones aplicadas

1. Configured sqlite3's official native hook to resolve the system runtime library. No dependency version or lockfile was changed.
2. Made integrated test health polling and cleanup tolerate the expected restart socket boundary without suppressing product assertions.
3. Added a focused end-to-end domain-closure suite and immutable certification evidence.

## Capacidades no implementadas

- Reporting/Analytics read models and BI aggregates.
- External payment provider settlement and chargebacks.
- Fiscal CFDI/SAT receipts.
- Financial execution while offline; Flutter intentionally blocks it.
- External durable broker delivery for Product/Inventory outboxes.

## Riesgos restantes

- Explicit Sales/Cash business spans and dedicated retry/recovery metrics are partial.
- Audit records for denied requests are not uniform across every controller.
- Product/Inventory Outbox semantics are weaker than Sales/Cash and need a future integration decision before external consumers depend on them.
- Governed cleanup must preserve evidence when retiring the 15 Sales quarantine fixtures.
- The dependency audit reports 22 inherited advisories (1 critical, 3 high, 11 moderate, 7 low), led by Vitest UI/Vite development-server and transitive Picomatch findings. These tools are not deployed as Commerce runtime services, but remediation requires a separately governed dependency upgrade.

None of these observations permits double charge, wrong change, lost stock, duplicate Refund/Receipt or cross-tenant access in the certified scope.

## Tests ejecutados

| Suite                                         |                                      Resultado |
| --------------------------------------------- | ---------------------------------------------: |
| Integrated Commerce closure                   |                                       1/1 PASS |
| Flutter local runtime                         | 41/41 PASS, 1 real-API case excluded by design |
| Flutter real Docker API                       |                                       1/1 PASS |
| Web Sales administration and Receipt feedback |                                     45/45 PASS |
| SDK contract                                  |                                       2/2 PASS |
| Core RLS SQL                                  |                                           PASS |
| Cash workflow RLS SQL                         |                                           PASS |
| OpenAPI validation / compatibility            |                                       2/2 PASS |
| `pnpm check`                                  |                                           PASS |

Directed total: **94 PASS / 0 FAIL / 0 BLOCKED**. Two infrastructure retries were required for the external SQLite download issue; flakes: 0.

## Quality Gates

`format:check`, lint, typecheck, unit suites, production builds, Prisma validation/generation, integrated E2E, Recovery/replay/retry, RLS SQL, OpenAPI, SDK, Flutter and Web all passed. `pnpm check` passed end to end. API, Web, Worker, PostgreSQL, Redis, MinIO and OpenTelemetry are healthy. Forty-seven migrations are applied with no rollback.

The separately executed dependency audit reported inherited development-tool advisories and therefore is recorded as an observation, not silently counted as PASS. No dependency or lockfile was upgraded in this scope.

## Evidencia

- `artifacts/certification/part-2a-final-sales/summary.json`
- `artifacts/certification/part-2a-final-sales/reconciliation.json`
- `artifacts/certification/part-2a-final-sales/runtime.json`
- Integrated Sale: `4e002414-3f0f-4dea-9d3f-7c40cacae0d8`
- Runtime images: API `6830cb…3bc20`, Web `7036ed…c5c30`, Worker `507292…ac433`, Migrate `e2f44b…00668f`.

## Documentación

This document closes Product Certification Part 2A without changing the consolidation strategy or beginning Part 2B.

## Archivos modificados

- `tests/e2e/commerce-domain-closure.spec.ts`
- `apps/nexo_pos/pubspec.yaml`
- `docs/PRODUCT_CERTIFICATION_PART_2A_FINAL_SALES_CERTIFICATION.md`
- `artifacts/certification/part-2a-final-sales/{summary,reconciliation,runtime}.json`

Part 4 recovery files remain modified in the shared worktree and are documented in its own report; they are not represented as new Part 5 changes.

## Veredicto Final del Dominio Sales

**PASS WITH OBSERVATIONS.** Commerce Core is internally consistent across Sales, Payment, Cash, Inventory, Refund, Receipt and Recovery. Final financial and Inventory differences are zero, all required public/client gates pass, and no material defect remains open.

## Handoff a Product Certification Part 2B — Reports & Analytics

Part 2B may assume authoritative exact-money Sales/Payments/Refunds/Cash records, immutable Receipt and product/price snapshots, append-only Inventory/Cash movements, tenant/organization/branch and UMI Customer references, actor/timestamp/business-date/correlation fields, transactional Sales/Cash Events and Outbox, RLS, OpenAPI, SDK, Flutter and Web operational contracts.

Part 2B must not assume an existing Reporting aggregate, branch-level SQL RLS, external broker delivery for Product/Inventory, fiscal compliance, provider settlement or offline financial execution. It should build read-only reporting contracts without dual-write, shared databases or re-owning UMI domains. Part 2B was not started.

## NTFY

Start notification: HTTP 200. Material external-network blockage notification: HTTP 200. Final notification: HTTP 200. Communicated verdict: PASS WITH OBSERVATIONS; 94 PASS, 0 FAIL, 0 BLOCKED; duration 22 minutes.
