# NEXO Product Certification Part 2A — Parte 3

## Veredicto

**PASS WITH OBSERVATIONS**

Las capacidades operativas existentes de Refund y Receipt son consistentes después de siete correcciones materiales. No se reprodujo doble refund, sobredevolución monetaria o de cantidad, doble movimiento de caja, doble movimiento Inventory, Receipt duplicado ni mutación histórica. Returns y Voids independientes no existen; Flutter runtime quedó BLOCKED por ausencia del toolchain.

## Executive Summary

La implementación real usa `RefundIntentRecord` y `RefundLineRecord` dentro de Sales. Un refund se solicita como `REQUESTED`, se aprueba como `APPROVED` y el worker lo finaliza como `COMPLETED`. La compensación final de Cash, Sale, Payment, Inventory, Events y Outbox ahora ocurre mediante una frontera transaccional única, tenant-scoped e idempotente.

Receipt existe como `SaleReceiptRecord`: snapshot inmutable, hash de contenido y relación uno-a-uno con Sale. La operación repetida recupera el mismo Receipt para reimpresión; no crea otro. El folio de Sale es el número mostrado. No existe secuencia Receipt independiente, PDF fiscal ni CFDI.

Se respetó la arquitectura consolidada: NEXO conserva Refunds/Receipts y solamente mantiene referencias históricas a Organization, Branch, Employee/actor y Customer. No se creó Customer Aggregate, dual-write, base compartida ni sincronización bidireccional con UMI.

## Refund Aggregate

- Autoridad: `refund_intents` y `refund_lines`.
- Campos reales: tenant, Sale, actor, status, amount minor units, idempotency key, reason, timestamps; líneas con SaleItem, quantity decimal(18,6), authoritative amount, destination y reason.
- El servidor recalcula cada monto prorrateando el total histórico de la línea con HALF_UP.
- Tenant, Sale, actor, status, monto, timestamps y versión no son autoridad del cliente.
- Refund lines son append-only. Refund intent permite solamente `REQUESTED → APPROVED|REJECTED` y `APPROVED → COMPLETED|FAILED`.

## Refund Lifecycle

| From      | To        | Command            | Side effects                                    | Idempotency                              |
| --------- | --------- | ------------------ | ----------------------------------------------- | ---------------------------------------- |
| —         | REQUESTED | Request refund     | Lines, event, outbox, Sale version              | tenant + key + payload fingerprint       |
| REQUESTED | APPROVED  | Approve refund     | RefundApproved event/outbox                     | replay returns APPROVED/COMPLETED        |
| APPROVED  | COMPLETED | Worker processing  | Cash, Payment, Sale, Inventory, events/outboxes | refund/event identifiers and unique keys |
| REQUESTED | REJECTED  | Structural support | No public command found                         | NOT OPERATIONAL                          |
| APPROVED  | FAILED    | Structural support | No public recovery command found                | NOT OPERATIONAL                          |

Invalid terminal rewrites are rejected by the database. A completed approval replay returns the historical result rather than an unsafe conflict.

## Returns

**NOT IMPLEMENTED** as an independent Aggregate or workflow. Return destination and returned quantity are represented inside RefundLine. This is sufficient for the certified compensation path but not an approval/rejection Return lifecycle.

## Voids

**NOT IMPLEMENTED** as an independent Aggregate. Pre-completion Sale cancellation remains inherited; post-completion void is not announced or certified.

## Receipts

- One immutable snapshot per Sale.
- Snapshot includes Sale folio/date/currency, Organization and Branch display data, seller, line/Product/Variant snapshots, quantities, prices, discounts, taxes and Payments.
- SHA-256 content hash persists with the model.
- Ten concurrent issue requests returned one Receipt ID.
- Reprint is retrieval of the same Receipt, not regeneration.
- Receipt number is the Sale folio; independent numbering is **NOT IMPLEMENTED**.
- Backend PDF, fiscal rendering and printer integration are **NOT IMPLEMENTED**.

## Inventory Compensation

PHYSICAL returns create a new positive `RETURN` Inventory movement in `ON_HAND`, `DAMAGED` or `QUARANTINE`; `DISCARDED` produces no stock increase. Original SALE location is resolved from the immutable ledger. Movement and snapshot are idempotent. A full external refund restored exactly one sold unit and replay preserved the same balance. SERVICE refunds create no Inventory movement.

## Payment Compensation

Refund total is bounded by captured Payments and cumulative prior non-rejected refunds. Full refund changes captured Payments to `REFUNDED`; Sale becomes `REFUNDED`. Partial refund leaves Payment history intact and Sale becomes `PARTIALLY_REFUNDED`. Paid totals are never rewritten negative.

## Cash Compensation

CASH refunds allocate only against captured CASH payments, create one `CASH_REFUND` entry per allocation, decrement expected cash and preserve exact minor-unit arithmetic. Mixed refunds post only the CASH component. External-only refunds bypass Cash. Cash posting and aggregate completion now share one database transaction.

## Authorization

Existing `sales.refund` and `receipts.generate` permissions are enforced transactionally against authoritative Sale branch context. Owner happy paths passed. Default-deny, unauthorized actor, branch and tenant scenarios passed through the focal API and the 44-scenario Sales Administration suite.

## Tenant Isolation

Cross-tenant Refund/Sale access returned 403/404 without disclosure. RLS default-deny, connection context switching and tenant policies passed. Composite tenant relations prevent cross-tenant SaleItem/Refund relationships.

## Branch Isolation

Branch is derived from Sale and enforced through ABAC and authoritative FKs. SQL RLS remains tenant-scoped, consistent with the inherited architecture; branch-level RLS is not claimed.

## Events

Observed events: `RefundRequested`, `RefundApproved`, `RefundCompleted`, `ReceiptGenerated`, `InventoryRestored`, `CashRefundPosted`. Envelopes include tenant, aggregate, version, correlation, timestamps and minimized payloads. No provider secrets or card data are present.

## Outbox

Sales, Inventory and Cash outboxes are written transactionally with their aggregates. Worker retry after an injected historical failure completed once. Refund replay produced no duplicate cash or inventory movements. Dedicated ReceiptReprinted event is **NOT IMPLEMENTED**.

## OpenAPI

PASS: 144 unique operations, valid references/security and compatibility 3.0.0. Refund amount documentation now states that the backend recalculates the immutable prorated amount and rejects mismatch. No Return, Void, Customer CRUD, Gift Card, Loyalty, CFDI or Offline capability is announced.

## SDK

PASS: `generate:check`, tests and build. No drift. The SDK exposes the real Refund and Receipt operations; absent Return/Void operations remain absent.

## Flutter

Contract discovery found Receipt display/printing/reprint support but no complete Refund UI. Runtime validation is **BLOCKED** because neither `flutter` nor `dart` is installed. No PASS was inferred.

## Web

PASS: Refund administration and Receipt surfaces passed 44 API/admin scenarios plus the browser reprint feedback scenario. UI wording was corrected from “regenerar” to “preparar reimpresión”, matching the immutable server behavior. Final browser audit had no false success, console, network, hydration or 500 error.

## Defectos encontrados

1. Cumulative quantity could exceed the sold quantity across refund intents.
2. Divergent payload with reused Refund idempotency key replayed silently.
3. Duplicate SaleItem lines in one request could bypass quantity validation.
4. Client-selected line amount could differ from the authoritative historical prorate.
5. Receipt rows allowed UPDATE and RefundLine rows allowed UPDATE/DELETE through SQL paths.
6. Refund approval did not complete Sale/Payment/Inventory and external refunds were incorrectly routed through CASH.
7. Cash posting and final completion were separate worker transactions with implicit tenant context.

## Correcciones aplicadas

- Authoritative HALF_UP prorating and exact six-decimal quantity arithmetic.
- Same-key payload fingerprint conflict (409), duplicate-line rejection and serialized cumulative quantity guards.
- Database deferred total validation, immutable history triggers and Receipt privilege revocation.
- Idempotent PHYSICAL return movements and snapshots.
- Sale/Payment state compensation and RefundCompleted/InventoryRestored events.
- External-vs-CASH probe with least-privilege worker function.
- Atomic `process_approved_refund_worker` transaction with explicit tenant context.
- Safe approval replay after completion.
- Accurate Web reprint semantics.

## Capacidades no implementadas

- Independent Return Aggregate/workflow.
- Post-completion Void Aggregate.
- Independent Receipt numbering sequence.
- Dedicated Receipt reprint audit/event.
- Backend PDF/fiscal/CFDI/SAT rendering.
- Provider refund, settlement and chargeback lifecycle.
- Complete Flutter Refund flow.

## Riesgos restantes

- Receipt reprints have no dedicated server audit record.
- Payment compensation for external providers is accounting state only; no provider integration exists.
- Historical quarantined SaleCompleted events from unrelated certification fixtures remain visible operationally; Refund outbox ended clear.
- Flutter runtime remains unverified.

## Tests ejecutados

- `pnpm check`: PASS after one disclosed intermediate lint failure, corrected and repeated.
- Sales unit: 10/10 PASS.
- Sales E2E including PHYSICAL refund: 7/7 PASS.
- Cash/Refund E2E: 7/7 PASS.
- Sales Administration: 44/44 PASS.
- Receipt reprint browser: 1/1 PASS.
- RLS integration SQL: PASS.
- Cash refund negative SQL: PASS after adapting the legacy test to immutable lifecycle and effective policy scope.
- Direct SQL historical mutation probes: PASS (UPDATE/DELETE rejected).
- OpenAPI validate/compatibility: PASS.
- SDK generate/check/tests/build: PASS.

Intermediate failures were retained in the certification narrative: missing worker privilege for a direct table probe, external refund misclassification, post-completion approval replay conflict, non-atomic tenant context, one lint rule and one stale Web string. All were corrected and rerun.

## Quality Gates

| Gate                                              | Result                 |
| ------------------------------------------------- | ---------------------- |
| format/lint/typecheck/unit/build                  | PASS                   |
| Refund/Cash/Sales E2E                             | PASS                   |
| RLS and SQL constraints                           | PASS                   |
| OpenAPI/compatibility                             | PASS                   |
| SDK drift/tests/build                             | PASS                   |
| Web browser                                       | PASS                   |
| Docker build/deploy                               | PASS                   |
| API/Web/Worker/PostgreSQL/Redis/MinIO/OTel health | PASS                   |
| Runtime non-root                                  | PASS (`uid=100(nexo)`) |
| Flutter analyze/test                              | BLOCKED                |

## Evidencia

- `artifacts/certification/part-2a-refunds-receipts/summary.json`
- `artifacts/certification/part-2a-refunds-receipts/concurrency.json`
- `artifacts/certification/part-2a-refunds-receipts/runtime.json`
- `artifacts/certification/part-2a-refunds-receipts/contracts.json`
- Browser screenshot: `artifacts/owner-corrective/screenshots/sales-receipt-regenerated.png`

## Archivos Modificados

- Sales refund domain tests and calculation.
- Sales Prisma repository.
- Worker processing.
- Three integrity/coordination migrations.
- Cash refund and Sales E2E suites.
- Cash refund negative SQL suite.
- OpenAPI Refund description.
- Web Sales Administration and Receipt feedback test.
- This report and certification evidence.

## Handoff a Part 2A — Parte 4

Part 4 may assume: authoritative/idempotent Refund intent, safe partial/full compensation, exact CASH component, atomic completion, immutable Receipt snapshot, one Receipt per Sale, PHYSICAL return ledger integrity, SERVICE no-inventory behavior, tenant/branch isolation, RLS, events/outbox, OpenAPI and SDK consistency.

It must not assume: independent Return/Void Aggregate, provider refund, chargeback/settlement, fiscal Receipt/CFDI, dedicated reprint audit, Offline synchronization or Flutter runtime validation.

## NTFY

Start notification: HTTP 200. Final notification: HTTP 200.
