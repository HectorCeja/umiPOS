# NEXO Product Certification Part 2A — Parte 1 de 5

## Veredicto

**PASS WITH OBSERVATIONS**

## Executive Summary

Sale Aggregate, líneas, snapshots, checkout foundation, totals, idempotencia, folios, Inventory boundary, suspensión, autorización y aislamiento quedaron demostrados. Diez creates con la misma key produjeron una venta lógica; diez creates independientes generaron diez folios únicos; diez ventas sobre cinco unidades tuvieron cinco checkouts ganadores y cinco conflictos, con available final cero.

Se corrigieron dos defectos reales: quantity `0` llegaba a base de datos y respondía 500 en lugar de validarse como 400, y Sales Web carecía de una jerarquía landmark accesible correcta. Resultado final: 90 pruebas dirigidas PASS, cero FAIL.

## Scope

Esta parte cubre Sales/Cart/Checkout/Totals/Inventory foundation. Payments, Cash Drawer, Refunds financieros, Offline, fiscalidad final y recovery de pagos permanecen fuera de alcance, aunque algunos flujos existentes se usaron como precondición para completar una venta.

## Inherited Guarantees

Se conservaron Product/Variant tenant-bound, precio activo determinista, moneda organizacional, Inventory ledger/reservations/FIFO, RLS/FORCE RLS e historia de Product/Price/Inventory.

## Sales Architecture

API → `SalesService` → ProductSalesCatalog + InventorySalesCoordinator → PrismaSalesRepository → PostgreSQL/Events/Outbox. El aggregate de `@nexo/sales` define lifecycle, money/totals y snapshots. Web es administración. Flutter contiene Cart/Checkout cliente, pero el runtime no fue ejecutable en este host.

## Sale Aggregate

**PASS.** Tenant, organization, actor, membership, status, folio, totals, version y timestamps son server-authoritative. El DTO whitelist rechaza totals/status/seller enviados por cliente.

## Sale Lifecycle

**PASS WITH OBSERVATIONS.** Estados reales: DRAFT, OPEN, SUSPENDED, CHECKOUT_PENDING, PAYMENT_PENDING, COMPLETED, CANCELLED, PARTIALLY_REFUNDED, REFUNDED, FAILED y EXPIRED. Transiciones inválidas y completion concurrente retornan conflicto; estados terminales no reabren silenciosamente.

## Sale Creation

**PASS.** Crea Sale tenant/branch-bound con folio y evento. Venta vacía puede existir como OPEN/DRAFT foundation, pero checkout vacío se rechaza.

## Idempotency

**PASS.** Unique `(tenant, idempotencyKey)` y `sales_idempotency` preservan una venta lógica. Same key/same payload replays; payload divergente retorna 409. Diez requests concurrentes dieron un solo ID.

## Sale Lines

**PASS WITH OBSERVATIONS.** Add line resuelve ProductVariant y snapshots en servidor; quantity positiva hasta seis decimales. Update/remove de línea no están expuestos actualmente. Líneas idénticas permanecen separadas por operación.

## Product Snapshot

**PASS.** SaleItem conserva productId/variantId, SKU, barcode, nombres, unidad y tax metadata. Cambios vivos posteriores no reescriben historia.

## Price Snapshot

**PASS.** Unit amount, source y priceVersion se congelan al agregar línea. Checkout vuelve a resolver precio y retorna `CHECKOUT_RECALCULATION_REQUIRED` si cambió.

## Cart

**PARTIAL.** No hay Cart aggregate backend; Sale abierta es la autoridad persistida. Flutter tiene `PosCart` local y stable idempotency keys. El backend revalida línea, precio, totals e Inventory.

## Checkout Foundation

**PASS.** Revalida estado, líneas, precio y sellability; crea reservations por PHYSICAL, compensa reservations ya creadas ante fallo y transiciona con optimistic concurrency.

## Totals Engine

**PASS.** Line subtotal, discounts, tax y total se calculan con BigInt/minor units. Totals enviados por cliente no son aceptados.

## Money Precision

**PASS.** Dinero se representa en minor units string/BigInt; PostgreSQL usa bigint. No existe float autoritativo ni mezcla implícita de monedas.

## Quantity Precision

**PASS después de corrección.** Decimal string con máximo 14 enteros y seis decimales; cero, negativos y escala siete se rechazan 400. Inventory usa la misma precisión.

## Rounding

**PASS.** Política real HALF_UP por defecto, con soporte domain HALF_EVEN/DOWN. El vector SERVICE `0.125 × 2500` produjo subtotal 313 y total fiscal 363 de forma determinista.

## Discounts Foundation

**PARTIAL / NOT OPERATIONAL por API.** Aggregate y policy soportan descuentos manuales y límites, pero no existe endpoint público add/apply discount en esta parte. Cliente no puede falsificar discountTotal.

## Tax Foundation

**PARTIAL.** Sales captura snapshot de `taxProfileKey`/version/treatment/rate y calcula el contrato técnico actual; TaxProfile no es autoridad fiscal y no se certifica cumplimiento mexicano, SAT o CFDI.

## SERVICE Products

**PASS WITH OBSERVATIONS.** SERVICE se vende con precio/snapshot y quantity decimal sin reservation o Movement Inventory. Scheduling/duration/staff no existen.

## PHYSICAL Products

**PASS.** Requiere Product sellable y, con policy default, reservation autoritativa antes de pago/completion.

## Inventory Boundary

**PASS.** Sales usa InventorySalesCoordinator; no crea movimientos manuales SALE. Reservation/commit y snapshots permanecen en Inventory.

## Reservation Strategy

**PASS.** Reserva durante checkout, TTL default 900 s; completion consume y fallo parcial compensa. No existe COMMITTED lifecycle separado.

## Last Stock Concurrency

**PASS.** Stock 5, diez ventas quantity 1: cinco checkout 201, cinco 409; onHand 5, reserved 5, available 0. Sin overselling o falso éxito.

## Suspended Sales

**PASS WITH OBSERVATIONS.** Suspend/resume/cancel/expiry y list están implementados. Pricing/Inventory se revalidan al checkout; UI avanzada POS queda en Flutter.

## Sale Number and Folios

**PASS.** Folio único por tenant/branch. Diez creates independientes produjeron diez IDs y folios únicos; cliente no puede escribir folio.

## Customer Reference

**PARTIAL / NOT OPERATIONAL.** Schema admite customerId opcional, pero Create DTO no permite asignarlo. No se certificó Customer domain ni PII.

## Cashier/Register/Device Context

**PARTIAL.** Actor/membership/branch se derivan autoritativamente; registerId es opcional y no se recibe en Create. Device enrollment no se integra aún como requisito de Sale. Cash Drawer queda fuera de alcance.

## Authorization

**PASS.** Cashier opera según permisos de Sales; ReadOnly/roles sin permiso no mutan. Identidad, tenant y branch forjados no sustituyen sesión/ABAC.

## Tenant Isolation

**PASS.** API y RLS ocultan/rechazan Sale/Product/Variant cross-tenant; Events/Outbox son tenant-scoped.

## Branch Isolation

**PASS WITH OBSERVATIONS.** ABAC y branch de Sale/Inventory impiden operación fuera de scope. RLS SQL continúa tenant-scoped; no se afirma branch-level RLS.

## RLS

**PASS.** `sales`, `sale_items`, `sale_payments`, `sale_receipts`, `sales_idempotency`, `sales_events`, `sales_outbox` y `sales_policies` tienen RLS/FORCE RLS. Matriz SQL default-deny y Tenant A/B pasa; plataforma total 65/65.

## Database Constraints

**PASS WITH OBSERVATIONS.** Uniques de idempotency/folio, tenant FKs, no-delete triggers e Inventory constraints protegen historia. Quantity cero ya no alcanza la constraint desde API.

## Optimistic Concurrency

**PASS.** If-Match/version controla líneas, checkout y lifecycle; completion concurrente tiene un ganador y conflictos explícitos.

## Transactional Integrity

**PASS WITH OBSERVATIONS.** Repository agrupa aggregate/events/outbox. Checkout compensa reservations creadas antes de fallo. Inventory commit y Sale transition son coordinados idempotentemente, pero no constituyen una única transacción PostgreSQL cross-module; recovery profundo pasa a Part 3A.

## Events and Outbox

**PASS.** Eventos incluyen tenant, branch, actor, aggregate/version y correlationId. Replay no duplica lógica. Con Worker detenido, pending Sales Outbox subió de 9 a 11 y fue preservado.

## Audit

**PASS WITH OBSERVATIONS.** Timeline y eventos preservan acciones exitosas; Audit Denials uniforme continúa PARTIAL y se transfiere a Observability/Security.

## Error Contract

**PASS después de corrección.** Validation 400, auth 401/403, tenant hiding 404 y conflicts 409. Quantity cero pasó de 500 reproducible a 400.

## OpenAPI

**PASS.** 144 operaciones, compatibility 3.0.0, refs/security PASS. Quantity ahora documenta estrictamente valor positivo. No se añadieron endpoints de módulos fuera de alcance.

## SDK

**PASS.** Generate/check/tests/build sin drift. No expone totals/tenant/actor/folio como inputs writeable.

## Web Admin

**PASS.** 44/44: overview, history, detail, snapshots, totals, suspended Sales, errors, branch/tenant denial, diagnostics y ausencia explícita de POS Web. Landmark único y Axe sin violations después de corrección.

## Flutter POS Contract

Código real y tests existen para Cart, checkout, stable keys, unknown outcome y real API. Runtime: **BLOCKED**, `flutter` no está instalado. Comandos pendientes: `pnpm flutter:pos:analyze`, `pnpm flutter:pos:test`, `pnpm flutter:pos:build`.

## Failure Smoke

**PASS WITH OBSERVATIONS.** Worker detenido no impide Create ni pierde Outbox; retry concurrente permanece single-sale. API restart/Redis/DB chaos y payment recovery profundo se transfieren a Part 3A/Partes posteriores.

## Historical Integrity

**PASS.** Completed Sale, SaleItems, Events y folio conservan snapshots; no-delete triggers protegen Sales/SaleItems/Events. Product/Price posterior no reescribe historia.

## Migrations

**PASS.** 44 aplicadas, cero pendientes o constraints NOT VALID. No se agregó migración en esta parte.

## Defectos encontrados

1. **Material/error contract:** quantity `0` llegaba a DB y devolvía 500.
2. **No material/Web accessibility:** contenido Sales fuera de landmarks; primer arreglo produjo main anidado y se corrigió a un único main superior.
3. **Test evidence:** fixture Web seleccionaba la venta más reciente en vez de una COMPLETED.

## Correcciones aplicadas

- Regex DTO/OpenAPI de SaleLine exige quantity estrictamente positiva.
- Global shell usa landmark `main`; Sales inner surface usa `section`.
- Fixture Sales Admin selecciona explícitamente historia COMPLETED.
- Suite adversarial reproducible de Sales Foundation.

## Capacidades no implementadas

Cart backend independiente, line update/remove, discount API, Customer assignment, register/device authority completa, manual price, tax fiscal, CFDI, branch availability, full POS Web, provider payments certificado, Cash Drawer, Refund certification y Offline.

## Riesgos restantes

- Checkout compensation es coordinación idempotente, no una sola transacción cross-module.
- Audit Denials no uniforme.
- Branch SQL isolation depende de ABAC/FKs.
- Tax snapshot técnico no equivale a fiscalidad certificada.
- Flutter runtime no ejecutado.
- Suspended Sales mantiene pricing/stock sujeto a revalidación al checkout.

## Riesgos transferidos

Payments/Cash: payment lifecycle, cash drawer, mixed/external settlement. Refunds: void/refund/returns. Offline/Resilience: unknown outcome, restart, backlog y compensation recovery. Performance: sales/reservation storms. Reports: tax/margin/valuation. UMI×NEXO: integration ownership.

## Tests ejecutados

- Sales unit: 8/8 PASS.
- Sales existing E2E: 6/6 PASS.
- Sales Foundation adversarial: 5/5 PASS final.
- Product/Pricing/Inventory/Authorization focal: 27/27 PASS.
- Sales Web: 44/44 PASS final.
- Total dirigido: 90 PASS, 0 FAIL final.
- RLS SQL: PASS.
- Worker-off retry: 1/1 PASS (repetición de escenario incluido).

Fallos intermedios no ocultados: quantity cero 500; Web 43/44 por landmark; rerun 35/44 por fixture acumulado y luego 43/44 por main duplicado; primer `pnpm check` se detuvo en format. Todos fueron corregidos y repetidos.

## Tests no ejecutados

- Flutter analyze/test/build: BLOCKED por toolchain ausente.
- Payments/Cash/Refund/Offline completos: fuera de alcance.
- Chaos/recovery profundo y performance masiva: transferidos.

## Quality Gates

Format, lint, typecheck, unit/integration, builds, Sales/Checkout E2E, regresiones, RLS SQL, OpenAPI compatibility, SDK drift, Docker API/Web build+deploy, live/ready y Worker health: **PASS**. Dependency audit no se ejecutó porque manifests/lockfile no cambiaron.

## Evidencia

`artifacts/certification/part-2a-sales-foundation/summary.json`, suites E2E, SQL RLS, OpenAPI/SDK output, health y digests. Sin secretos, tokens, cookies o PII.

## Artefactos certificados

- API: `sha256:2bb2af33a30e073bd727df1671446d5af63558f427b15b47520f4d01edb8ca92`.
- Web: `sha256:7ec2f9cd2f8e02564f984facc641e377e700ecb82aa487e45ef4520f00222f4c`.
- Worker: `sha256:e41632ea25c8679ac944bb12b5f7552f3286539192cd3a6794e51f6498c9e74c`.
- API/Web/Worker ejecutan como `nexo` y finalizaron healthy.

## Archivos modificados

- `apps/api/src/modules/sales/interface/sales.dto.ts`
- `apps/web/src/app/global-shell.tsx`
- `apps/web/src/app/sales/sales-administration-console.tsx`
- `packages/contracts/openapi/openapi.json`
- `tests/e2e/sales-foundation-certification.spec.ts`
- `tests/e2e/sales-administration-certification.spec.ts`
- `docs/PRODUCT_CERTIFICATION_PART_2A_SALES_FOUNDATION.md`
- `artifacts/certification/part-2a-sales-foundation/summary.json`

## Handoff a Product Certification Part 2A — Parte 2

Parte 2 puede asumir Sale Aggregate/Lines, snapshots, totals, minor-unit money, quantity precision, idempotency, folios, checkout/reservation/last-stock boundary, authorization, tenant/branch isolation, RLS, Events/Outbox e historia consistente.

No debe asumir Tax Engine fiscal, payment lifecycle certificado, Cash Drawer, Refunds, Offline, Flutter runtime, discount API, Customer/Register/Device completos o branch availability.

## NTFY

Inicio: `rOCjfyMahlUy`. Final: `dDRyR7TzJnul`. No ocurrió bloqueo material. Duración: 14m 5s.
