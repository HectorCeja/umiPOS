# NEXO Product Certification Part 3B — Concurrency, Load, Performance & Capacity

## Veredicto

**PASS WITH OBSERVATIONS — Part 3B cerrada.**

El gate Docker pendiente fue corregido y certificado el 22 de julio de 2026. API, Migrate, Web y Worker construyen, despliegan y reinician desde imágenes de producción nuevas; las observaciones restantes se limitan al rendimiento I/O de builds fríos en este host y no afectan exactitud, seguridad ni reproducibilidad.

Las pruebas funcionales, de concurrencia, aislamiento, reconciliación, OpenAPI, SDK, Flutter y el gate `pnpm check` terminaron sin fallos materiales. Se corrigieron tres defectos reproducibles. El cierre formal no procede porque `docker compose build` no terminó PASS: la imagen `migrate` no pudo descargar el schema engine de Prisma desde la red aislada de BuildKit en dos intentos y el empaquetado final de API fue interrumpido después de presión extrema de I/O. El stack previamente desplegado permaneció healthy; esto no convierte el build nuevo en PASS.

## Executive Summary

- 100 solicitudes con la misma idempotency key convergieron en una Sale y un ID; payload divergente devolvió 409.
- 100 Sales con keys distintas produjeron 100 Sales, sin folios duplicados.
- Last-stock permitió exactamente 5 de 10 operaciones sobre 5 unidades.
- La regresión integrada final terminó 46/46 PASS; seguridad 3/3; Flutter 42/42.
- Payments terminales y Sales terminales conciliaron exactamente en 1,038,200 minor units.
- Refunds completados fueron 481,400, nunca superiores al pago capturado.
- 40 Receipts lógicos, cero duplicados; cero folios no nulos duplicados.
- Inventory Ledger y último snapshot tuvieron cero diferencias y cero tuples sin snapshot.
- Outbox saludable terminó en cero; 18 entradas en quarantine corresponden al baseline histórico/intencional y no se eliminaron.
- FORCE RLS/default-deny permanecieron activos; tenant leaks y branch bypasses: cero.
- No se observaron deadlocks ni locks permanentes.
- No se definen SLOs. El capacity envelope es evidencia del host probado, no garantía universal.

## Environment

Host local aislado: 12 CPUs lógicas, 15,929 MiB RAM, 109 GiB de filesystem y 17 GiB libres al inicio. Node 24.18.0, PostgreSQL 18.0, Docker 29.6.1, Flutter 3.44.6 y Dart 3.12.2. No se utilizó producción.

## Baseline

El baseline incluyó 266 Sales, 100 Sale Items, 84 Payments, 640 Inventory Movements, 507 Products, 39 tenants y 43 branches. PostgreSQL tenía 100 conexiones máximas, seis idle y cero deadlocks. Se separó warm-up de las muestras.

Latencia baseline, sin SLO: Health p50/p95/p99 75/87/87 ms; Product list 346/431/432 ms; Analytics 255/280/283 ms.

## Dataset

Se ejecutó en transacción un dataset de 100,000 Sales, 100,000 Sale Items y 1,000,000 Inventory Movements. Las inserciones tomaron 4,659 ms, 3,256 ms y 145,580 ms. La transacción se revirtió; los conteos finales no quedaron contaminados.

Los fixtures financieros persistentes de esta fase están etiquetados (`PART3B_*`). Se conservaron porque Sales, Payments, Receipts y ledgers certificados son append-only: eliminarlos para “limpiar” métricas habría violado la garantía histórica.

## Concurrency Controls

| Operación      | Control observado                                     | Restricción final             |
| -------------- | ----------------------------------------------------- | ----------------------------- |
| Create Sale    | advisory transaction lock por tenant/key, fingerprint | unique tenant/idempotency key |
| Sale mutation  | row lock, version, estados terminales                 | optimistic conflict           |
| Inventory      | serialización por filas, ledger append-only           | idempotency/relations         |
| Payment/Refund | Sale lock y acumulados                                | total nunca excedido          |
| Cash           | lock ordering, versions                               | source e idempotency únicas   |
| Receipt        | snapshot inmutable                                    | unique tenant/sale/version    |
| Folio          | secuencia servidor                                    | unique tenant/branch/folio    |

No se introdujeron locks globales ni se relajó RLS.

## Sales Concurrency

Antes de la corrección, 100 creates con la misma key podían competir por el unique index y algunas respuestas eran 500. Tras serializar sólo esa operación lógica: 100/100 respuestas 201, un único Sale ID, p50 851 ms, p95 972 ms, p99 976 ms y 100.94 req/s. El payload divergente devolvió 409 en 19 ms. Con 100 keys distintas: 100/100 Sales únicas, p50/p95/p99 877/1094/1109 ms y 89.18 req/s.

## Checkout Concurrency

Los E2E confirmaron una transición autoritativa, totals estables, ausencia de commit doble y rechazo de mutaciones terminales. Las operaciones update/remove de cart no existen como contratos generales independientes; se clasifican NOT IMPLEMENTED, no se simularon.

## Last-Stock Contention

Diez compradores sobre cinco unidades produjeron cinco ganadores y cinco rechazos determinísticos. Overselling, stock negativo, reservation doble y ledger mismatch fueron cero. El refund repuso exactamente una vez en las regresiones integradas.

## Inventory Concurrency

Reservations, release, expiration, transfer receipt, FIFO, raw-history guards y tenant scope pasaron. Estado global final: ON_HAND 819.5, RESERVED 5, IN_TRANSIT -45 como movimientos firmados. El último snapshot de cada tenant/variant/location coincide con las sumas del ledger: cero mismatches y cero tuples sin snapshot.

## Transfers & Counts

Uno de diez receives concurrentes ganó; no hubo recepción doble. Counts, transfer/cash crossed operations y optimistic versions conservaron historia. No se observó last-write-wins destructivo.

## Payments

Payments CAPTURED 609,000 y REFUNDED 429,200: total 1,038,200. Sales terminales sumaron exactamente 1,038,200. No hubo double charge lógico, saldo negativo, Payment huérfano, completion doble, Cash posting doble ni Receipt doble.

## Mixed Payments

Los flujos CASH + externo, parcial y refund mixto pasaron. Sólo la fracción CASH llega al Cash Ledger. No se afirmó provider settlement, que continúa fuera de alcance.

## Cash

Dieciséis escenarios concurrentes cubrieron open, suspend/resume, close/force-close, deposit, count/reconcile, transfer, approval y handoff. Todos tuvieron un solo ganador lógico. El cash net global (5,813,203) incluye movimientos manuales de certificaciones y por eso no se usa como igualdad contra sólo Sales; las conciliaciones por source pasaron.

## Refunds

Refunds COMPLETED: 481,400; REQUESTED no terminales: 116,000. El acumulado completado es menor que los 1,038,200 pagados. No hubo over-refund, over-return, compensation duplicada ni estado negativo.

## Receipts

40 Receipts lógicos, cero duplicados tenant/sale/version. Create/retry/reprint preservaron ID, folio, snapshot y hash. El audit dedicado de reprint continúa NOT IMPLEMENTED.

## Folios

Cero duplicados no nulos dentro de tenant/branch. Diez Sales independientes obtuvieron diez folios. Los gaps válidos por transacciones abortadas no se clasifican como corrupción.

## Multi-Tenant Concurrency

100 creates simultáneos en dos tenants terminaron en 1,444 ms (69.25 req/s): 50/50 por tenant, IDs y folios únicos. Ambos intentos cross-tenant devolvieron 403. Reuso de tenant context, writes cruzados y cache contamination: cero.

## Multi-Branch Concurrency

Inventory, Cash y Reports permanecieron branch-bound. Branch isolation continúa mediante ABAC y relaciones autoritativas, no branch-level RLS. No hubo branch spoofing ni movimientos aplicados a otra branch.

## Worker Concurrency

Configuración real: batch 50, polling 500 ms y lease 30 s. Esta fase observó 200 eventos con 200 intentos, cero efectos duplicados y cero pending saludables; máximo commit-to-publish 2.642 s (~75.69 events/s). La seguridad de múltiples workers se hereda y se regresó de Part 3A; backlog 1,000/10,000 es NOT TESTED en esta fase.

## Outbox Throughput

El backlog de 200 convergió a cero sin pérdida ni duplicación. Los 18 eventos quarantined se conservaron. Product/Inventory Outbox no se declara equivalente a Sales/Cash cuando sus garantías difieren.

## Analytics Concurrency

100 consultas simultáneas: 100 HTTP 200, un único body determinístico, p50/p95/p99 743/849/852 ms, 116.34 req/s. La diferencia contra SQL autoritativo fue cero.

## Read/Write Contention

Analytics concurrente no produjo dirty reads, cifras imposibles ni locks permanentes. Commerce continuó consistente durante lectura/escritura combinada.

## Database Locks & Deadlocks

Un lock controlado de ocho segundos exponía Prisma P2028 como 500 genérico. Tras la corrección devuelve 503 sanitizado y retryable en 7.65 s, sin mutación. Deadlocks acumulados finales: cero. “NOT OBSERVED” no significa imposibles.

## Connection Pool

No existe configuración explícita de max/timeout/lifetime en el adapter; se usan defaults. A 100 Analytics concurrentes se observaron ~20 backends y recuperación a seis idle; final tres conexiones. Deep pool exhaustion es NOT TESTED por seguridad del host.

## Rate Limiting

Los contratos 429 y seguridad se regresaron. El spike de 250 reads no alcanzó 429. No se afirma un umbral de rate limit no demostrado ni jitter/circuit breaker inexistentes.

## Web

Reports, Receipt y failure behavior pasaron; double-submit no creó duplicados. No hubo false success, hydration errors o retry storm en evidencia final. Las pruebas intermedias que se ejecutaron en paralelo con un suite que detenía API fueron inválidas por interferencia del harness; la repetición secuencial terminó 9/9 PASS.

## Flutter

`flutter analyze` PASS y 42/42 tests PASS con API Docker real. La primera invocación tenía un `LD_LIBRARY_PATH` incorrecto y produjo ocho fallos de SQLite del harness; con el runtime correcto no se reprodujeron. Idempotency, recovery, logout/login isolation y fail-closed financiero permanecen certificados. Tres dispositivos físicos no fueron probados; se usaron clientes de test independientes.

## Latency

No existen SLOs formales. Bajo 100 Analytics p95 fue 849 ms; 100 Sales únicas p95 1,094 ms. El spike de 250 Product reads alcanzó p95 3,346 ms sin 5xx/timeout. Después de retirar carga, Health fue p50/p95/p99 108/131/132 ms.

## Throughput

Resultados del host: Health 339.11 req/s; Products baseline 69.06; Analytics 105.37 y 116.34 a concurrency 100; Sale same-key 100.94; Sale unique-key 89.18; multi-tenant Sales 69.25; Outbox ~75.69 events/s. Son mediciones, no promesas comerciales.

## Stress

Una ventana de 10 minutos quedó contaminada por un failure suite que reinició API y rotó credenciales: 1,189 HTTP 200, 939 HTTP 401 y 124 network errors. Se conserva como evidencia de exposición a failure, pero no se usa para capacity planning.

## Spike

250 Product reads: 250 HTTP 200, p50/p95/p99 2,544/3,346/3,413 ms, 72.8 req/s, cero 5xx y recuperación automática.

## Soak

Soak limpio de 20 minutos: 4,416 requests; 3,312 HTTP 200 y 1,104 HTTP 403 esperados para una ruta no autorizada al principal ReadOnly; cero 5xx, timeouts o network errors. p50/p95/p99 34/54/66 ms. La memoria API pasó de 262 a 279.4 MiB, alcanzó 281.4 y descendió: no se reprodujo leak material. Una prueba de 20 minutos no demuestra ausencia absoluta de leaks.

## Memory Stability

Peak API durante spike: 551.6 MiB. Después del restart/load: 199, 250, 138 y 137 MiB. Sin retención monotónica reproducida. OOM físico es NOT TESTED.

## CPU Stability

No hubo busy loop ni CPU residual desproporcionada. CPU final API/PG/Worker 0.13/0.57/0.61%. Saturación física profunda es NOT TESTED.

## Query Plans & Indexes

Con rol runtime y RLS: Sales list 0.282 ms; Sale item 0.186; Inventory aggregate 0.415; Outbox claim 0.033; Refund list 0.044. En 100k/1M, agregados 145.864/126.059 ms; el Sales hash aggregate usó 3,416 KiB temporales. No se agregó ningún índice porque no se demostró un defecto material.

## Capacity Envelope

| Zona                  | Evidencia                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| Normal observada      | hasta 100 requests concurrentes en operaciones críticas, consistentes                              |
| Degradada pero segura | spike 250 reads, p95 3.346 s, cero errores técnicos                                                |
| Insegura/no probada   | 500 writes, pool exhaustion profundo, OOM, CPU profunda, disk-full, packet loss físico, 10k Outbox |

Este envelope sólo aplica al hardware, dataset y topología descritos. Cambian con hardware, red, DB, distribución tenant, providers, broker e integración futura UMI.

## Bottlenecks

1. Docker/overlay I/O durante `pnpm deploy`: material para tiempo de build, prioridad alta.
2. Red aislada BuildKit → Prisma binaries: bloquea `migrate`, prioridad alta.
3. Product reads a 250 concurrentes: p95 3.346 s, prioridad media.
4. Pool sin política explícita: riesgo operacional, prioridad media.

## Security

Security lifecycle 3/3 PASS; cross-tenant leaks, branch bypass, actor spoofing, secrets expuestos y cache contamination: cero. No se relajó seguridad por throughput.

## RLS

Core RLS, Cash RLS (8 assertions) y Analytics RLS (10 assertions) PASS. FORCE RLS/default-deny permanecen activos. No se usó superuser como evidencia de aislamiento.

## OpenAPI

PASS: 145 operaciones reales, operation IDs únicos y contrato validado. No se agregaron endpoints de benchmark, SLOs ni funcionalidades ausentes.

## SDK

Generation, drift, typecheck, 2/2 tests y build PASS. No se agregaron retries financieros automáticos.

## Docker

**PASS WITH OBSERVATIONS.** El cierre dirigido convirtió Migrate en una imagen multi-stage no-root, redujo su tamaño de 463.8 MB a 160.5 MB, excluyó el Prisma Client generado por el host y lo genera dentro de API/Worker/Migrate. Los cuatro targets construyeron con exit 0; el rebuild incremental completo tomó 1 s. El build frío continúa limitado por el I/O del host.

## Data Consistency

Vector final nuevo: Sales 445; Sale amount 1,038,200; Payment amount 1,038,200; completed refunds 481,400; receipts 40; Inventory mismatches 0; healthy outbox pending 0; quarantine 18; tenant leaks 0; branch leaks 0; duplicate effects 0; duplicate folios 0; deadlocks 0.

## Defectos encontrados

1. **Alta:** concurrent Create Sale podía emitir 500 transitorio por carrera del unique idempotency record.
2. **Media:** lock timeout Prisma P2028 se exponía como 500 genérico.
3. **Alta:** Analytics filtraba Payment status inexistente `COMPLETED`, mostrando collected revenue cero.

## Correcciones aplicadas

1. Advisory transaction lock tenant/key antes del replay/create; regresión de 100 solicitudes.
2. P2028 se clasifica como 503 dependency unavailable, sanitizado; test unitario y lock probe.
3. Analytics usa estados autoritativos CAPTURED/REFUNDED y el E2E compara contra SQL independiente.

## Capacidades no implementadas

SLOs; broker externo; DLQ independiente; circuit breaker; jitter; alertas automáticas; replay público de quarantine; reprint audit dedicado; ejecución financiera offline; integración runtime UMI × NEXO.

## Riesgos restantes

- Build Docker depende de acceso a Prisma binaries y es sensible al I/O del host.
- Pool DB sin límites explícitos documentados.
- 500 writes, 10k Outbox, pool exhaustion profundo y hardware diferente no probados.
- Soak de 20 minutos no descarta leaks de muy largo plazo.
- Capacity envelope no incluye providers externos ni UMI runtime.

## Tests ejecutados

- Regresión integrada final: 46/46 PASS.
- Security lifecycle: 3/3 PASS.
- Flutter: 42/42 PASS y analyze PASS.
- API unit: 40/40 PASS; SDK 2/2.
- RLS core/Cash/Analytics PASS.
- 100 same-key Sales, 100 unique Sales, multi-tenant 100, last-stock, Analytics 100, spike 250, soak 20 min.
- Volume transaction 100k Sales/Items y 1M movements, ROLLBACK.

## Quality Gates

| Gate                                                                     | Resultado  |
| ------------------------------------------------------------------------ | ---------- |
| format/lint/typecheck/unit/build (`pnpm check`)                          | PASS       |
| concurrency/idempotency/last-stock/payment/refund/receipt/inventory/cash | PASS       |
| multi-tenant/multi-branch/security/RLS                                   | PASS       |
| OpenAPI 145                                                              | PASS       |
| SDK                                                                      | PASS       |
| Flutter                                                                  | PASS       |
| Web                                                                      | PASS       |
| Docker production build                                                  | PASS       |
| Deep OOM/CPU/disk-full/packet loss                                       | NOT TESTED |

## Evidencia

Evidencia sanitizada en `artifacts/certification/part-3b-concurrency-performance`. No contiene passwords, tokens, cookies, DSNs completos ni PII innecesaria.

## Documentación

Este documento y los JSON estructurados constituyen el handoff. La estrategia UMI × NEXO no se modificó.

## Archivos modificados

Producto: repository de Sales, problem-details filter/tests, Analytics service y Analytics E2E. Harness: cuatro scripts `part-3b-*`. Documentación/evidencia: este reporte y el directorio Part 3B. El workspace carece de baseline Git tracked utilizable; no se presenta un diff inventado.

## Veredicto Final de Concurrency & Performance

La plataforma demostró consistencia bajo la carga ejecutada y el cierre Docker terminó con cero fallos materiales. Part 3B queda **PASS WITH OBSERVATIONS**.

## Handoff a Final Ecosystem Certification

Puede asumirse certificado, dentro del entorno medido: idempotency bajo 100 solicitudes, last-stock, Payments/Cash/Refunds/Receipts, Inventory/folios, aislamiento tenant/branch, Outbox 200, Analytics 100, ausencia de deadlock permanente observado, recuperación del pool observada, Flutter/Web, seguridad y RLS.

Puede asumirse el cierre formal de Part 3B y puede iniciarse Final Ecosystem Certification. No pueden asumirse SLOs, producción universal, otro hardware, 500 writes, 10k Outbox, OOM, CPU profunda, disk-full, packet loss físico, pool exhaustion profundo, broker/DLQ, circuit breaker, jitter, alertas ni UMI runtime.

## Docker Production Build & Deployment Closure

### Initial Blocker

El primer build sufrió un fallo de descarga del engine Prisma desde BuildKit y contención extrema al ejecutar `pnpm deploy` de API y Worker en paralelo.

### Root Cause

El trigger de red fue transitorio. Los defectos controlables eran una imagen Migrate single-stage de 463.8 MB, dependencia del Prisma Client generado en el host e invalidación/cache e I/O concurrente en el flujo local.

### Correcciones

- Migrate multi-stage, sólo `@nexo/database`, runtime no-root.
- Prisma Client generado dentro de API, Worker y Migrate.
- `packages/database/src/generated` excluido del contexto.
- Setup/rebuild local construye targets secuencialmente.

### Build and Deployment Evidence

- Build final: cuatro targets PASS; 614 s en frío sobre el host I/O-bound.
- Rebuild incremental: cuatro targets PASS en 1 s.
- Tamaños: API 170.9 MB; Migrate 160.5 MB; Worker 156.5 MB; Web 64.3 MB.
- Deployment nuevo: ready en 24 s; Migrate exit 0; 47 migraciones, sin drift.
- Smoke: Playwright 16/16, Flutter real API 42/42, RLS y OpenAPI PASS.
- Restart: 15 s; 509 Sales, 48 Receipts y 47 migraciones preservadas.
- Runtime downloads, source bind mounts, caches de package manager y usuarios root: cero.

### Final Part 3B Verdict

**PASS WITH OBSERVATIONS.** Final Ecosystem Certification queda autorizada.

## NTFY

- Start: POST 200, ID `6PPguJGsPirU`, topic `nxoumipos`.
- Blocker: POST 200, ID `PzdXJKiCjUwO`, topic `nxoumipos`.
- Final: POST 200, ID `Z559e92LU2PA`, topic `nxoumipos`, duración `1h19m`.
- Subscriber delivery: UNVERIFIED; HTTP 200 demuestra publicación, no recepción en dispositivo.
