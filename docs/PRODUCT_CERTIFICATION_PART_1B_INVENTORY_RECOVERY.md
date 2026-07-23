# NEXO Product Certification Part 1B — Parte 3 — Subparte 3

## Veredicto

**PASS WITH OBSERVATIONS**

Las superficies Inventory realmente expuestas conservan consistencia, aislamiento e historia. El conteo físico puntual y su reconciliación por movimiento quedaron certificados. Count Sessions, Blind Counts y herramientas operativas de replay/rebuild no existen y se clasifican **NOT IMPLEMENTED**, no PASS.

## Executive Summary

La implementación real no contiene aggregates de Count Session o Count Line: `POST /inventory/counts` realiza una observación puntual, calcula `counted - onHand` y, si existe diferencia, agrega un Movement `COUNT` y Snapshot.

Se encontró una brecha material de auditoría/idempotencia: un conteo sin diferencia no persistía variante, ubicación, cantidad lógica o cantidad observada, y repetir el mismo idempotency key emitía eventos adicionales. Se agregó un registro `inventory_counts` inmutable y tenant-bound. Diez retries simultáneos producen un único registro, Movement, Event y Outbox, con respuesta estructuralmente idéntica.

Resultado final dirigido: Recovery 6/6 PASS, Inventory Foundation/Advanced regression 18/18 PASS, Web 2/2 PASS, RLS SQL PASS, OpenAPI 144 operaciones PASS y SDK sin drift.

## Counts

**PASS para physical count puntual.** El contrato real soporta una observación por Variant/Location con cantidad no negativa, motivo e idempotency key. La cantidad lógica se toma bajo advisory lock; la diferencia se reconcilia exclusivamente mediante Movement `COUNT` inmutable.

- cantidades negativas, precisión mayor a seis decimales y SERVICE: 400;
- Variant y Location son autoritativos y tenant-bound;
- diez retries con el mismo key: una sola operación lógica;
- mismo key con payload distinto: 409;
- diez observaciones independientes se serializan y convergen al mismo balance final;
- diferencia cero persiste evidencia sin crear stock ni Movement artificial de cantidad cero;
- cada count conserva balances lógicos, contado, diferencia, motivo, actor y Movement opcional.

No existe lifecycle create/start/close/cancel ni restricción de “una sesión abierta”, porque Count Session no está implementado.

## Blind Counts

**NOT IMPLEMENTED.** No existe flag, DTO, endpoint o UI de blind count. La API no entrega una sesión que oculte saldo lógico. La razón textual de prueba no convierte el conteo puntual en una capacidad blind certificada.

## Adjustments

**PASS dentro del contrato actual.** ADJUSTMENT y CORRECTION agregan movimientos ON_HAND; nunca actualizan o eliminan historia. Las cantidades positivas y negativas pasan por validación, lock, política de stock negativo, idempotency unique, Event, Outbox y Snapshot.

La reconciliación COUNT usa su propio tipo interno y no puede forjarse mediante el endpoint público de Movement. Los tests previos y repetidos demostraron cinco ganadores/cinco conflictos ante diez ajustes de -2 sobre diez unidades.

## Replay

**NOT IMPLEMENTED como operación productiva.** No existe endpoint, worker o comando de replay/rebuild. Se demostró que el ledger ordenado reconstruye el mismo `onHand` que el Snapshot más reciente. Eventos duplicados no participan en el balance autoritativo.

La ausencia de una herramienta operativa significa que una recuperación ante pérdida física de snapshots requeriría procedimiento nuevo; no se presenta como capacidad disponible.

## Recovery

**PARTIAL / architectural recoverability.** InventoryMovement es la autoridad reconstruible; InventorySnapshot es un read model inmutable. La suma del ledger produjo `6.000000` y el Snapshot final `6` en el escenario dirigido.

No existe recovery automático, backfill ni endpoint de reparación. Roles runtime no pueden borrar/corromper Movements, Counts o Snapshots, reduciendo la posibilidad de necesitar recovery lógico por operación normal.

## Snapshots

**PASS para generación e integridad; NOT IMPLEMENTED para rebuild.** Cada Movement confirmado genera Snapshot dentro de la transacción. Un count con diferencia hereda esa garantía; diferencia cero no crea snapshot redundante. UPDATE/DELETE de Snapshot fue rechazado por trigger.

## Historical Integrity

**PASS.** Inventory Count, Movement, Snapshot, Reservation, Transfer, Event y CostLayer conservan historia inmutable. Los intentos RAW SQL de DELETE del count/snapshot y UPDATE del Movement fallaron. Reconciliar agrega historia; no reescribe cantidades anteriores ni costos unitarios históricos.

## Authorization

**PASS WITH OBSERVATION.** `inventory.adjust` protege counts y ajustes. Owner autorizado; ReadOnly rechazado 403; tenant ajeno rechazado 403. Cashier permanece sin permiso según regresión Foundation. Supervisor branch-scoped continúa fail-closed hasta que el contrato propague branch scope autoritativo.

## RLS

**PASS.** `inventory_counts` tiene RLS y FORCE RLS, políticas restrictiva/runtime/readonly, FK compuestas y privilegios SELECT/INSERT sin UPDATE/DELETE para runtime. SQL real demostró:

- default-deny sin tenant context;
- Tenant A observa solo count A;
- Tenant B no lee count A;
- runtime no puede UPDATE/DELETE;
- 60/60 tablas esperadas con RLS/FORCE RLS.

## Events

Un count confirmado emite `InventoryCounted` y Outbox una vez, con aggregate ID del count y metadata mínima: Variant, Location, logical quantity, counted quantity, difference y Movement ID cuando existe. Movement `COUNT` emite además el evento de ajuste del ledger existente.

Observación heredada: correlation ID de request no se propaga uniformemente a InventoryEvent/Outbox.

## OpenAPI

**PASS.** 144 operaciones válidas y compatibility 3.0.0. `CountInput` ahora especifica patrón decimal, reason 1..500 e idempotency key 8..160. Tenant, actor, balances lógicos y movement ID no son writeable. No existen contratos falsos para sessions, blind count o recovery.

## SDK

**PASS.** `generate:check` y 2/2 tests; sin drift. El SDK conserva únicamente el count puntual realmente implementado.

## Web

**PASS para consulta Inventory existente; Counts NOT IMPLEMENTED.** La pantalla permite consultar disponibilidad/movimientos con PHYSICAL y Locations activas; browser 2/2 PASS, Console/Network limpios. No existe UI de Counts, Adjustments o Recovery y no se construyó durante certificación.

## Defectos

1. **MEDIUM, corregido:** count sin diferencia carecía de evidencia persistente completa.
2. **MEDIUM, corregido:** replay de count emitía eventos/outbox duplicados.
3. **LOW, corregido:** DTO/OpenAPI de Count no expresaban límites de cantidad, reason e idempotency key.
4. **Regresión durante corrección, resuelta:** consumir FIFO en COUNT fallaba sobre stock transferido sin capas en destino; se restauró la frontera de valoración existente y la regresión terminó PASS.

## Correcciones

- tabla/modelo `inventory_counts` inmutable;
- FKs tenant/Variant/Location/Movement;
- RLS/FORCE RLS y privilegios mínimos;
- lock específico de idempotency antes del balance;
- replay same-payload determinista y payload-different 409;
- evento con aggregate count y metadata auditable;
- DTO/OpenAPI endurecidos;
- RLS SQL y suite Recovery nuevas.

## Riesgos

- Count Sessions y Count Lines: NOT IMPLEMENTED.
- Blind Counts: NOT IMPLEMENTED.
- Replay/rebuild automático: NOT IMPLEMENTED.
- Snapshot recovery operativo: NOT IMPLEMENTED.
- UI de counts/adjustments/recovery: NOT IMPLEMENTED.
- COUNT positivo/negativo no revalúa CostLayers; la valoración de diferencias físicas requiere contrato futuro del Cost Engine.
- Branch RLS no existe; branch isolation permanece en ABAC/FKs.
- Eventos carecen de correlation ID uniforme.

Las observaciones no permiten modificar historia, crear duplicados por replay ni cruzar tenant en las superficies expuestas.

## Tests

| Suite                                       |           Resultado |
| ------------------------------------------- | ------------------: |
| Inventory Recovery E2E                      |      6/6 PASS final |
| Foundation + Advanced + existing regression |    18/18 PASS final |
| Web Inventory                               |            2/2 PASS |
| Inventory unit                              |            6/6 PASS |
| API unit/contract                           |          31/31 PASS |
| SDK unit/drift                              |            2/2 PASS |
| RLS SQL                                     |                PASS |
| OpenAPI                                     | 144 operations PASS |

Ejecuciones no ocultadas: Recovery inicial 1 FAIL/5 no ejecutadas por comparar orden textual de JSONB; corregida la aserción a igualdad estructural. La primera regresión amplia terminó 16 PASS, 1 FAIL y 1 no ejecutada al probar COUNT contra FIFO transferido; se revirtió esa modificación y la repetición final terminó 18/18 PASS.

## Quality Gates

| Gate                             | Resultado                 |
| -------------------------------- | ------------------------- |
| format/lint/typecheck/unit/build | PASS final (`pnpm check`) |
| Inventory Recovery E2E           | PASS                      |
| Inventory regressions            | PASS                      |
| RLS SQL                          | PASS                      |
| OpenAPI compatibility            | PASS                      |
| SDK drift                        | PASS                      |
| Docker Migrate/API build/deploy  | PASS                      |
| health live/ready                | PASS                      |

## Evidencia

- API final: `sha256:aec64bea3a2764a2285d6bef8f8dfcd69a6066c9a3f986ae6efb79b409a129cd`.
- Migrate: `sha256:3f087de2d8de185983f27413337864058ed97d11832382cb88288cd59d77fbfe`.
- Worker heredado healthy: `sha256:e41632ea25c8679ac944bb12b5f7552f3286539192cd3a6794e51f6498c9e74c`.
- Web heredado healthy: `sha256:34b800839aee6f4f7945700886059782574b4072412bfd71ddd64a7d70694aa8`.
- Migración aplicada: `20260722070000_inventory_count_integrity`.
- Live: ok; Ready: database/redis/objectStorage up.

## Archivos Modificados

- `apps/api/src/modules/inventory/infrastructure/prisma-inventory.repository.ts`
- `apps/api/src/modules/inventory/interface/inventory.dto.ts`
- `packages/contracts/openapi/openapi.json`
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/20260722070000_inventory_count_integrity/migration.sql`
- `packages/database/tests/rls.integration.sql`
- `tests/e2e/inventory-recovery-certification.spec.ts`
- `docs/PRODUCT_CERTIFICATION_PART_1B_INVENTORY_RECOVERY.md`

## Observaciones para Product Certification Part 1B — Parte 4

Part 1B Parte 4 puede asumir que los flujos Inventory expuestos —ledger, balances, reservations, transfers, FIFO foundation, counts puntuales y reconciliation movements— conservan integridad y tenant isolation. No debe asumir que existen Count Sessions, Blind Counts, Cost revaluation por diferencias o recovery automatizado.

Purchasing/Receiving deberá preservar Movement inmutable, CostLayer boundaries, idempotency, Snapshot transaccional y `inventory_counts` como evidencia histórica; no debe usar UPDATE/DELETE para “corregir” ledger.
