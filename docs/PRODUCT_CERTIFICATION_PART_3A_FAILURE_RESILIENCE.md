# NEXO Product Certification Part 3A — Failure, Degradation & Platform Resilience

## Executive Summary

**Veredicto: PASS WITH OBSERVATIONS.** Se inyectaron fallos reales y controlados en API, Worker, PostgreSQL, Redis, MinIO, OpenTelemetry, Web, Flutter y el despliegue Docker. Los siete defectos reproducibles encontrados fueron corregidos y cubiertos por regresión. El estado final tiene cero fallos materiales, cero dobles efectos, cero pérdidas confirmadas y cero filtraciones entre tenants. Las condiciones físicas no reproducidas se declaran `NOT TESTED`; las capacidades inexistentes se declaran `NOT IMPLEMENTED`.

## Architecture Scope

Se respetó la estrategia UMI × NEXO. NEXO continúa siendo el Commerce Execution Plane. No se creó base compartida, dual-write, sincronización bidireccional, bounded context nuevo ni integración runtime con UMI.

## Baseline

API, Web, Worker, PostgreSQL, Redis, MinIO y Collector estaban healthy. Se comprobaron 47 migraciones, 10 conexiones iniciales y usuarios no privilegiados `nexo` para API/Web/Worker. Había 15 eventos Sales heredados en quarantine, todos caracterizados; no eran backlog procesable. Cash, Product e Inventory iniciaron sin pendientes.

## API Failure

Se probó SIGTERM, restart y 100 requests duplicados con reinicio. Antes de la corrección, SIGTERM excedía 10 s y Docker terminaba el proceso; después, API sale limpiamente en 354 ms, marca readiness false antes de cerrar y conserva idempotencia. La regresión de 100 duplicados produjo una operación lógica.

## Worker Failure

Se inyectó salida 86 después de claim y después de publish antes de acknowledge. El lease de 30 s recuperó el claim y `ON CONFLICT DO NOTHING` evitó entregas duplicadas. Se ejecutaron uno, dos y tres workers; Commerce closure pasó bajo tres workers. Shutdown limpio: 266 ms.

Sales/Cash poseen lease, cuarentena y límite de 10 intentos. Product/Inventory usan outboxes más simples; no se declara equivalencia. El estado final fue Sales pending 0, Sales quarantine 17 (15 heredados y 2 probes intencionales), Cash pending/quarantine 0.

## PostgreSQL Failure

Con PostgreSQL detenido: liveness 200, readiness 503 en 3.001 s. Tras restart, el conteo de Sales se conservó y Prisma reconectó. RLS siguió habilitado y forzado. No se observó commit parcial, fallback sin tenant ni reutilización de contexto.

## Redis Failure

Redis es crítico para autenticación, sesión y rate limiting, pero no autoridad financiera. Se corrigió readiness colgada por más de 8 s mediante timeouts y retries acotados. Resultado final: liveness 200, readiness 503 en 3.004 s, login 503 sanitizado en 1.284 s y recovery a 200. No hubo fail-open de autorización o rate limit.

## MinIO Failure

Se corrigió el acoplamiento que marcaba toda la plataforma no-ready. Con MinIO detenido, readiness es 200 `degraded`, Commerce/Analytics no relacionados continúan, y las rutas de Media fallan explícitamente. La metadata permanece `PENDING` hasta confirmar el objeto. Limpieza automática de multipart incompleto: `NOT IMPLEMENTED`.

## OpenTelemetry Failure

Collector detenido: liveness/readiness 200; 20 consultas Analytics pasaron en 363 ms y el negocio no se bloqueó. No hubo crash loop ni crecimiento observado. No existe garantía durable de traces ni alerta automática; la pérdida de telemetría durante outage es esperable.

## Network Partitions

Se probaron connection refused/reset equivalentes mediante parada de dependencias, timeouts acotados, API no disponible para Web/Flutter y OTLP inaccesible. DNS físico y pérdida de paquetes con `netem`: `NOT TESTED`. No hubo retry storm ni requests indefinidas.

## Startup Ordering

El stack arrancó desde detenido y convergió a healthy en 27.853 s. Readiness evitó recibir tráfico financiero antes de tener PostgreSQL/Redis. No se observó carrera de migraciones. OpenTelemetry tardío no impidió convergencia.

## Graceful Shutdown

API ahora usa un único manejador de señal, evita hooks duplicados, cierra conexiones y limita el flush de telemetría a 5 s. Worker elimina su heartbeat antes de salir. No hubo zombies, lease infinito ni lock permanente.

## Resource Exhaustion

Un body de 1.1 MB fue rechazado con 413 en 2.3 ms. De 14 logins inválidos, 10 devolvieron 401 y 4 fueron limitados con 429. Veinte reportes concurrentes y 100 requests duplicados convergieron. OOM físico, saturación CPU profunda y agotamiento completo del pool: `NOT TESTED` para evitar riesgo al host; pertenecen a Part 3B.

## Disk and Persistence

La recreación preservó PostgreSQL (133/133 Sales), Redis (2/2 keys) y los volúmenes declarados. MinIO tenía 0 objetos, por lo que solo se demostró persistencia del volumen, no de contenido. Un stop/up completo preservó 135/135 Sales. Disk-full y corrupción física: `NOT TESTED`.

## Health Readiness Liveness

`/health/live` representa proceso vivo. `/health/ready` requiere PostgreSQL y Redis; MinIO degradado se reporta sin bloquear rutas no relacionadas; OTEL es opcional. API Compose usa readiness. Worker usa heartbeat renovado solo después de un ciclo exitoso. Los thresholds Docker pueden dejar status healthy algunos segundos después de perder PostgreSQL: observación operacional, no false success del endpoint.

## Flutter Failure Behavior

Flutter 3.44.6/Dart 3.12.2: analyze PASS y 42/42 tests PASS. Se verificaron SQLite reopen/checkpoint, API real Docker, key idempotente estable, crash posterior a capture, receipt cache, bloqueo financiero offline, device revocation y aislamiento tras logout. El primer run falló por `libsqlite3.so` ausente en el host; se proveyó solo en `/tmp` y se repitió sin modificar el producto.

## Web Failure Behavior

El E2E detuvo realmente API durante reload. Se corrigieron el spinner infinito de bootstrap y promises `fetch` no manejadas. Ahora Web muestra un error recuperable, no pinta KPIs falsos, no produce page errors y recupera después de levantar API. Resultado final: 1/1 PASS.

## Security During Degradation

Default-deny, rate limit, CSRF, RBAC, branch ABAC y tenant context permanecieron activos. El scan final de logs no encontró los secretos/identificadores probe buscados. Respuestas 503 incluyen correlation id sin DSN, credenciales ni stack trace. Filtraciones y bypass finales: 0.

## Data Consistency

Vector nuevo y no reutilizado: Sale `c8ecbb47-a954-46b3-84ca-e1f4081f8c15`, estado `REFUNDED`, total/pago/refund 23200 minor units, cash net 0, un receipt, inventario final 3.000000, outbox pending 0, quarantine del escenario 0, contaminación cross-tenant 0. Commerce closure pasó antes y después de tres workers.

## Quarantine

La proyección pública sanitizada, permisos, tenant scoping, paginación y contadores pasaron 5/5. Quarantine no bloqueó eventos sanos. No existe replay público ni DLQ independiente (`NOT IMPLEMENTED`). La recuperación es manual y debe validar tenant, fingerprint, versión, causa y efectos antes de liberar/recrear el evento; nunca se deben borrar registros para limpiar contadores.

## Retry and Backoff

Sales/Cash: máximo 10 intentos y backoff exponencial hasta 300 s; no hay jitter. SDK/Web/Flutter no aplican retry financiero automático peligroso. 401/403 no se reintentan; 409 divergente exige intervención; la key financiera se conserva. Circuit breaker: `NOT IMPLEMENTED`.

## Docker Resilience

Las imágenes de producción construyeron. API/Web/Worker corren no-root, tienen healthchecks y `restart: unless-stopped`; PostgreSQL/Redis/MinIO tienen volúmenes. La recreación de dependencias convergió en 12.194 s; el stack frío, en 27.853 s. `docker kill` administrativo suprime restart por semántica Docker; un kill espontáneo del PID 1 desde host fue `NOT TESTED` por permisos.

## Configuration Failure

Nueve pruebas de configuración pasaron: obligatorias ausentes, URLs inválidas, secretos vacíos, ambientes desconocidos y configuración contradictoria fallan explícitamente sin mostrar secretos. CORS/CSRF no degradan a defaults inseguros. La configuración original quedó restaurada.

## Observability

Persisten logs locales, request/correlation IDs y categorías de fallo. El scan de redacción pasó. Hay health signals y logs de API/Worker/Outbox; no existen métricas específicas completas para retry/quarantine ni garantía de trace delivery. Los errores Redis generan eventos visibles y no tumban el proceso.

## Alertability

Los estados son detectables por health/logs, pero alertas automáticas para API/Worker/PG/Redis/MinIO, backlog, quarantine, alta latencia/error, restart y OTEL están `NOT IMPLEMENTED`. Un health endpoint no se contabilizó como alerta entregada.

## Performance During Degradation

Con OTEL down: 20/20 Analytics en 363 ms. Redis-down readiness: 3.004 s; PG-down: 3.001 s; API graceful stop: 354 ms; worker: 266 ms; recovery de volúmenes: 12.194 s. No hay SLO definido, por lo que se informa baseline/degradación sin inventar umbral de PASS.

## OpenAPI

145 operation IDs únicos: PASS. Se documentó el contrato transversal de 413/429/500/503, correlation/request id y la responsabilidad de conservar idempotency key. Compatibility 3.0.0: PASS. No se anunciaron replay, circuit breaker ni financiero offline.

## SDK

Generation, drift, tests (2/2), typecheck y build: PASS. El SDK no introduce retry financiero automático. Abort/retry de transporte queda en el consumidor; los errores HTTP permanecen tipados por el contrato público.

## Defectos encontrados

1. Readiness Redis podía colgar >8 s.
2. Login Redis-down devolvía 500 genérico.
3. MinIO opcional bloqueaba readiness global.
4. API healthcheck usaba liveness y Worker solo verificaba PID.
5. API no completaba SIGTERM dentro del plazo Docker.
6. Web quedaba en spinner infinito y emitía fetch no manejado con API caída.
7. Analytics excluía refunds `COMPLETED` después del procesamiento Worker.

## Correcciones aplicadas

Se agregaron timeouts y reconnect acotado; 503 sanitizado para dependencia; semántica degraded de MinIO; readiness real y heartbeat Worker; shutdown único/acotado; estados Web explícitos; y Analytics considera `APPROVED`/`COMPLETED`. Cada defecto fue reinyectado y regresado.

## Capacidades no implementadas

Broker durable externo, DLQ independiente, replay público de quarantine, circuit breaker, jitter de retry, alerta automática, limpieza multipart, financiero offline e integración runtime UMI × NEXO.

## Riesgos restantes

La entrega es al menos una vez internamente y depende de idempotencia, no de broker durable; quarantine requiere operación manual; falta alerting; Product/Inventory outboxes no equivalen a Sales/Cash; MinIO no tuvo objeto real para prueba de preservación; no se reprodujeron disk-full, corrupción, netem, OOM ni pool exhaustion profundo.

## Tests ejecutados

API unit 39/39; Reports E2E 10/10; Web failure E2E 1/1; Cash operations 5/5; Commerce closure dos runs PASS; Flutter 42/42 y analyze PASS; RLS general/Analytics/Cash PASS; OpenAPI/compatibility PASS; SDK PASS; Docker build/deployment PASS; `pnpm check` PASS.

## Quality Gates

Format, lint, typecheck, unit, integration dirigida, failure/recovery E2E, worker crash, API/PG/Redis/MinIO/OTEL failure, Flutter/Web failure, RLS SQL, OpenAPI, SDK, Docker y `pnpm check`: PASS. Fallos materiales finales: 0. Un comando intermedio usó el nombre inexistente `openapi:compatibility`; se corrigió a `pnpm --filter @nexo/contracts compatibility`, que pasó.

## Evidence

La evidencia reproducible y sanitizada se encuentra en `artifacts/certification/part-3a-failure-resilience/`. La matriz distingue PASS, PASS WITH OBSERVATION, NOT TESTED y NOT IMPLEMENTED.

## Archivos modificados

Se listan en `artifacts/certification/part-3a-failure-resilience/modified-files.json`. No se cambiaron ownership, modelos UMI, migraciones ni bounded contexts.

## Handoff a Product Certification Part 3B

Part 3B puede asumir certificados: fail-closed de API/Web/Flutter; recovery API/Worker/PostgreSQL; degradación Redis/MinIO/OTEL; idempotencia bajo restart; readiness/liveness corregidas; shutdown seguro; persistencia Docker; authorization/RLS durante recovery; consistencia Commerce/Analytics; OpenAPI/SDK.

No puede asumir: disk-full/corrupción física, packet loss `netem`, OOM/CPU/pool exhaustion profundo, restart espontáneo de PID 1, alertas automáticas, broker/DLQ durable, replay público, circuit breaker, jitter, limpieza multipart ni SLOs. Part 3B debe medir concurrencia y performance; no se inició aquí.
