# NEXO Product Certification Part 1B — Parte 3 — Subparte 1

## Veredicto

**PASS WITH OBSERVATIONS**

Las garantías esenciales de integridad del núcleo de inventario quedaron demostradas contra PostgreSQL y la imagen API desplegada: el ledger es la autoridad, sus movimientos y snapshots son inmutables para runtime, las salidas concurrentes no producen stock negativo, las referencias Product/Variant/Location están ligadas al tenant y RLS permanece `FORCE`/default-deny. Las observaciones no permiten pérdida ni creación espontánea de inventario, pero limitan la cobertura funcional de estados y roles branch-scoped.

## Executive Summary

La certificación encontró y corrigió seis defectos materiales: el endpoint genérico aceptaba transiciones internas arbitrarias; SERVICE podía recibir stock; el cálculo de disponibilidad utilizaba `Number`; dos salidas concurrentes podían evaluar el mismo saldo sin una serialización explícita; los snapshots derivados eran actualizables por runtime; y faltaban constraints compuestos para Location/Branch/Parent y Snapshot/Variant/Movement. También se corrigieron tres fixtures Web/E2E obsoletos y un tenant UUID erróneo en una prueba heredada.

Resultado dirigido final: 14/14 Playwright PASS, 6/6 unit Inventory PASS, 31/31 API unit PASS, RLS SQL PASS, OpenAPI 144 operaciones PASS, compatibilidad PASS, SDK sin drift, `pnpm check` PASS y Docker API healthy.

## Inventory Architecture

La implementación real es ledger-first:

`Web Admin → InventoryController/DTO → InventoryService/RBAC → PrismaInventoryRepository → PostgreSQL ledger + snapshot + event/outbox`.

No existe una tabla o agregado persistente `InventoryItem`. La identidad operativa es `(tenantId, variantId, locationId)`; `InventoryPolicy` configura la variante, `InventoryMovement` es la verdad contable y `InventorySnapshot` conserva evidencia derivada por movimiento. `InventoryLocation` representa el lugar físico dentro de una Branch.

Autoridades:

- tenant y actor: sesión/contexto servidor;
- branch: relación autoritativa de Location, respaldada por FK compuesta;
- Product: derivado de Variant, nunca del body;
- timestamps de registro, correlation ID, IDs y snapshots: servidor;
- quantity, reason y occurredAt: input validado dentro del contrato de movimiento;
- balance: suma del ledger por estado, no un campo mutable.

## Inventory Aggregate

No hay un único row aggregate. La frontera transaccional es Variant + Location + movimientos. Las escrituras usan una transacción tenant-bound y advisory lock por `tenant:variant:location`. IDs, tenant, actor y timestamps de servidor no son escribibles en DTO/OpenAPI. No existe versionado optimista del balance: la serialización por advisory lock es el mecanismo equivalente para evitar lost updates.

La aritmética fundacional usa enteros `BigInt` escalados a seis decimales, alineados con `DECIMAL(20,6)`, evitando pérdida de precisión JavaScript en On Hand/Available. FIFO y Cost Engine permanecen fuera del alcance de esta subparte.

## Inventory Item

**NOT IMPLEMENTED como entidad independiente.** La creación/configuración de inventario ocurre mediante una Variant PHYSICAL, una Location válida y, opcionalmente, InventoryPolicy. No se inventó un CRUD adicional.

Integridad demostrada:

- Variant debe existir en el mismo tenant y pertenecer a Product PHYSICAL no archivado;
- Location debe existir, estar activa y pertenecer al tenant;
- Location.branch y Location.parent están protegidos por FK compuesta;
- duplicados de movimiento se rechazan por idempotency key;
- referencias inexistentes o cross-tenant producen error público genérico.

## Inventory Ledger

`InventoryMovement` es la autoridad. `InventorySnapshot` no sustituye al ledger y se crea después de cada movimiento dentro de la misma transacción.

Inmutabilidad demostrada por tres barreras:

- `nexo_runtime` solo posee SELECT/INSERT sobre movements, snapshots y events;
- triggers `BEFORE UPDATE OR DELETE` impiden mutación de movements, events y ahora snapshots;
- las pruebas SQL directas de UPDATE/DELETE fallaron y la evidencia original permaneció.

Idempotencia: `(tenant_id, idempotency_key)` evita replays; el segundo request recibe 409. Atomicidad: movement, cost-layer cuando aplica, event, outbox y snapshot se escriben dentro de una transacción.

Concurrencia: tras recibir 10 unidades, diez ajustes simultáneos de -2 produjeron exactamente 5×201 y 5×409, balance final `onHand=0`, `available=0`, sin underflow.

## Movement Types

Tipos reales del modelo: PURCHASE, SALE, ADJUSTMENT, TRANSFER, RESERVATION, RESERVATION_RELEASE, WASTE, CONSUMPTION, RETURN, CORRECTION, COUNT e IMPORT.

Contrato expuesto por el endpoint genérico:

- PURCHASE, RETURN e IMPORT: ON_HAND positivo;
- WASTE y CONSUMPTION: ON_HAND negativo;
- ADJUSTMENT y CORRECTION: ON_HAND no cero.

SALE, TRANSFER, RESERVATION, RESERVATION_RELEASE y COUNT son transiciones internas y solo pueden originarse en sus flujos autoritativos. La base de datos respalda combinación type/state/sign mediante `inventory_movement_semantics`.

Movimientos observados E2E: PURCHASE, ADJUSTMENT, RESERVATION, RESERVATION_RELEASE, TRANSFER y COUNT. SALE está implementado mediante consumo de reservation, pero el ciclo Sales no se recertificó. WASTE, CONSUMPTION, RETURN, CORRECTION e IMPORT tienen contrato estructural/manual; no todos poseen UI dedicada.

## Stock States

| Estado          | Clasificación                    | Autoridad/comportamiento                                                         |
| --------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| ON_HAND         | PASS                             | suma de movimientos ON_HAND                                                      |
| AVAILABLE       | PASS                             | derivado exactamente como `onHand - reserved - committed - damaged - quarantine` |
| RESERVED        | PASS (estructura y flujo básico) | reservation/release atómicos; lógica avanzada diferida                           |
| IN_TRANSIT      | PASS (estructura)                | usado por transfer; ciclo completo se certificará después                        |
| COMMITTED       | PARTIAL                          | dimensión de lectura existente, sin endpoint fundacional dedicado                |
| DAMAGED         | PARTIAL                          | dimensión existente; no se permite forjarla desde movimiento genérico            |
| QUARANTINE      | PARTIAL                          | dimensión existente; no se permite forjarla desde movimiento genérico            |
| VIRTUAL         | NOT IMPLEMENTED                  | no existe estado real                                                            |
| BLOCKED/PENDING | NOT IMPLEMENTED                  | no existen estados reales                                                        |

IN_TRANSIT no se resta de Available porque no forma parte del On Hand local. No se asumió una fórmula distinta a la implementada.

## Track Inventory

No existe un flag persistente `trackInventory`. La regla autoritativa actual es implícita:

- PHYSICAL activo: elegible;
- SERVICE: rechazado;
- Product o Variant archivado: rechazado;
- DIGITAL, GIFT_CARD, CUSTOM, BUNDLE, KIT y COMPOSITE: no están operativos como tipos de Product conforme a Parte 1, por lo que no pueden participar.

No existe transición “desactivar tracking”; por tanto no puede dejar movimientos históricos huérfanos. Esta limitación debe conservarse hasta diseñar un lifecycle explícito.

## Authorization

Permisos reales: `inventory.read`, `inventory.write`, `inventory.adjust`.

| Rol           | Read | Write |           Adjust | Resultado observado                                           |
| ------------- | ---: | ----: | ---------------: | ------------------------------------------------------------- |
| OWNER         |   sí |    sí |               sí | PASS                                                          |
| ADMINISTRATOR |   sí |    sí |               sí | derivado del registry y regresión global                      |
| SUPERVISOR    |   sí |    sí | sí, scope BRANCH | PARTIAL: fail-closed sin branchId en el resource de Inventory |
| CASHIER       |   sí |    no |               no | mutación 403 PASS                                             |
| EMPLOYEE      |   sí |    no |               no | registry default-deny                                         |
| READ_ONLY     |   sí |    no |               no | mutación 403 PASS                                             |

Hallazgo no material de seguridad: aunque Supervisor tiene grants BRANCH, las operaciones actuales construyen el recurso de autorización sin branchId y reciben 403 incluso con membership ALL_BRANCHES. Es una indisponibilidad fail-closed, no un bypass. Debe corregirse al introducir autoridad branch completa en la siguiente subparte; no se debilitó el engine para hacerla pasar.

## RLS

PASS. Las nueve tablas `inventory_*` reportan `relrowsecurity=true` y `relforcerowsecurity=true`. La suite SQL demostró:

- cero filas sin contexto tenant;
- Tenant A solo lee su movimiento;
- cambio de contexto A→B sin contaminación;
- Tenant B no actualiza Location A;
- runtime no posee UPDATE/DELETE sobre ledger/snapshot/event;
- policies presentes y RLS forzado;
- API Beta no obtiene disponibilidad usando Variant/Location Alpha.

RLS es tenant-scoped. Branch isolation se aplica mediante ABAC y referencias Location→Branch; no existe policy branch-level en PostgreSQL. En el estado actual, los actores branch-scoped fallan cerrado cuando falta contexto branch.

## Events

Cada movimiento produce `InventoryEvent` e `InventoryOutbox` en la misma transacción. Se preservan tenant, actor, aggregate, event type, timestamp y payload mínimo con variantId. Idempotency evita evento duplicado por replay.

Observaciones: la taxonomía actual colapsa la mayoría de tipos en `StockAdjusted`; Event/Outbox no persisten el request correlation ID aunque Movement sí conserva uno generado por servidor. La propagación de correlation ID y taxonomía detallada queda como deuda de observabilidad, no como riesgo de cantidad.

## OpenAPI

PASS: 144 operaciones válidas y compatibilidad 3.0.0 PASS. `InventoryMovementInput` ya no publica transiciones internas; enum público restringido a movimientos manuales y state a ON_HAND. `additionalProperties=false`; tenantId, actorId, inventoryId, createdAt y server timestamps no son writeable.

## SDK

PASS: `generate:check` y 2/2 tests. No drift. El manifest conserva todos los endpoints Inventory y no introduce campos autoritativos.

## Web

PASS en el alcance existente: creación/archivado/restauración de Location, persistencia en selector Inventory, selección autoritativa de Variant/Location, consulta de balance, Console y Network sin fallos. Se actualizaron fixtures que aún buscaban `<option>` nativos después de la migración válida a NexoSelect; ahora usan roles accesibles y esperan la respuesta mutativa antes de navegar.

No existe UI completa de ledger administration, Damaged, Quarantine o Committed; se clasifican como parcial/no implementado y no se presentan como certificados.

## Defectos encontrados

1. **Alta integridad:** endpoint genérico aceptaba SALE/TRANSFER/RESERVATION y combinaciones type/state/sign arbitrarias.
2. **Alta integridad:** SERVICE aceptaba movimientos de inventario.
3. **Alta integridad:** check-then-write de balance no tenía lock explícito por aggregate.
4. **Media integridad:** cálculo de cantidades usaba Number fuera de su rango exacto.
5. **Media evidencia:** InventorySnapshot era actualizable por runtime.
6. **Media referencial:** faltaban FKs tenant-bound para Location.branch/parent y Snapshot.variant/movement.
7. **Baja funcional:** Supervisor con permiso branch-scoped falla cerrado por resource sin branchId (pendiente).
8. **Test debt:** dos selectors Web usaban contrato DOM obsoleto y una prueba de tenant usaba un branch UUID como tenant.

## Correcciones aplicadas

- allowlist de movimientos manuales y validación type/state/sign en dominio, DTO, servicio, OpenAPI y DB;
- elegibilidad exclusiva de Variant PHYSICAL activa;
- arithmetic exacta BigInt escalada a seis decimales;
- advisory transaction lock por balance antes de validar/escribir;
- inmutabilidad de snapshots por privilegio y trigger;
- FKs compuestas tenant-bound para Location y Snapshot;
- validación de Branch activa, parent Location y Location activa;
- fixtures Web adaptados al componente actual y tenant Beta real en aislamiento;
- suite E2E dedicada de seis escenarios de integridad.

## Riesgos restantes

- Supervisor BRANCH no puede operar Inventory hasta propagar branchId autoritativo a la decisión; seguro por fail-closed.
- COMMITTED, DAMAGED y QUARANTINE son dimensiones estructurales sin lifecycle dedicado certificado.
- RLS no filtra por branch; la barrera branch final es ABAC/FK, no policy SQL.
- Eventos no propagan correlation ID de request y su taxonomía es poco específica.
- Worker de expiración opera como rol privilegiado cross-tenant y depende de filtros tenant explícitos; su flujo básico pasó, pero requiere revisión específica junto con reservations avanzadas.
- FIFO, Cost Layers, Transfers y Counts aparecen en el código pero su corrección económica/operativa no está certificada en esta subparte.

## Tests

| Suite                            | Resultado  |               Conteo |
| -------------------------------- | ---------- | -------------------: |
| Inventory foundation E2E         | PASS       |                  6/6 |
| Inventory existing E2E           | PASS final |                  5/5 |
| Inventory Location/Web selectors | PASS       |                  3/3 |
| Inventory unit                   | PASS       |                  6/6 |
| API unit/contract                | PASS       |                31/31 |
| SDK unit/drift                   | PASS       |                  2/2 |
| RLS SQL integration              | PASS       | todos los assertions |
| OpenAPI validate/compatibility   | PASS       |      144 ops / 3.0.0 |

Durante el baseline hubo 2 FAIL de fixtures Web obsoletos; fueron explicados, corregidos y repetidos. La primera repetición amplia mostró 1 FAIL al corregir el tenant Beta real porque el control devuelve 400 genérico en vez del antiguo 403 por organización inexistente; se actualizó la expectativa al contrato seguro y se repitió.

## Quality Gates

| Gate                    | Resultado |
| ----------------------- | --------- |
| format                  | PASS      |
| lint                    | PASS      |
| typecheck               | PASS      |
| unit                    | PASS      |
| integration/RLS SQL     | PASS      |
| Inventory E2E           | PASS      |
| Web Inventory           | PASS      |
| OpenAPI                 | PASS      |
| compatibility           | PASS      |
| SDK drift               | PASS      |
| production builds       | PASS      |
| Docker API build/deploy | PASS      |
| health live/ready       | PASS      |
| pnpm check              | PASS      |

## Evidencia

- API final construida desde el workspace con pnpm 10.13.1, frozen lockfile y store offline; image ID registrado en el cierre.
- Migración `20260722024500_inventory_foundation_integrity` aplicada con `finished_at` no nulo.
- Docker Compose: API, Web, Worker, PostgreSQL, Redis, MinIO, Mailpit y OTEL healthy.
- Carrera reproducible: receipt 10 + 10×(-2) → 5 aceptadas, 5 conflictos, saldo 0.
- SQL adversarial: UPDATE/DELETE movement y UPDATE snapshot rechazados.
- Privilegios runtime: solo SELECT/INSERT en movement/snapshot/event.
- Nueve tablas Inventory con FORCE RLS.

## Archivos Modificados

- `packages/inventory/src/index.ts`
- `packages/inventory/src/index.test.ts`
- `apps/api/src/modules/inventory/application/inventory.service.ts`
- `apps/api/src/modules/inventory/interface/inventory.dto.ts`
- `apps/api/src/modules/inventory/infrastructure/prisma-inventory.repository.ts`
- `packages/contracts/openapi/openapi.json`
- `packages/database/prisma/migrations/20260722024500_inventory_foundation_integrity/migration.sql`
- `tests/e2e/inventory-foundation-certification.spec.ts`
- `tests/e2e/inventory.spec.ts`
- `tests/e2e/inventory-location-crud.spec.ts`
- `tests/e2e/inventory-selectors-and-balance.spec.ts`
- `docs/PRODUCT_CERTIFICATION_PART_1B_INVENTORY_FOUNDATION.md`

Git no ofrece baseline rastreado (workspace completo aparece untracked); la atribución se basó en archivos inspeccionados, timestamps, migración, artefacto Docker y pruebas reproducibles.

## Observaciones para Product Certification Part 1B — Parte 3 — Subparte 2

- Resolver branch-aware authorization leyendo Location.branch dentro de la misma frontera autoritativa antes de evaluar Supervisor.
- Certificar Reservations avanzadas, including release/consume races y expiración multi-worker.
- Certificar Transfer lifecycle e IN_TRANSIT sin asumir esta cobertura estructural como cobertura operativa.
- Certificar FIFO/Cost Engine por separado; aún existen conversiones Number en cálculo de costos fuera del núcleo de cantidades.
- Diseñar lifecycle autoritativo para DAMAGED, QUARANTINE y COMMITTED o mantenerlos comercialmente como readiness.
- Propagar request correlation ID a InventoryEvent/Outbox y ampliar event taxonomy.
- Mantener los locks por balance, constraints semánticos, inmutabilidad y FORCE RLS como regresión obligatoria.
