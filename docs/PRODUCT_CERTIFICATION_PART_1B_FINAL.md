# NEXO Product Certification Part 1B — Final

## Decisión de certificación

**PART 1B CERTIFIED WITH OBSERVATIONS**

## Executive Summary

Las capacidades implementadas esenciales de Product, Catalog, Media, Pricing e Inventory conservaron integridad, aislamiento y determinismo. No se reprodujo estado imposible de Product, fuga de media, precio activo ambiguo, ledger mutable, pérdida, duplicación o creación espontánea de inventario, bypass tenant material ni corrupción histórica.

La regresión final terminó con 54 pruebas dirigidas PASS y cero FAIL finales. OpenAPI conserva 144 operaciones, SDK no tiene drift, 44/44 migraciones se aplicaron también sobre una base efímera limpia y las 65 tablas de aplicación tienen RLS y FORCE RLS. Las capacidades ausentes permanecen clasificadas; no fueron construidas ni convertidas artificialmente en PASS.

## Alcance

Se consolidaron Product Core, tipos operativos, identifiers, Categories, Variants, Media, Pricing, Tax references, Inventory ledger/snapshots/states, Reservations, Transfers, FIFO/cost foundation, Counts/Reconciliation, Locations, Warehouse readiness y receiving directo. Sales, Checkout, Tax Engine, Reporting, Purchasing completo, WMS, resiliencia profunda y performance masiva quedan fuera de alcance.

## Estado heredado de Part 1A

Part 1A permanece **CERTIFIED WITH OBSERVATIONS**. La regresión final de autorización fue 6/6 PASS: roles/tenant/branch falsos no alteran decisiones, Owner continúa protegido y los permisos desconocidos permanecen default-deny.

## Product Core

**PASS.** Product/actor/tenant/version son autoritativos; nombre whitespace, tipo no operativo, relaciones cross-tenant y stale writes se rechazan. Create/read/list/update/archive/restore e historia permanecen consistentes.

## Product Types

PHYSICAL: **PASS**. SERVICE: **PASS WITH OBSERVATIONS** y excluido de Inventory. BUNDLE, KIT, COMPOSITE, DIGITAL, GIFT_CARD, SUBSCRIPTION y CUSTOM: **NOT IMPLEMENTED**; su presencia conceptual o enum no constituye funcionalidad.

## Identifiers

SKU tenant-scoped, Barcode/GS1 y combinaciones canónicas de Variant: **PASS**. Constraints de base impiden duplicados concurrentes y relaciones Variant/Product inválidas.

## Categories

Create/list/hierarchy/ciclos/tenant isolation: **PASS**. Rename, move, archive, restore y delete: **NOT IMPLEMENTED**.

## Variants

**PASS.** Combinación canónica, uniqueness concurrente, Product ownership y tenant boundaries demostrados.

## Product Lifecycle

**PASS.** Tipo inmutable, optimistic locking y transiciones autoritativas; archivado conserva IDs e historia.

## Media

**PASS WITH OBSERVATIONS.** Upload/finalize/read privada, ownership A/B, signed PUT 900 s, MIME exacto, magic bytes, 5 MiB, rechazo HTML/SVG/JS y MinIO privado están demostrados. Signed GET es **NOT APPLICABLE**. Delete/reorder/cleanup/EXIF removal son **NOT IMPLEMENTED**. PUT es reutilizable durante su ventana, pero key y finalize permanecen server-bound.

## Pricing

**PASS WITH OBSERVATIONS.** Existe exactamente un precio activo, montos decimales exactos, currency organizacional y Variant/Product tenant-bound. Cost y sale price no se mezclan. Effective dates, branch/channel pricing y compare-at: **NOT IMPLEMENTED**. Price Lists: **NOT OPERATIONAL**.

## Tax References

`taxProfileKey` es metadata referencial, no autoridad fiscal. TaxProfile entity y tax included/excluded: **NOT IMPLEMENTED**. Tax calculation: **NOT CERTIFIED**, transferido a Sales.

## Inventory Architecture

Ledger autoritativo + snapshots derivados, advisory locks, exact numeric arithmetic, Events/Outbox y RLS: **PASS WITH OBSERVATIONS**.

## Ledger

**PASS.** Receipt, adjustment, correction, waste, consumption, reservation, transfer, count y sale consumption mantienen reglas de signo/estado. UPDATE/DELETE runtime están bloqueados; no hubo underflow ni replay duplicado.

## Snapshots

**PASS.** Inmutables, derivados del Movement confirmado y consistentes con el ledger. Rebuild automático: **NOT IMPLEMENTED**.

## Stock States

ON_HAND, AVAILABLE, RESERVED e IN_TRANSIT: **PASS**. AVAILABLE respeta `onHand - reserved - committed - damaged - quarantine`. COMMITTED lifecycle: **NOT IMPLEMENTED**. DAMAGED y QUARANTINE: **PARTIAL**. VIRTUAL/BLOCKED/PENDING: **NOT IMPLEMENTED**.

## Reservations

**PASS.** Create/release/consume/expiration, concurrencia, replay, snapshots y eventos son single-winner; available no se vuelve negativo.

## Transfers

**PASS WITH OBSERVATIONS.** Source, IN_TRANSIT y destination conservan unidades; receive concurrente tiene un ganador. Cancel/reject/rollback: **NOT IMPLEMENTED**.

## FIFO

**PASS.** Capas ordenadas, consumo parcial/completo, precisión de seis decimales, costo persistido e historia inmutable.

## Cost Foundation

FIFO: **PASS**. Weighted Average y Standard Cost: **NOT OPERATIONAL**. LIFO: **NOT IMPLEMENTED**. Receiving sin unitCost puede crear stock no valorado y se transfiere a Reports/Purchasing Foundation.

## Counts

**PASS.** Conteos positivos, negativos y sin diferencia, retries concurrentes y evidencia inmutable demostrados. Count Sessions, Count Lines y Blind Counts: **NOT IMPLEMENTED**.

## Reconciliation

**PASS.** `difference = counted - onHand`; usa Movement COUNT, no reescribe historia y no crea Movement artificial cuando la diferencia es cero.

## Receiving

Movement PURCHASE directo: **PASS WITH OBSERVATIONS**. Idempotencia concurrente, cantidades exactas, PHYSICAL, Location activa, CostLayer opcional, Snapshot, Event y Outbox demostrados. No existe Receiving aggregate ni semántica partial/over/under contra PO.

## Locations

**PASS.** CRUD, archive/restore, selectors, balances independientes y parent tenant/branch-bound.

## Warehouse Readiness

BRANCH→WAREHOUSE→ZONE→SHELF→BIN: **PASS como readiness**. Picking, put-away, pallets, lots, serials, capacity, expiration y WMS: **NOT IMPLEMENTED**.

## Suppliers

**NOT IMPLEMENTED.**

## Purchasing

**NOT IMPLEMENTED.** No hay Supplier, PurchaseOrder, lines, approvals ni expected quantity.

## Reorder

**PARTIAL / NOT OPERATIONAL.** `lowStockThreshold` es metadata sin API/SDK/UI ni Suggested Orders.

## Authorization

**PASS WITH OBSERVATIONS.** Owner/Administrator operan según permisos; Cashier, Employee y ReadOnly no administran catálogo/inventario. El Supervisor branch-scoped permanece fail-closed porque Inventory no propaga todavía Location→Branch al recurso ABAC; es limitación comercial, no bypass.

## Branch Isolation

**PASS WITH OBSERVATIONS.** Location y relaciones están branch-bound por ABAC/FKs. SQL RLS es tenant-scoped; no se afirma branch-level RLS. Headers o branchId del cliente no sustituyen contexto autoritativo.

## RLS

**PASS.** 65 tablas de aplicación con RLS y FORCE RLS; default-deny sin contexto, Tenant A/B, connection reuse y SQL adversarial pasaron. Cero constraints `NOT VALID`.

## Events and Outbox

**PASS WITH OBSERVATIONS.** Product/Media/Price/Inventory/Reservation/Transfer/Count generan evidencia transaccional e idempotente. Correlation ID no es uniforme en todos los eventos y se clasifica deuda transversal de Observability.

## Audit

Éxitos y evidencia de movimientos: **PASS**. Audit Denials uniforme: **PARTIAL**, transferido a Security/Observability; los controles preventivos sí son autoritativos.

## OpenAPI

**PASS.** 144 operaciones válidas, compatibility y referencias PASS. No anuncia Suppliers, Purchase Orders, Receiving aggregate, Reorder, WMS, Count Sessions o Recovery. Campos autoritativos no son writeable.

## SDK

**PASS.** Generate/check/tests/build sin drift ni modelos fantasma.

## Web Admin

**PASS para superficies existentes.** Product, media, pricing, Inventory y Locations terminaron browser PASS, sin falsos éxitos observados. UI de Reservations/Transfers/Counts/Purchasing/Recovery: **NOT IMPLEMENTED**.

## Flutter POS Contract

API contract: **PASS**. Runtime Flutter: **BLOCKED** porque Flutter no está instalado en el host. No se simuló ni se cuenta como PASS; se transfiere a certificación Flutter y no bloquea las invariantes backend/DB.

## Historical Integrity

**PASS.** Product archive/rename, Price history, Movements, Counts, Transfers y CostLayers preservan IDs y evidencia. FKs/RESTRICT e inmutabilidad impiden eliminación destructiva runtime.

## Migrations

**PASS.** 44 directorios = 44 migraciones aplicadas. Una base efímera limpia con owner `nexo_migration` aplicó las 44; 65/65 tablas RLS/FORCE RLS y cero constraints sin validar. El primer intento efímero con owner incorrecto falló por privilegios y fue repetido correctamente sin ampliar permisos.

## Concurrency

**PASS.** Las suites cubren SKU/Barcode/Variant, Price, Media finalize, outflows, Reservations/release/consume, Transfer receive, FIFO, Counts y Receiving. No se observaron duplicados, lost update, underflow ni eventos dobles.

## Failure Smoke

**PASS WITH OBSERVATIONS.** Worker detenido no rompe readiness y Outbox conserva trabajo. MinIO detenido produce readiness 503 con Problem Details; al restaurarlo vuelve healthy. Retries de receipts/counts son idempotentes. Resiliencia profunda y recovery automático pasan a Part 3A.

## Defectos corregidos

No apareció un defecto material nuevo en Parte 5. Las Partes 1–4 corrigieron ownership cross-tenant Product/Variant/Media/Price, tipos fantasma operativos, MIME activo, currency mismatch, locks/concurrencia, ledger/count integrity y fixtures de evidencia.

## Capacidades no implementadas

Bundles/Kits/Composite/Digital/Gift Card/Subscription/Custom, UoM formal, branch/channel visibility, import/export, Media delete/reorder/cleanup, effective/branch/channel pricing, Tax Engine, committed lifecycle, transfer cancel/reject/rollback, count sessions/blind counts, automated replay/recovery, Suppliers, Purchase Orders, Reorder Engine, WMS, lots, serials y expiration.

## Riesgos restantes

- Product Create sin SKU no ofrece idempotencia general.
- Signed PUT es reutilizable durante 900 s; EXIF no se elimina.
- Price retry puede agregar historia aunque mantenga un único activo.
- Receiving sin unitCost crea stock no valorado.
- Supervisor branch-scoped permanece fail-closed en Inventory.
- Branch isolation SQL depende de ABAC/FKs sobre RLS tenant-scoped.
- Correlation IDs y Audit Denials no son uniformes.
- Flutter runtime no fue ejecutado.

## Riesgos transferidos

Sales/Checkout: precio snapshot, tax calculation, availability, refunds y Gift Cards. Reports: valoración/no-valued stock, margins y low-stock. Part 3A: replay/rebuild, media cleanup, outages y backlog. Part 3B: tormentas y gran escala. Ecosystem: branch/channel/POS/KDS/scanner. UMI×NEXO: storage, dashboards, observability, backups y ownership infra.

## Matriz final de certificación

| Dominio    | Capacidad                                                  | Resultado              | Evidencia/observación             | Fase futura   |
| ---------- | ---------------------------------------------------------- | ---------------------- | --------------------------------- | ------------- |
| Product    | Aggregate/PHYSICAL                                         | PASS                   | E2E, locking, DB                  | —             |
| Product    | SERVICE                                                    | PASS WITH OBSERVATIONS | No Inventory                      | Sales         |
| Product    | BUNDLE/KIT/COMPOSITE/DIGITAL/GIFT_CARD/SUBSCRIPTION/CUSTOM | NOT IMPLEMENTED        | Rechazados                        | Roadmap       |
| Catalog    | SKU/Barcode/GS1/Variants                                   | PASS                   | Constraints y carreras            | —             |
| Catalog    | Categories                                                 | PASS WITH OBSERVATIONS | CRUD parcial, sin ciclos          | Ecosystem     |
| Catalog    | Attributes/Options                                         | PARTIAL                | Agregados limitados               | Roadmap       |
| Catalog    | UoM/Branch/Channel                                         | NOT IMPLEMENTED        | Sin autoridad operacional         | Ecosystem     |
| Media      | Upload/Read/Signed PUT/MIME/bytes                          | PASS                   | A/B, MinIO, expiry                | —             |
| Media      | Delete/Reorder/Cleanup                                     | NOT IMPLEMENTED        | Sin endpoints                     | Part 3A       |
| Media      | Signed GET                                                 | NOT APPLICABLE         | Lectura autenticada               | —             |
| Pricing    | Product/Variant/Currency                                   | PASS                   | Único activo                      | —             |
| Pricing    | Effective/Branch/Channel/Compare-at                        | NOT IMPLEMENTED        | Sin contrato                      | Sales         |
| Pricing    | Price Lists                                                | NOT OPERATIONAL        | Metadata                          | Sales         |
| Tax        | Profile/calculation/inclusion                              | NOT IMPLEMENTED        | key no autoritativa               | Sales         |
| Inventory  | Ledger/Snapshots/OnHand/Available                          | PASS                   | SQL/E2E                           | —             |
| Inventory  | Reserved/Reservations                                      | PASS                   | Concurrencia/expiry               | —             |
| Inventory  | Committed                                                  | NOT IMPLEMENTED        | Sin lifecycle                     | Sales         |
| Inventory  | Damaged/Quarantine                                         | PARTIAL                | Estado estructural                | Roadmap       |
| Inventory  | InTransit/Transfers                                        | PASS WITH OBSERVATIONS | Sin cancel/reject                 | Roadmap       |
| Cost       | FIFO                                                       | PASS                   | Layers/cost/history               | —             |
| Cost       | Weighted/Standard                                          | NOT OPERATIONAL        | No autoridad                      | Reports       |
| Counts     | Count/Reconciliation                                       | PASS                   | Idempotencia/historia             | —             |
| Counts     | Sessions/Blind                                             | NOT IMPLEMENTED        | Sin modelos                       | Roadmap       |
| Recovery   | Replay/Rebuild                                             | NOT IMPLEMENTED        | Solo reconstrucción probatoria    | Part 3A       |
| Operations | Direct Receiving                                           | PASS WITH OBSERVATIONS | Cost opcional                     | Reports       |
| Operations | Suppliers/PO/Reorder                                       | NOT IMPLEMENTED        | Threshold parcial                 | Roadmap       |
| Locations  | Hierarchy                                                  | PASS                   | Cinco niveles                     | —             |
| Warehouse  | WMS/Lots/Serials/Expiration                                | NOT IMPLEMENTED        | Sin modelos                       | Roadmap       |
| Security   | Authorization/RLS                                          | PASS WITH OBSERVATIONS | 65/65 RLS, Supervisor fail-closed | Security      |
| Contracts  | OpenAPI/SDK                                                | PASS                   | 144, no drift                     | —             |
| Delivery   | Web Admin                                                  | PASS                   | 8/8 browser                       | —             |
| Delivery   | Flutter runtime                                            | BLOCKED                | Toolchain ausente                 | Flutter cert  |
| Platform   | Events/Audit                                               | PASS WITH OBSERVATIONS | correlation/denials parciales     | Observability |
| Integrity  | Concurrency/History                                        | PASS                   | Suites dirigidas                  | Part 3B       |

## Matriz comercial V1

V1 puede anunciar PHYSICAL/SERVICE, SKU/Barcode/Variants/Categories actuales, media privada, precio activo en moneda organizacional, Inventory ledger/balances, Reservations, Transfers, FIFO foundation, conteo/reconciliación puntual, Locations jerárquicas y receiving directo.

V1 no debe anunciar ninguno de los módulos clasificados NOT IMPLEMENTED/NOT OPERATIONAL, ni Tax Engine, valoración completa de todo stock, WMS o recovery automático.

## Tests ejecutados

- Domain certification: 40/40 PASS final. En el intento consolidado inicial Inventory terminó 25/25; Product/Media fueron bloqueados por 429 y 13 pruebas no corrieron, por lo que esas suites se repitieron aisladas.
- Product: 8/8 PASS final.
- Media/Pricing: 7/7 PASS final.
- Web Product/Media/Inventory/Locations: 8/8 PASS.
- Authorization: 6/6 PASS.
- RLS SQL: PASS.
- Total dirigido final: 54 PASS, 0 FAIL.
- `pnpm check`: PASS; format, lint, typecheck, unit/integration y builds.

## Tests no ejecutados

- Flutter analyze/test/build: BLOCKED, Flutter no instalado.
- UI inexistente y capacidades NOT IMPLEMENTED: no se fabricaron tests funcionales.
- Performance/chaos/recovery profundo: transferidos a Part 3A/3B.
- Dependency audit: no se modificaron manifests ni lockfile en Parte 5.

## Quality Gates

| Gate                                              | Resultado       |
| ------------------------------------------------- | --------------- |
| format/lint/typecheck/unit/integration/build      | PASS            |
| Product/Catalog/Media/Pricing E2E                 | PASS            |
| Inventory Foundation/Advanced/Recovery/Operations | PASS            |
| Authorization/RLS                                 | PASS            |
| Web                                               | PASS            |
| OpenAPI/SDK                                       | PASS            |
| Migrations limpia/desplegada                      | PASS            |
| Docker/live/ready/Worker/MinIO/PostgreSQL/Redis   | PASS            |
| Flutter runtime                                   | BLOCKED externo |

## Evidencia

Evidencia sanitizada en `artifacts/certification/part-1b-final/summary.json`; reportes históricos Partes 1–4; suites E2E; SQL RLS; historial Prisma; health y digests. No contiene secretos ni signed URLs.

## Artefactos certificados

- API: `sha256:aec64bea3a2764a2285d6bef8f8dfcd69a6066c9a3f986ae6efb79b409a129cd`.
- Web: `sha256:34b800839aee6f4f7945700886059782574b4072412bfd71ddd64a7d70694aa8`.
- Worker: `sha256:e41632ea25c8679ac944bb12b5f7552f3286539192cd3a6794e51f6498c9e74c`.
- Contenedores API/Web/Worker ejecutan como usuario `nexo` y están healthy.

## Archivos modificados

- `docs/PRODUCT_CERTIFICATION_PART_1B_FINAL.md`
- `artifacts/certification/part-1b-final/summary.json`

## Handoff a Product Certification Part 2A

Sales puede asumir PHYSICAL/SERVICE operativos, tipos ausentes rechazados, Product/Variant tenant-bound, un precio activo determinista, moneda organizacional, media privada, ledger autoritativo, Reservations, Transfers, FIFO, Counts, receiving directo, RLS, authorization e historia inmutable.

Debe tratar Tax Engine como no certificado; `taxProfileKey` no es autoridad fiscal; no hay branch/channel availability, Bundles/Kits/Gift Card/Custom operativos, committed lifecycle independiente ni valoración garantizada para receipts sin unitCost. Price retry puede agregar historia y Supervisor branch-scoped sigue fail-closed.

## Veredicto final

**PART 1B CERTIFIED WITH OBSERVATIONS.** Se autoriza comenzar Product Certification Part 2A conservando las advertencias del handoff. No se comenzó Part 2A durante esta certificación.

## NTFY

- Inicio: `sZsqT6VmJve7`.
- Bloqueo material: no ocurrió.
- Final: `CBOfoN4R6KzD`.
- Duración: 7m 22s.
