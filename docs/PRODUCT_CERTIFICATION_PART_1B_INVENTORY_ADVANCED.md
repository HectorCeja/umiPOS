# NEXO Product Certification Part 1B — Parte 3 — Subparte 2

## Veredicto

**PASS WITH OBSERVATIONS**

Las garantías esenciales de Reservations, consumo, expiración, Transfers, FIFO, aislamiento e inmutabilidad histórica quedaron demostradas contra API, Worker y PostgreSQL desplegados. No se presentan como funcionales los conceptos que solo existen estructuralmente: COMMITTED no tiene lifecycle público, Average/Standard Cost no son métodos operativos, y Transfer cancel/reject no existen.

## Executive Summary

Se reprodujo un defecto material: diez recepciones concurrentes del mismo Transfer eran aceptadas, duplicaban cinco unidades en destino y dejaban `IN_TRANSIT=-45`. La recepción ahora reclama atómicamente el estado; la repetición produce un ganador y nueve conflictos, con destino `5` e in-transit `0`.

También se reforzaron el claim atómico de Reservation release/consume, el snapshot de expiración, la precisión FIFO sin `Number`, la moneda organizacional de capas, las relaciones compuestas, la inmutabilidad histórica y la superficie Web. Resultado dirigido: 7/7 advanced E2E, 6/6 Sales incluyendo diez consumos concurrentes, 11/11 Inventory regression, 2/2 Web y RLS SQL PASS.

## Reservations

Modelo real: `ACTIVE`, `RELEASED`, `EXPIRED`, `CONSUMED`. Create y release son públicos; consume pertenece al coordinador de Sales. La disponibilidad se calcula desde snapshot por estado, y una reserva mayor al disponible se rechaza bajo lock transaccional.

- Diez reservas simultáneas se serializan sin `available < 0`.
- Release usa transición condicional `ACTIVE -> RELEASED`; un solo ganador escribe movimiento/evento.
- Consume usa transición condicional `ACTIVE -> CONSUMED`; el replay idempotente no consume de nuevo.
- Expiración pasada en create se rechaza.
- El Worker reclama expiraciones atómicamente, escribe movimiento, snapshot, evento y outbox una vez.
- Product/Variant/location/tenant permanecen autoritativos.

## Committed

**NOT IMPLEMENTED como lifecycle independiente.** `COMMITTED` existe como dimensión de stock/read model, pero no existe endpoint o comando que lo produzca. No puede forjarse mediante Movement público y permanece en cero en los flujos certificados. No se anuncia como capacidad operativa.

## FIFO

**PASS para foundation operativa.** Receipts crean cost layers y los consumos negativos agotan primero por `receivedAt,id`. Las cantidades y costos se procesan como enteros escalados; se eliminó la conversión por `Number`. El costo total se redondea half-up a seis decimales y queda persistido en el Movement.

La identidad, costo, moneda y cantidad inicial de una capa son inmutables; `remainingQuantity` solo puede disminuir y `closedAt` no puede reabrirse.

## Cost Engine

- FIFO: funcional dentro de esta subparte.
- Weighted Average: utilidad matemática existente, **NOT OPERATIONAL** en policy/API.
- Standard Cost: enum/metadata histórica, **NOT OPERATIONAL**; API lo rechaza.
- LIFO: **NOT IMPLEMENTED** y rechazado.

El costo de venta permanece separado de Pricing. Las capas usan la moneda por defecto de la organización; un receipt con currency divergente se revierte. La valoración financiera completa y revaluaciones quedan fuera del alcance.

## Transfers

Modelo real: `DRAFT`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`. La API implementa create (directamente `IN_TRANSIT`) y complete. Reject/cancel/rollback no tienen endpoint operativo.

La recepción ahora usa un update condicional `IN_TRANSIT -> COMPLETED` dentro de la misma transacción que los movimientos y snapshots. En diez completions simultáneos: 1×201, 9×409; ninguna unidad se pierde o duplica. Las FKs compuestas fijan tenant, Variant, source y destination.

## Historical Integrity

Triggers de base de datos impiden DELETE y cambios de identidad/cantidad/costo en Reservation, Transfer y CostLayer. Solo las transiciones autoritativas y el decremento de `remainingQuantity` están permitidos. Las pruebas RAW SQL como administrador runtime fueron rechazadas. InventoryMovement y Snapshot conservan las garantías inmutables de la subparte anterior.

## Concurrency

| Escenario                  | Resultado                                   |
| -------------------------- | ------------------------------------------- |
| 10 reservas                | serializadas, sin underflow                 |
| 10 releases                | 1 ganador, 9 conflictos                     |
| 10 transfer completes      | 1 ganador, 9 conflictos                     |
| 10 sale completes/consumes | 1 ganador, 9 conflictos, 1 unidad consumida |
| expiration Worker/retry    | 1 release, 1 snapshot, 1 event/outbox       |
| receipt replay             | conflicto, sin capa o movimiento duplicado  |

Los locks son transaccionales sobre balance/aggregate; no se ejecutó benchmark masivo.

## Authorization

Owner/Administrator con permisos pueden operar Inventory. Cashier y ReadOnly no pueden mutar. Supervisor branch-scoped continúa fail-closed hasta que el contrato propague branch scope autoritativo. Cross-tenant y referencias ajenas se rechazan; el body no controla tenant o actor.

## RLS

PASS. SQL real demostró default-deny sin contexto, separación Tenant A/B, rechazo de UPDATE ajeno y `FORCE ROW LEVEL SECURITY`. Reservation, Transfer y CostLayer permanecen tenant-bound. El Worker usa rol privilegiado explícito, limitado a SELECT/UPDATE de Reservation e INSERT de Movement/Snapshot/Event/Outbox necesario para expiración.

## OpenAPI

PASS: 144 operaciones válidas y compatibility 3.0.0. DTOs de Inventory restringen longitudes y quantities; policy solo anuncia FIFO. Tenant, actor y campos internos no son writeable. No existen contratos falsos para COMMITTED lifecycle, cancel/reject o métodos de costo no operativos.

## SDK

PASS: `generate:check` y 2/2 tests; sin drift y sin campos autoritativos agregados.

## Web

La pantalla existente certifica consulta de disponibilidad/movimientos. Se corrigió que ofreciera SERVICE como inventariable y ubicaciones inactivas. Tras rebuild: 2/2 browser PASS, persistencia y consulta 200, sin falso éxito. Administración de Reservations/Transfers/FIFO/Cost es **NOT IMPLEMENTED** en Web y no se construyó en esta fase.

## Defectos encontrados

1. **HIGH / corregido:** completion concurrente duplicaba Transfer.
2. **MEDIUM / corregido:** release/consume de Reservation usaban read-then-write susceptible a carrera.
3. **MEDIUM / corregido:** expiración Worker no persistía Snapshot correspondiente.
4. **MEDIUM / corregido:** FIFO convertía scaled integers a `Number`, con riesgo de precisión.
5. **MEDIUM / corregido:** CostLayer aceptaba currency fija MXN y carecía de varias FKs/inmutabilidad.
6. **LOW / corregido:** Web ofrecía SERVICE y ubicaciones inactivas para disponibilidad.

## Correcciones

- claims condicionales atómicos para Reservation y Transfer;
- snapshot en expiración Worker;
- aritmética FIFO/weighted exacta y persistencia de totalCost;
- fail-closed para métodos de costo no operativos;
- currency organizacional y validación de mismatch;
- FKs compuestas y triggers de historia;
- mapping de replay P2002 a 409;
- DTO/OpenAPI ajustados al contrato real;
- selector Web limitado a PHYSICAL activo y locations activas;
- suites adversariales nuevas y carrera Sales ampliada a diez intentos.

## Riesgos

- COMMITTED lifecycle: NOT IMPLEMENTED.
- Transfer cancel/reject/rollback: NOT IMPLEMENTED.
- Weighted Average y Standard Cost: NOT OPERATIONAL.
- Eventos no propagan todavía correlation ID de request de forma uniforme; taxonomía es básica.
- No existe UI avanzada de Reservation/Transfer/Cost.
- No existe herramienta operativa de ledger replay/recovery; la reconstrucción se basa en ledger/snapshots.
- Branch isolation final depende de ABAC/FKs; RLS es tenant-scoped, no branch-scoped.

Estas observaciones no permiten crear, perder o duplicar inventario en los flujos expuestos certificados.

## Tests

| Suite                         |           Resultado |
| ----------------------------- | ------------------: |
| Inventory Advanced E2E        |            7/7 PASS |
| Sales + 10 consumes           |            6/6 PASS |
| Inventory Foundation/existing |          11/11 PASS |
| Web Inventory                 |      2/2 PASS final |
| Inventory unit                |            6/6 PASS |
| API unit/contract             |          31/31 PASS |
| Worker unit                   |            1/1 PASS |
| SDK unit/drift                |            2/2 PASS |
| RLS SQL                       |                PASS |
| OpenAPI                       | 144 operations PASS |

Hubo dos ejecuciones Web FAIL antes del rebuild final: la primera demostró el selector incompatible; la segunda aún usaba la imagen Web anterior. No fueron ocultadas y la repetición desplegada terminó 2/2 PASS.

## Quality Gates

| Gate                                | Resultado                                                |
| ----------------------------------- | -------------------------------------------------------- |
| format/lint/typecheck/unit/build    | PASS (`pnpm check`)                                      |
| Advanced/Inventory/Sales E2E        | PASS                                                     |
| RLS SQL                             | PASS                                                     |
| OpenAPI compatibility               | PASS                                                     |
| SDK drift                           | PASS                                                     |
| Docker API/Worker/Web/Migrate build | PASS; un timeout Prisma transitorio, retry limitado PASS |
| deployment/health                   | PASS                                                     |

## Evidencia

- Imagen API: `sha256:f09e21a6d81e270fd73a7db1d14c8a49bf3329ecf6b58fc8c88090d8e3aa1268`.
- Imagen Worker: `sha256:e41632ea25c8679ac944bb12b5f7552f3286539192cd3a6794e51f6498c9e74c`.
- Imagen Migrate: `sha256:2a7d33211b33ce2a40690b0bd9d385e1bc1793e610bed9e0ca0989945a2698cf`.
- Imagen Web final: `sha256:34b800839aee6f4f7945700886059782574b4072412bfd71ddd64a7d70694aa8`.
- Migración aplicada: `20260722043000_inventory_advanced_integrity`.
- API y Worker healthy después del despliegue.
- Prueba pre-fix reproducible: 10×201, destino 50, in-transit -45 para Transfer de 5.
- Prueba post-fix: 1×201, 9×409, destino 5, in-transit 0.

## Archivos Modificados

- `apps/api/src/modules/inventory/application/inventory.service.ts`
- `apps/api/src/modules/inventory/infrastructure/prisma-inventory.repository.ts`
- `apps/api/src/modules/inventory/interface/inventory.dto.ts`
- `apps/worker/package.json`
- `apps/worker/src/main.ts`
- `apps/web/src/app/inventory/page.tsx`
- `packages/contracts/openapi/openapi.json`
- `packages/database/prisma/migrations/20260722043000_inventory_advanced_integrity/migration.sql`
- `packages/inventory/src/index.ts`
- `packages/inventory/src/index.test.ts`
- `pnpm-lock.yaml`
- `tests/e2e/inventory-advanced-certification.spec.ts`
- `tests/e2e/sales.spec.ts`
- `docs/PRODUCT_CERTIFICATION_PART_1B_INVENTORY_ADVANCED.md`

## Observaciones para Parte 3 de 5 — Subparte 3

No iniciar Counts/Physical Inventory desde supuestos: extraer primero modelos reales. Mantener regresión de las carreras Transfer/Reservation/Sales, triggers históricos, FIFO exacto y snapshots. Counts no debe introducir UPDATE/DELETE del ledger ni reabrir CostLayers. Si requiere correcciones, deben ser nuevos movimientos compensatorios.
