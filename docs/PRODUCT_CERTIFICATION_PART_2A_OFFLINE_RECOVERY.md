# NEXO Product Certification Part 2A — Parte 4

## Veredicto

**PASS WITH OBSERVATIONS**

## Executive Summary

NEXO recuperó de forma consistente retries, respuestas perdidas, restart de API, crash/restart de Worker, expiración de leases, publish interrumpido, backlog de 100 eventos, restart de PostgreSQL y restart de dispositivo. No se reprodujo duplicación de Sale, Payment, Refund, Receipt, Inventory Movement, Cash Movement ni entrega pública.

Se corrigió un defecto material en Flutter POS: después de capturar un Payment se persistía el checkpoint como aprobado antes de completar Sale/Receipt, pero bootstrap solo recuperaba `processing/unknown`. Un crash en esa ventana podía dejar el cobro fuera del recovery automático. El checkpoint permanece ahora pendiente hasta recuperar completion y Receipt, y después pasa a `completed`.

Offline financiero continúa deliberadamente no implementado. El POS permite catálogo cacheado y cart draft, pero bloquea Sale, Payment y Refund sin servidor. Esta política fail-closed es segura y no se presenta como sincronización offline.

Se respetó la estrategia UMI × NEXO: no se modificó ownership, no hubo dual-write, base compartida ni sincronización bidireccional.

## Offline

**PASS WITH OBSERVATIONS.** Existe SQLite local con cart drafts, recovery de Payment, Receipt cache, print jobs y local outbox. La política V1 prohíbe operaciones financieras offline. El local outbox no es un motor operacional de sincronización financiera y no se certifica como tal.

## Recovery

Payment recovery consulta el resultado autoritativo por attempt o idempotency key, nunca recrea el cobro, completa la Sale si corresponde y recupera el Receipt oficial. Cash, Refund e Inventory se recuperan mediante funciones y movimientos idempotentes heredados y regresionados.

## Retry

- 100 requests concurrentes con la misma Sale key produjeron un Sale lógico.
- `429` se trató como throttling explícito y el cliente reintentó con la misma key.
- Refund, Inventory Count, Cash posting y Receipt conservaron una sola operación lógica.
- Payload divergente con key reutilizada fue rechazado con 409.

## Replay

El replay de Sale después del restart devolvió el mismo Sale ID. Worker replay después de crash post-publish conservó una entrega durable por event ID. El recovery de Payment usa `QUERY_ONLY_DO_NOT_RECREATE` para resultados ambiguos.

## Crash Recovery

Se inyectó terminación del Worker con código 86 inmediatamente después del claim y después de escribir el sink. Se reinició PostgreSQL y los conteos `Sales:Payments:Inventory:Cash:Receipts` permanecieron exactamente `122:71:570:72:17` antes y después.

## Worker Recovery

Claims usan `FOR UPDATE SKIP LOCKED`, owner UUID y lease de 30 segundos. Dos workers recuperaron un lease expirado sin entrega duplicada. Backoff exponencial llega a cuarentena en el décimo intento. El ciclo evita solapamiento dentro del mismo proceso.

## API Recovery

La API fue reiniciada después del burst idempotente. El cliente conservó sesión, reintentó con la misma key y obtuvo el mismo Sale. Prisma restableció conexión después del restart de PostgreSQL.

## Device Recovery

Flutter POS conserva checkpoints financieros en SQLite. Una prueba cerró el archivo real, reabrió el proceso lógico y encontró la misma key pendiente. Bootstrap ejecuta recovery al crear el contexto operacional. Sesión y credencial se restauraron desde secure storage en el E2E real.

## Financial Recovery

El escenario de crash después de captura produjo un Payment solamente, completó posteriormente la Sale y recuperó un Receipt. Cash refunds y mixed refunds conservaron una sola compensación. No hubo balances negativos ni cobros recreados.

## Inventory Recovery

Inventory Count replay creó un Count, un Movement y un Event. Reconstrucción desde ledger/snapshots pasó. Last-stock, Reservation e Inventory refund continuaron consistentes bajo las regresiones focales.

## Consistency

| Failure                           | Recovery                                  | Resultado |
| --------------------------------- | ----------------------------------------- | --------- |
| 100 duplicate Sale requests       | Idempotency + rate limit + same-key retry | PASS      |
| API restart                       | DB/Redis-backed session and idempotency   | PASS      |
| Worker crash after claim          | Lease expiry                              | PASS      |
| Worker crash after publish        | Unique durable delivery                   | PASS      |
| 100-event backlog, two workers    | SKIP LOCKED claims                        | PASS      |
| Payment captured, app interrupted | Persisted query-only checkpoint           | PASS      |
| Device restart                    | SQLite reopen                             | PASS      |
| PostgreSQL restart                | Durable ledgers + reconnect               | PASS      |
| Redis unavailable                 | Core transaction remains DB-authoritative | PASS      |
| MinIO unavailable                 | Financial path remains DB-authoritative   | PASS      |

## Authorization

Recovery does not provide a privileged public mutation endpoint. Payment outcome, Sale, Receipt, quarantine and operational diagnostics retain authentication, permission and authoritative organization/branch context. Default-deny and cross-tenant/branch scenarios passed in 45 Web/API cases.

## RLS

Core RLS and Cash workflow RLS suites passed after all restarts. FORCE RLS, no-tenant default-deny, connection reuse, worker scope and tenant isolation remained intact.

## Events

Event IDs remain stable across replay. Correlation and tenant context persist. Public Cash delivery uses an event-ID uniqueness boundary. Exactly-once business effects are achieved through idempotent consumers and unique records; the transport remains an at-least-once outbox pattern.

## Outbox

Sales and Cash use claims, leases, exponential retry and quarantine. A 100-event Cash backlog ended `100 published / 0 pending / 100 distinct deliveries`. Final state: Sales pending 0, Cash pending 0. Sales quarantine contains 13 inherited invalid certification fixtures plus 2 intentional Part 4 failure probes; Cash quarantine is 0.

Product and Inventory outboxes currently use a simpler log-only publisher without the Sales/Cash claim/quarantine lifecycle. No external durable consumer exists for them, so end-to-end broker delivery is not claimed.

## OpenAPI

PASS: 144 operations, validation and compatibility 3.0.0. No generic Recovery/Replay mutation endpoints are announced. Payment outcome exposes safe retry guidance; quarantine is sanitized and manual replay remains disabled.

## SDK

PASS: `generate:check`, tests and build. No drift. Recovery uses existing Sale/Payment/Receipt contracts rather than a fabricated Recovery API.

## Flutter

PASS. Flutter 3.44.6 and Dart 3.12.2 were located and executed. Analyze passed; 41 tests passed, including crash checkpoint and durable device restart; real Docker API E2E passed. Android, Chrome and Linux packaging toolchains are absent, but they do not block Dart/Flutter contract/runtime tests in this scope.

## Web

PASS: 45 scenarios. Reload, conflicts, replay state, sanitized Outbox/Quarantine, permissions, tenant/branch isolation and Receipt double-submit protection passed without false success.

## Defectos encontrados

1. **Material:** Payment capturado se marcaba localmente como aprobado antes de Sale completion/Receipt y quedaba excluido del recovery de bootstrap tras un crash.
2. **Test no material:** el Flutter E2E asumía una sola branch aunque los datos persistentes de certificación contienen varias.
3. **Test no material:** el burst de 100 no distinguía `429` de una inconsistencia de idempotencia.

## Correcciones aplicadas

- Payment checkpoint permanece `processing` hasta que completion y Receipt terminan.
- Se conserva lookup by key y las keys estables de completion/Receipt en el checkpoint.
- Al finalizar se marca el registro `completed` sin reconstruir ni repetir el Payment.
- Se añadió regresión de crash post-capture sin segundo charge.
- Se añadió reopen de SQLite para device restart.
- El E2E real selecciona explícitamente la branch de certificación.
- El burst reconoce throttling y exige unicidad sobre todas las respuestas aceptadas.

## Capacidades no implementadas

- Venta, Payment o Refund offline.
- Sincronización financiera desde local outbox.
- Generic Recovery/Replay API.
- Inbox genérico y broker externo.
- Replay manual de eventos en cuarentena.
- DLQ separada; la implementación real usa quarantine.

## Riesgos restantes

- Offline financiero sigue fuera de alcance funcional y debe permanecer bloqueado hasta una certificación dedicada.
- Product/Inventory outbox no tiene claims/quarantine equivalentes a Sales/Cash; actualmente su sink es logging local.
- Quarantine requiere resolución operacional manual; no existe replay público.
- No se certificó pérdida física de energía del host ni corrupción de disco; se certificaron cierre/reopen, restart de contenedores y durabilidad de base.
- Los 13 eventos Sales heredados en quarantine deben permanecer visibles hasta limpieza gobernada de fixtures.

## Tests ejecutados

- Flutter analyze: PASS.
- Flutter suite: 41 PASS, 0 FAIL, 0 SKIPPED en ejecución dirigida final.
- Flutter real API E2E: 1 PASS.
- Recovery/financial Flutter focal: 23 PASS.
- Sales Foundation: 5 PASS, incluido burst 100 + API restart.
- Cash/Refund, Inventory Recovery y Cash Operations: 18 PASS finales; una ejecución combinada intermedia tuvo el test 429 mal especificado y fue corregida/repetida.
- Web/API Administration: 45 PASS.
- Cash Worker crash/recovery script: PASS.
- 100-event/two-worker backlog: PASS.
- Core RLS SQL: PASS.
- Cash workflow RLS SQL: PASS.
- OpenAPI and SDK: PASS.
- `pnpm check`: PASS.

## Quality Gates

| Gate                                            | Resultado |
| ----------------------------------------------- | --------- |
| format, lint, typecheck, unit, production build | PASS      |
| Recovery/Retry/Replay E2E                       | PASS      |
| API/Worker/PostgreSQL restart                   | PASS      |
| RLS SQL                                         | PASS      |
| OpenAPI 144 operations/compatibility            | PASS      |
| SDK drift/tests/build                           | PASS      |
| Flutter analyze/tests/real API                  | PASS      |
| Web reload/error/recovery surfaces              | PASS      |
| Docker deployed health                          | PASS      |
| NTFY start                                      | HTTP 200  |

## Evidencia

- `artifacts/certification/part-2a-offline-recovery/summary.json`
- `artifacts/certification/part-2a-offline-recovery/concurrency.json`
- `artifacts/certification/part-2a-offline-recovery/failure-matrix.json`
- `artifacts/certification/part-2a-offline-recovery/runtime.json`
- `artifacts/cash-certification/performance/worker-results.json`

## Archivos Modificados

- `apps/nexo_pos/lib/app/pos_controller.dart`
- `apps/nexo_pos/test/core_test.dart`
- `apps/nexo_pos/test/local_database_test.dart`
- `apps/nexo_pos/test/real_api_e2e_test.dart`
- `tests/e2e/sales-foundation-certification.spec.ts`
- Este reporte y cuatro artefactos de evidencia.

## Handoff a Part 2A — Parte 5

Parte 5 puede asumir idempotency recovery para Sale/Payment/Refund/Receipt/Cash/Inventory, payment outcome query-only, API/Worker/PostgreSQL restart seguro, leases y quarantine Sales/Cash, backlog concurrente sin duplicación, SQLite checkpoint recovery, RLS, OpenAPI, SDK, Web y Flutter runtime.

No debe asumir ejecución financiera offline, local financial sync, broker externo, generic Recovery API, manual quarantine replay, DLQ separada ni provider settlement. Parte 5 no fue iniciada.

## NTFY

Inicio entregado HTTP 200. Final entregado HTTP 200.
