# NEXO Product Certification Part 1B — Parte 4 de 5

## Veredicto

**PASS WITH OBSERVATIONS**

Todo lo implementado dentro de Inventory Operations quedó certificado y las capacidades inexistentes se clasifican explícitamente. NEXO no contiene todavía Suppliers, Purchase Orders, Receiving aggregate, Reorder Engine o Suggested Orders. El primitive real de recepción es un Movement `PURCHASE` y quedó demostrado como consistente, tenant-bound e idempotente.

## Executive Summary

La búsqueda en modelos, migraciones, API, Worker, OpenAPI, SDK y Web confirmó que Purchasing/Receiving no constituye aún un bounded context independiente. El flujo disponible recibe stock directamente en Inventory, generando Movement inmutable, CostLayer opcional, Snapshot, Event y Outbox en una transacción.

Diez retries concurrentes del mismo receipt produjeron 1×201 y 9×409, una sola capa y cinco unidades. Diez receipts independientes de 1.25 conservaron 12.5 unidades y diez capas. Tenant ajeno, ReadOnly, SERVICE, cero, negativos y precisión excesiva fueron rechazados. Receiving cost `37` permaneció separado del sale price `99`.

Resultado final dirigido: Operations 6/6, Product/Media/Pricing 15/15, Inventory 24/24, Web 4/4, RLS SQL PASS, OpenAPI 144 operations y SDK sin drift.

## Discovery y clasificación

| Capacidad                              | Estado real                           |
| -------------------------------------- | ------------------------------------- |
| Supplier / Supplier Product            | NOT IMPLEMENTED                       |
| Purchase Order / Lines / Approval      | NOT IMPLEMENTED                       |
| Receiving aggregate / Receipt          | NOT IMPLEMENTED                       |
| Direct Inventory PURCHASE receipt      | PASS WITH OBSERVATIONS                |
| Partial/over/under receiving versus PO | NOT APPLICABLE mientras no exista PO  |
| Reorder point API                      | NOT IMPLEMENTED                       |
| Low-stock threshold schema             | PARTIAL / architectural metadata only |
| Maximum/safety stock, lead time        | NOT IMPLEMENTED                       |
| Suggested Orders                       | NOT IMPLEMENTED                       |
| Warehouse hierarchy                    | PASS como location readiness          |
| WMS workflows                          | NOT IMPLEMENTED                       |
| Inventory availability/timeline        | PASS                                  |
| Inventory analytics                    | PARTIAL foundation only               |

## Suppliers

**NOT IMPLEMENTED.** No existen modelos Supplier, supplier contacts, SupplierProduct, supplier SKU/cost, migraciones, permisos, RLS, endpoints, SDK o UI. Las rutas adversariales permanecen 404. No se construyó la capacidad.

## Purchasing readiness

**PARTIAL.** Inventory acepta receipts manuales autoritativos, pero no existe Purchase Order, estado Draft/Submitted/Approved/Cancelled/Closed, línea, supplier o expected quantity. Por ello NEXO no debe anunciar Purchasing.

La foundation aprovechable es: ProductVariant tenant-bound, Locations jerárquicas, ledger inmutable, FIFO cost layers, disponibilidad, Events/Outbox e idempotency.

## Receiving

**PASS WITH OBSERVATIONS para el primitive `PURCHASE`.** Solo PHYSICAL Variant y Location activa del tenant son aceptadas. Quantity debe ser positiva, no cero, con máximo 14 enteros y seis decimales. Actor/tenant son derivados de sesión.

Un receipt confirmado produce atómicamente:

- InventoryMovement `PURCHASE/ON_HAND`;
- CostLayer cuando se proporciona unit cost;
- InventorySnapshot;
- `StockReceived` InventoryEvent;
- InventoryOutbox.

No existe Receipt ID distinto al Movement ni relación con Supplier/PO.

## Partial, over y under receiving

**NOT APPLICABLE respecto a Purchase Order**, porque no existe expected quantity o Purchase Line. Cantidades fraccionarias directas sí funcionan: diez receipts de `1.25` produjeron exactamente `12.5`.

No es posible certificar over/under receiving como regla de negocio sin una autoridad de cantidades esperadas.

## Receiving concurrency y replay

**PASS.** La unique constraint `(tenant_id,idempotency_key)` y la transacción Inventory impiden duplicación:

- same-key 10 requests: 1×201, 9×409;
- 1 Movement, 1 CostLayer, 1 Snapshot, 1 StockReceived Event;
- balance final: 5;
- diez keys diferentes: 10×201, 10 layers, 12.5 unidades;
- retry con key ocupada no agrega stock.

## Receiving authorization y RLS

**PASS WITH OBSERVATION.** Owner autorizado; ReadOnly rechazado; Cashier continúa rechazado por la matriz Inventory. Tenant A no puede recibir sobre Tenant B ni reutilizar Variant/Location ajena. `inventory.write` es la autoridad existente.

Supervisor branch-scoped permanece fail-closed hasta propagar branch scope de forma autoritativa. RLS/FORCE RLS y FKs compuestas permanecen como barrera tenant final.

## Receiving events

`StockReceived` y Outbox se escriben en la transacción del receipt con actor, tenant, aggregate Movement y Variant en metadata. Snapshot referencia el Movement confirmado. Observación heredada: correlation ID del request no se propaga uniformemente a InventoryEvent/Outbox.

## Reorder foundation

**PARTIAL / NOT OPERATIONAL.** `InventoryPolicy.lowStockThreshold` existe en Prisma, pero no se expone en PolicyDto/OpenAPI/UI ni alimenta alertas o sugerencias. No existen max stock, safety stock, reorder quantity, supplier preference, lead time o suggested orders.

No debe anunciarse Reorder como funcionalidad disponible.

## Warehouse readiness

**PASS como estructura de Locations; no es un WMS.** La jerarquía real permite `BRANCH`, `WAREHOUSE`, `ZONE`, `SHELF` y `BIN`. Se creó y consultó Warehouse→Zone→Shelf→Bin con balances independientes por Location.

Parent debe existir en el mismo tenant y branch. Multi-location, transfer e in-transit están certificados. No existen picking, put-away, wave, dock, pallet, lot, serial o capacity management.

## Inventory valuation boundaries

**PASS WITH OBSERVATIONS.** Receiving cost y sale price permanecen separados: la prueba conservó ProductPrice `99.000000` y CostLayer `37.000000`. Inventory no modifica Pricing y Product price no modifica CostLayer.

`unitCost` sigue siendo opcional para PURCHASE; un receipt sin costo genera stock sin capa valorada. Esto es una decisión/limitación heredada y bloquea afirmar valoración completa de todos los receipts, pero no altera la cantidad autoritativa.

## Inventory availability y analytics foundation

Availability y Movement timeline son lecturas autoritativas por Variant/Location y permanecen tenant-bound. Snapshots y Events ofrecen base para proyecciones. Analytics, demand history, supplier performance, fill rate, aging y forecasting son **NOT IMPLEMENTED**.

## OpenAPI

**PASS.** 144 operaciones válidas y compatibility 3.0.0. OpenAPI expone el Movement `PURCHASE` real y no contiene Supplier, Purchase Order, Receipt, Receiving o Reorder endpoints/modelos fantasma.

## SDK

**PASS.** `generate:check` y tests pasan; no existe drift ni superficies Purchasing inexistentes.

## Web

**PASS para pantallas existentes.** Inventory y Control Plane Inventory Locations terminaron 4/4 browser PASS. Console/Network permanecieron limpios. No existe UI Supplier/Purchasing/Receiving/Reorder y no se certificaron mockups.

## Defectos encontrados

No se encontró un defecto productivo reproducible dentro de la superficie implementada.

Se corrigieron dos defectos de evidencia:

1. La carrera Media finalize puede rechazar al perdedor con 400 o 409 según la validación que gane; la prueba ahora exige exactamente un 201 y un rechazo seguro.
2. El fixture Web dependía de que la primera página acumulada incluyera un PHYSICAL activo; ahora crea/activa uno solo cuando falta.

Las ejecuciones paralelas que recibieron 429 demostraron el rate limit de login; se repitieron secuencialmente tras limpiar exclusivamente Redis de certificación.

## Riesgos restantes

- Suppliers: NOT IMPLEMENTED.
- Purchase Orders y approvals: NOT IMPLEMENTED.
- Receiving aggregate y receipts parciales contra PO: NOT IMPLEMENTED.
- Reorder Engine/Suggested Orders: NOT IMPLEMENTED.
- Low-stock metadata: no operativa.
- Unit cost opcional permite stock no valorado.
- No hay WMS, lots, serials o expiry dates.
- Media finalize loser usa 400 o 409 de forma no uniforme.
- Branch RLS y Supervisor branch propagation continúan como observaciones.
- Correlation ID de Inventory events no es uniforme.

## Tests

| Suite                                  |     Resultado final |
| -------------------------------------- | ------------------: |
| Inventory Operations                   |            6/6 PASS |
| Product + Media + Pricing              |          15/15 PASS |
| Inventory Foundation/Advanced/Recovery |          24/24 PASS |
| Web Inventory/Locations                |            4/4 PASS |
| RLS SQL                                |                PASS |
| OpenAPI                                | 144 operations PASS |
| SDK                                    |            2/2 PASS |

Fallos intermedios no ocultados: una consulta de test usó `status` en lugar de `active`; dos suites paralelas agotaron el rate limit de login; Media mostró la variación 400/409; Web quedó sin fixture activo visible. Todos fueron clasificados, corregidos en pruebas y repetidos hasta PASS.

## Quality Gates

| Gate                             | Resultado               |
| -------------------------------- | ----------------------- |
| format/lint/typecheck/unit/build | PASS (`pnpm check`)     |
| Operations E2E                   | PASS                    |
| Product/Media/Pricing regression | PASS                    |
| Inventory regression             | PASS                    |
| Web                              | PASS                    |
| RLS SQL                          | PASS                    |
| OpenAPI compatibility            | PASS                    |
| SDK drift                        | PASS                    |
| Docker/health                    | PASS; runtime no cambió |

## Evidencia

- API desplegada: `sha256:aec64bea3a2764a2285d6bef8f8dfcd69a6066c9a3f986ae6efb79b409a129cd`.
- Migrate: `sha256:3f087de2d8de185983f27413337864058ed97d11832382cb88288cd59d77fbfe`.
- Worker: `sha256:e41632ea25c8679ac944bb12b5f7552f3286539192cd3a6794e51f6498c9e74c`.
- Web: `sha256:34b800839aee6f4f7945700886059782574b4072412bfd71ddd64a7d70694aa8`.
- API live/ready healthy; PostgreSQL, Redis y Object Storage up.
- Ningún cambio de runtime fue necesario en Parte 4.

## Archivos modificados

- `tests/e2e/inventory-operations-certification.spec.ts`
- `tests/e2e/media-pricing-integrity-certification.spec.ts`
- `tests/e2e/inventory-selectors-and-balance.spec.ts`
- `docs/PRODUCT_CERTIFICATION_PART_1B_INVENTORY_OPERATIONS.md`

## Handoff a Product Certification Part 1B — Parte 5

Parte 5 puede asumir las garantías ya certificadas de Product, Media, Pricing e Inventory, incluido receipt directo por Movement PURCHASE. No debe asumir Suppliers, Purchase Orders, Receiving lifecycle, Reorder, WMS o Analytics.

No comenzar Purchasing/Receiving por inferencia: cualquier implementación futura debe definir aggregate, expected quantities, partial/over rules, supplier ownership, authorization, idempotency, CostLayer requirements y eventos antes de ampliar el contrato.

## NTFY

- Inicio enviado: `6SXVPd063NjD`.
- Bloqueo material: no ocurrió; no fue necesaria notificación de bloqueo.
- Final enviado: `myoFEkMTQuY9`.
- Duración total: 8m 1s.
