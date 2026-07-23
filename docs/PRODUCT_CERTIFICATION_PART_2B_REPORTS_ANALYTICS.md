# NEXO Product Certification Part 2B — Reports & Analytics

## Veredicto

**PASS WITH OBSERVATIONS**

Las métricas implementadas son exactas, determinísticas, reproducibles y tenant/branch scoped. No hubo fallos finales. Las observaciones corresponden a capacidades honestamente no implementadas, no a corrupción o discrepancias financieras.

## Executive Summary

La inspección confirmó que NEXO no tenía un backend analítico autoritativo: la página Web de Reportes reutilizaba un overview operacional limitado a 5,000 ventas y mostraba como ingreso una suma que incluía líneas fuera de estados financieros finales. Se corrigió el defecto creando una única consulta API de lectura sobre las tablas certificadas de Commerce, sin modificar Commerce, Inventory, Payments, Cash, Refunds, migraciones ni ownership.

El endpoint `GET /v1/organizations/{organizationId}/analytics/overview` entrega revenue, ventas, pagos, intentos, caja, inventario, productos y series temporales. Usa minor units/BigInt, rangos `[from,to)`, timezone validada, RLS transaccional y autorización `reports.read`. Web consume el contrato nuevo. OpenAPI contiene 145 operaciones y SDK no presenta drift.

## Revenue

- Gross: suma de snapshots de líneas de Sales `COMPLETED`, `PARTIALLY_REFUNDED` y `REFUNDED`.
- Refunded: únicamente Refund intents `APPROVED`.
- Net: Gross menos Refunded.
- Collected: Payment intents `COMPLETED`; se conserva como cobro bruto, separado del refund.
- Cash: deriva exclusivamente del Cash Ledger por dirección.
- Vector certificado Alpha/A: gross `632200`, refunded `0`, net `632200`, 61 ventas, collected `0`, cash net `432900` minor units; diferencia API/SQL `0`.

## Sales Analytics

PASS: count por estado, completed/refunded/cancelled mediante `byStatus`, average ticket, median, largest, smallest y series por hour/day/week/month. Average y median redondean a minor units en PostgreSQL. La consulta no reconstruye Totals Engine.

## Payment Analytics

PASS: totales y conteos de payments `COMPLETED` por método; outcomes de Payment Attempts por estado. Cash/external/métodos mixtos permanecen como registros de sus métodos reales; no se presenta una integración adquirente inexistente. Success/failure se expone como conteo autoritativo, no una tasa aproximada.

## Inventory Analytics

PASS: on-hand/current, reserved, available, damaged, quarantine, detección de balances negativos y valoración de capas FIFO restantes. Todas las cantidades se serializan como strings exactos. Rotation, aging, fast/slow moving, average cost separado y alert thresholds no existen.

## Product Analytics

PASS: cantidad vendida/devuelta y gross/refunded/net por snapshot histórico de nombre y SKU. El ranking entregado está ordenado por net revenue. Worst sellers como vista separada y margin no están implementados.

## Category Analytics

NOT IMPLEMENTED. Sale Item conserva Product snapshot, pero no Category snapshot. Un join con la categoría mutable actual produciría historia falsa; por ello no se implementó revenue/rate histórico por categoría.

## Dashboard KPIs

PASS para los KPIs existentes: net revenue, sales count, average ticket y approved refunds. Web dejó de usar el overview truncado y muestra valores del endpoint autoritativo. Cash, inventario y productos están disponibles en API, pero todavía no tienen widgets Web.

## Time Series

PASS para intervalos hour/day/week/month y custom range. `from` es inclusivo, `to` exclusivo; timezone se valida con `Intl.DateTimeFormat`; rangos invertidos y zonas inválidas retornan 400. Consultas repetidas produjeron JSON idéntico. PostgreSQL resuelve DST, medianoche y leap year con la zona solicitada.

## Authorization

PASS. Owner y ReadOnly autorizados; Cashier default-deny; Supervisor limitado a su branch y rechazado en otra branch. La organización y branch se validan mediante recursos autoritativos y ABAC; no se confía en un tenant enviado como dato financiero.

## RLS

PASS. Pruebas SQL demostraron default-deny sin contexto, Tenant A, cambio a Tenant B, filtro y JOIN adversarial, y FORCE RLS en siete tablas fuente analíticas. Cash workflow añadió ocho aserciones de privilegios/RLS. RLS continúa tenant-scoped; branch isolation es ABAC/FKs, no branch-level SQL RLS.

## Performance

PASS con fixture transaccional de 100,000 Sales/Items y 1,000,000 Inventory Movements. Revenue: 135.937 ms; inventory balance: 140.124 ms. Veinte requests concurrentes: 339 ms total. Los sequential scans observados recorrieron deliberadamente casi todo el fixture y fueron planes razonables; no se detectó N+1 ni un missing index productivo. El fixture se revirtió y quedaron cero filas sintéticas.

## OpenAPI

PASS: 145 operationIds únicos, validación y compatibilidad 3.0.0. Contrato documenta filtros, seguridad, rangos, intervalos y Money exacto; no anuncia exports, predicciones, Customer CRUD ni capacidades UMI.

## SDK

PASS: generación, `generate:check`, tipos, tests (2/2) y build. El nuevo overview se generó desde OpenAPI y no expone campos financieros writeables.

## Flutter

NOT IMPLEMENTED para Reports/Analytics operacional. No existen pantallas POS de dashboard/reportes; el paquete de diseño contiene artwork, no un consumer funcional. No se construyó Flutter ni se simuló PASS.

## Web

PASS para la superficie existente `/reports`: endpoint autoritativo, formato de minor units mediante BigInt, reload real, autorización y estados de error. Playwright confirmó página sin console errors, page errors, hydration errors ni respuestas 500.

## Defectos encontrados

1. Material: Web rotulaba como ingreso una suma operacional limitada a 5,000 registros y no filtrada por estados financieros finales.
2. Material detectado durante certificación: una primera agregación de cash variance podía multiplicar variance por cada ledger entry debido a un join.
3. No material: primera implementación de `date_trunc` interpoló el intervalo como identificador y produjo PostgreSQL 42703.

## Correcciones aplicadas

- Backend analítico read-only sobre fuentes Commerce certificadas.
- Web migrada al contrato autoritativo exacto.
- Ledger y session metrics de caja separados en CTEs, eliminando multiplicación de variance.
- Intervalo de series parametrizado correctamente.
- OpenAPI y SDK actualizados desde el contrato legítimo.
- Suites E2E, RLS y performance dirigidas.

## Capacidades no implementadas

Category analytics histórica; inventory rotation/aging/fast/slow; stock alert thresholds; average margin; exports; materialized views/read models; charts detalladas; widgets Web de cash/inventory/products; Flutter analytics. No se implementaron IA ni predicciones.

## Riesgos restantes

- Las consultas son on-demand; crecimiento muy superior al millón de movimientos puede exigir un read model futuro, manteniendo eventos/APIs y sin shared DB.
- Category analytics requiere snapshot histórico o evento público futuro; usar Product mutable no es aceptable.
- Collected y net revenue tienen semánticas distintas y deben conservar etiquetas explícitas en consumidores UMI futuros.

## Tests ejecutados

- Reports Analytics E2E: 10/10 PASS; 0 final FAIL, 0 SKIPPED, 0 BLOCKED; una repetición tras corregir el defecto 42703.
- RLS Analytics: 10 aserciones PASS. Cash RLS: 8/8 PASS.
- Concurrencia: 20 requests consistentes.
- Performance: 100k Sales y 1M movements, rollback PASS.
- Unit: API 31/31; Web 10/10; SDK 2/2; Worker 1/1; demás paquetes PASS.

Hubo dos fallos intermedios de lint (operador en Web y regex timezone) y un E2E inicial 500 por `date_trunc`; todos fueron corregidos y repetidos hasta PASS.

## Quality Gates

Format PASS; lint 29/29 PASS; typecheck 29/29 PASS; unit PASS; integration/E2E PASS; RLS PASS; performance PASS; OpenAPI PASS (145); SDK PASS; Web PASS; Docker build/deploy PASS; `pnpm check` PASS. API, Web, Worker, PostgreSQL, Redis, MinIO y OpenTelemetry healthy. Runtime API/Web/Worker usa usuario no privilegiado `nexo`. 47 migraciones aplicadas; no se creó ninguna migración.

## Evidencia

- `artifacts/certification/part-2b-reports-analytics/summary.json`
- `artifacts/certification/part-2b-reports-analytics/reconciliation.json`
- `artifacts/certification/part-2b-reports-analytics/performance.json`
- `artifacts/certification/part-2b-reports-analytics/rls.json`
- API image `sha256:ca1ce9cb1f9d8c3ebb30d5ae523adbcfa76cd526c332ad68abe68e6179c8aa91`
- Web image `sha256:760bb8d307d96ebfbd850d528380871f844c4a025ef2fedb0e073fd7813c4fc5`

## Archivos modificados

- `apps/api/src/app.module.ts`
- `apps/api/src/modules/analytics/*`
- `apps/web/src/app/reports/page.tsx`
- `packages/contracts/openapi/openapi.json`
- `packages/database/src/index.ts`
- `packages/sdk/src/generated/operations.ts`
- `tests/e2e/reports-analytics-certification.spec.ts`
- `tests/performance/analytics-volume.sql`
- `packages/database/tests/analytics-rls.integration.sql`
- evidencia y este documento.

## Veredicto Final del Dominio Reports & Analytics

PASS WITH OBSERVATIONS. Toda métrica anunciada y presentada concilia con Commerce con diferencia cero. Las capacidades ausentes están clasificadas y no generan cifras aproximadas ni falsas.

## Handoff a Product Certification Part 3A — Failure & Resilience

Part 3A puede asumir un overview analítico read-only, exacto, determinista, protegido por RBAC/ABAC/RLS y publicado en OpenAPI/SDK. Debe probar recuperación de consultas y disponibilidad, sin convertir Reporting en escritor, sin materialized view no certificada y sin iniciar category analytics desde modelos mutables. Part 3A no fue iniciada.

## NTFY

Inicio enviado. No hubo bloqueo material. Notificación final enviada con veredicto, métricas, performance, conteos y duración.
