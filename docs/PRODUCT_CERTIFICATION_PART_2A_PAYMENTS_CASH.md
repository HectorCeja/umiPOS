# NEXO Product Certification Part 2A — Payments and Cash

## Veredicto

PASS WITH OBSERVATIONS.

## Executive Summary

Payments/Cash implementados son consistentes bajo retry y concurrencia. Se corrigieron dos defectos materiales en Payment: replay divergente aceptado y sobrepago registrable. CASH, pagos externos manuales, pagos mixtos, completion, ledger de caja, sesiones, apertura, movimientos, conteo, cierre y variance pasan. No existe adquirente real y Flutter runtime está bloqueado por toolchain ausente.

## Scope

Payments, Cash, Cash Sessions, posting financiero, autorización, aislamiento, contratos y superficies existentes. Refunds, receipts completos, fiscal, settlement y offline quedan fuera.

## Inherited Guarantees

Se usaron Sale, Totals, Reservations, Inventory, autorización y RLS certificados en Part 2A Part 1/Part 1B, con regresión focal.

## Payments Architecture

`SalePaymentRecord`, `PaymentIntentRecord` y `PaymentAttemptRecord` son la autoridad actual. Métodos operativos: CASH, CARD_EXTERNAL, BANK_TRANSFER y OTHER. Los no-CASH son registros externos/manuales; no prueban autorización de adquirente.

## Cash Architecture

CashRegister y CashDrawer son entidades lógicas separadas. CashSession delimita operación; CashMovement es ledger append-only y el worker proyecta SaleCompleted a CASH_SALE cuando existe sesión abierta compatible.

## Payment Aggregate

Payment queda tenant/sale-bound, importe/currency/status son autoritativos. Cliente no controla paidTotal, balanceDue, change, estado ni timestamps.

## Payment Methods

CASH PASS; CARD_EXTERNAL/BANK_TRANSFER/OTHER PASS WITH OBSERVATIONS como registro manual. Card provider, QR, wallet, Gift Card y Store Credit: NOT IMPLEMENTED.

## Payment Lifecycle

La implementación actual captura el registro aceptado de forma inmediata. Outcome canónico y recuperación por attempt/key pasan. Provider pending/authorization/capture real: NOT OPERATIONAL.

## Sale Payment Boundary

Paid/due/change se derivan de pagos CAPTURED y Totals. Completion exige due=0. Pagos posteriores, sobrepago y estados inválidos se rechazan 409.

## Cash Payments

CASH requiere amount positivo y tendered presente, con tendered >= amount. Replay idéntico es determinista; divergente es 409.

## Change Calculation

Minor units/BigInt, backend autoritativo. Cambio solo existe cuando hay CASH y tendered supera total; vectores exactos y mixed pasan.

## External Payments

Referencia/provider label se preservan sin secretos. Es evidencia manual, no verificación de proveedor.

## Card Payment Readiness

NOT OPERATIONAL: CARD_EXTERNAL no es adquirente. No se encontró persistencia PAN/CVV/track.

## Mixed Payments

PASS: cash + external, parciales sucesivos y completion exacta; change solo por efectivo.

## Partial Payments

PASS dentro de PAYMENT_PENDING; balance restante es autoritativo y no permite completion prematura.

## Overpayment

PASS tras corrección: amount aplicado nunca supera balance. CASH puede recibir tendered mayor y producir change; non-cash no crea crédito implícito.

## Payment Idempotency

PASS: diez requests same-key crean un Payment/Intent/Attempt; payload divergente y key usada en otra Sale son 409.

## Payment Concurrency

PASS: bloqueo de Sale y constraints serializan registros y completion; diez completions producen un ganador y nueve conflictos.

## Sale Completion

PASS: exige checkout, pagos suficientes y reservations válidas. Inventory se consume una vez y Sale queda histórica.

## Payment–Inventory Coordination

PASS WITH OBSERVATIONS: Inventory commit precede la transición Sale; idempotencia evita doble consumo. La proyección Sale→Cash es asíncrona y reintenta; recovery profundo se transfiere a Part 3A.

## Financial Postings

CashMovement es autoridad de efectivo, append-only. No existe contabilidad general de doble partida.

## Cash Register and Drawer

PASS lógico; hardware drawer/device binding fuerte no se anuncia.

## Cash Session Lifecycle

PASS: una sesión activa por scope, transiciones/versiones, cierres y carreras protegidos.

## Opening Cash

PASS: exacto, histórico, idempotente y genera movimiento/event/outbox.

## Cash Movements

PASS. Tipos automáticos no son falsificables desde el comando manual.

## Cash In and Cash Out

PASS con amount positivo, reason, permisos, sesión abierta, idempotencia y branch scope.

## Expected Cash

PASS: suma firmada autoritativa del ledger; external no incrementa efectivo y replay no duplica.

## Denominations

PASS: denominaciones y cantidades se validan; backend calcula total contado.

## Closing Cash

PASS: expected, counted, variance, version, actor y timestamps son autoritativos; cierre concurrente no duplica.

## Cash Variance

PASS: counted - expected con BigInt. Approval thresholds dependen de policy y permanecen una limitación operativa configurable.

## Pending Financial Postings

PASS: los postings financieros pendientes bloquean cierre. En failure smoke, SaleCompleted sin sesión abierta reintentó y fue puesto en cuarentena explícita; no se falsificó expected.

## Shift Boundaries

Workforce Shift separado: NOT IMPLEMENTED. CashSession no se presenta como scheduling laboral.

## Register, Device and Session Binding

Register/session/branch son autoritativos. Device enrollment fuerte permanece PARTIAL.

## Cashier Ownership

PASS según policy auditable de sesión, con supervisor/owner sujetos a ABAC.

## Authorization

PASS: Owner/Admin, Supervisor branch-scoped y Cashier según grants; Employee/ReadOnly default-deny para mutaciones no concedidas.

## Tenant Isolation

PASS en API, FK, SQL, workers, events y outbox.

## Branch Isolation

PASS mediante ABAC y relaciones Register/Session→Branch. No se afirma RLS por branch.

## RLS

PASS: 65/65 tablas públicas con RLS/FORCE RLS; default-deny y workflow Cash SQL (8/8) pasan.

## Database Constraints

PASS: tenant FKs, unique active session, idempotency, cantidades y ledger inmutable.

## Exact Money Arithmetic

PASS: strings minor-unit + BigInt en dominio, DB, API y SDK; sin Number autoritativo.

## Transactional Integrity

PASS dentro de cada comando Payment/Cash. Coordinación asíncrona Sale→Cash queda observable y reintentable.

## Concurrency

27 escenarios Cash concurrentes, 10 payment replays y 10 completions adversariales pasan.

## Events and Outbox

PASS WITH OBSERVATIONS: transaccionales, tenant/branch/aggregate/actor/correlation; uniformidad causation permanece parcial.

## Audit

PASS para éxitos; denials uniformes continúan PARTIAL y se transfieren a Security/Observability.

## Error Contract

PASS: 400/403/404/409 distinguen validación, permiso, ocultamiento y conflicto sin stack/SQL/secrets.

## Rate Limiting

PASS WITH OBSERVATIONS: replay financiero se recupera por key/outcome; no se modificó rate limit global.

## OpenAPI

PASS, 144 operaciones, referencias válidas y sin provider/Gift Card/settlement fantasma.

## SDK

PASS: generate:check, tests y build sin drift.

## Web Admin

PASS tras actualizar pruebas al NexoSelect/Toast actuales. Cuatro escenarios Cash pasan; console/network limpios en repetición aislada. Un ERR_ABORTED intermedio no se reprodujo.

## Flutter POS Contract

API/SDK contract PASS; runtime BLOCKED porque `flutter` no está instalado. No se simuló.

## Failure Smoke

Worker retry/quarantine y outbox pendiente observables; no doble Payment/CashMovement ni cierre inconsistente.

## Historical Integrity

PASS: ledger Cash append-only, Payments terminales y sesiones cerradas no se reescriben por API runtime.

## Migrations

44 migraciones aplicadas; schema válido, sin migración nueva requerida.

## Defectos encontrados

1. MATERIAL: Payment same-key aceptaba payload divergente. 2. MATERIAL: Payment podía registrar amount sobre el balance. Tests Web obsoletos asumían un selector input, toast y fixtures preexistentes.

## Correcciones aplicadas

Comparación canónica de replay; respuesta replay completa; límite atómico contra total/paid; reglas CASH tendered; prohibición tendered non-cash; pruebas concurrentes y Web actualizadas.

## Capacidades no implementadas

Provider real, Gift Card, Store Credit, QR/wallet, chargebacks, settlement, workforce Shift y offline payments.

## Riesgos restantes

Posting Sale→Cash requiere sesión abierta y coordinación worker; device binding parcial; audit denials/correlation parciales; Flutter runtime bloqueado.

## Riesgos transferidos

Refunds/voids/receipts a Part 2A Part 3; offline/recovery a Part 3A; storms a Part 3B; settlement/reporting/fiscal a sus fases.

## Tests ejecutados

Cash unit 5; Cash E2E dirigido 31; API 31; Sales E2E 6; Web Cash 4; SDK 2; RLS general y Cash workflow 8/8. Sin retries de producto; una repetición Web aisló un abort de navegación no reproducible.

## Tests no ejecutados

Flutter analyze/test BLOCKED. Provider/webhook, chargebacks, settlement, refunds completos y offline: fuera de alcance/NOT IMPLEMENTED.

## Quality Gates

Format, lint, typecheck, unit, build, OpenAPI, SDK, RLS, Docker API y health PASS. `pnpm check` PASS (ver evidencia de ejecución). Dependency audit N/A: manifests/lockfile no cambiaron.

## Evidencia

`artifacts/certification/part-2a-payments-cash/summary.json`, salidas de Playwright/SQL y Docker local.

## Artefactos certificados

API `sha256:029ac3...67cd4`; Web `sha256:7ec2f9...22f4c`; Worker `sha256:e41632...9e74c`; todos como usuario `nexo`.

## Archivos modificados

Repository Sales Payment, pruebas Sales/Cash Web, este reporte y summary JSON.

## Handoff a Product Certification Part 2A — Parte 3

Puede asumir Payment idempotente, cash/external/mixed allocation, completion, CashMovement, CashSession/open/expected/count/close/variance, aislamiento, RLS y historia. No debe asumir provider real, chargebacks, settlement, Gift Card, offline, fiscal receipt, Flutter runtime ni Refund lifecycle certificado.

## NTFY

Inicio enviado. Final se envía con veredicto, gates y duración.
