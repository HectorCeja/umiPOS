# Convenciones de desarrollo y estrategia de calidad

## Principios de ingeniería

Código futuro en TypeScript estricto, simple y explícito; diseño por dominio, no por framework. Se optimiza para lectura, invariantes y diagnóstico. Una abstracción requiere repetición estable o frontera real. El repositorio será monorepo para compartir contratos/configuración y realizar cambios atómicos, sin compartir internals de módulos.

## Convenciones normativas

- Idioma del código, contratos, commits y ADR: inglés; producto/documentación de negocio puede ser español. Lenguaje ubicuo del glosario manda.
- Formato/lint/typecheck automáticos y versiones fijadas. Cero errores y cero warnings nuevos en rama principal.
- Nombres de dominio completos; booleanos como predicado; unidades en nombre/tipo (`timeoutMs`); fechas distinguen instant/business date/local input.
- No usar `any` sin excepción; entradas externas son `unknown` y se validan. Errores se modelan por categoría y no se ignoran.
- Dinero usa tipo/valor dedicado con moneda/escala; nunca `number` binario para cálculo. IDs tenant tipados conceptualmente para evitar mezcla.
- Configuración validada al arranque; secreto nunca tiene default. Feature flag posee owner, caducidad y comportamiento seguro.
- API design-first OpenAPI, compatibilidad aditiva dentro de versión, Problem Details y idempotencia documentada.
- Migraciones forward-only en producción, pequeñas, expand/contract, locks evaluados, backup/rollback lógico y backfill separado.
- Eventos en pasado, esquema/version, compatibilidad y datos mínimos. Consumidor idempotente.
- Logs estructurados por evento, no frases variables; prohibidos PII/secretos y `console` ad hoc.
- Commits pequeños y PR enlaza requisito/ADR/riesgo, incluye pruebas, docs, telemetría y plan de rollout/rollback.
- Dependencias nuevas justifican necesidad, mantenimiento, licencia, seguridad, tamaño y alternativa estándar.

## Definition of Ready

Problema/usuario/resultado claros; `RF/RNF/RA/RS` enlazados; estados/error/offline/accesibilidad definidos; datos, permisos, analytics y migración identificados; diseño probado si es flujo crítico; dependencias/riesgos y aceptación verificable.

## Definition of Done

Aceptación satisfecha; revisión; pruebas por riesgo; contratos/migraciones compatibles; accesibilidad manual/automática; amenaza/privacidad revisada; métricas/log/alerta y runbook cuando aplica; documentación/ADR actualizados; pipeline limpio; desplegado gradualmente y observado; sin deuda crítica oculta.

## Pirámide y portafolio de pruebas

| Nivel                  | Propósito                           | Ejemplos NEXO                                      | Ejecución            |
| ---------------------- | ----------------------------------- | -------------------------------------------------- | -------------------- |
| Unit/property          | reglas rápidas e invariantes        | dinero, impuestos, estados, devoluciones, permisos | cada cambio          |
| Component/module       | caso de uso + persistencia real     | completar venta, RLS, cierre, solapamiento         | cada PR              |
| Contract               | compatibilidad productor/consumidor | OpenAPI, eventos, PAC/PSP fake                     | PR y release         |
| Integration            | servicios reales efímeros           | PostgreSQL, Redis, cola, storage                   | PR                   |
| E2E                    | jornadas de mayor valor             | onboarding→venta→cierre; cita→venta                | PR selectivo/release |
| Exploratory/usability  | riesgos no guionados/comprensión    | presión, errores, giros, dispositivo               | sprint/release       |
| Security               | abuso técnico/negocio               | cross-tenant, IDOR, replay, CSV, sesión            | continuo/release     |
| Performance/resilience | SLO y degradación                   | pico ventas, lock, dependencia caída               | nightly/release      |
| Accessibility          | WCAG/AT                             | teclado, NVDA, VoiceOver, zoom                     | PR/release           |
| Restore/DR             | recuperabilidad real                | PITR, región, reconciliación                       | mensual/trimestral   |

## Estrategia detallada

### Datos y tenant

Tests usan PostgreSQL real y migraciones, no sólo mocks. Factories crean al menos tenant A/B y sucursal A1/A2; por cada endpoint/repository protegido existe caso ajeno. Se prueban constraints y RLS con el mismo rol de producción. Tests property-based generan redondeos, monedas, cantidades y secuencias de devolución. Reloj e IDs se inyectan/controlan.

### POS/offline

Model-based testing recorre estados; pruebas repiten/ordenan/retrasan peticiones, cierran pestaña, cambian red y actualizan service worker. Oráculo: una intención produce un solo efecto; cualquier conflicto es visible y reconciliable. Se prueban impresoras/escáneres representativos sin hacerlos prerequisito de navegador.

### Accesibilidad y UX

Lint y axe detectan sólo parte. QA manual recorre flujos críticos sin ratón, con lector, zoom 200/400%, contraste/tema, reducción de movimiento y targets táctiles. Investigación mide tarea con personas representativas. Todo defecto se asocia a criterio WCAG e impacto, no sólo score.

### Rendimiento

Datos con distribución realista y tenants grandes; medir p50/p75/p95/p99, throughput, errores y recursos. Budgets por query y Web Vitals (INP/LCP/CLS) en contexto real; regresión significativa bloquea. Load test incluye hot tenant y vecinos para aislamiento.

### Seguridad

Pruebas unitarias de políticas, integración negativa, SAST/SCA/secret/IaC/container, DAST autenticado y abuse cases. Pentest independiente antes de GA. QA no declara ASVS por escaneo: cada requisito conserva evidencia y revisión humana cuando exige diseño/operación.

## Ambientes y datos de prueba

Local y CI efímeros; integración persistente; staging equivalente sin PII real; producción. Datos sintéticos deterministas, nunca copia cruda de producción. Si diagnóstico requiere muestra, se anonimiza irreversiblemente con aprobación. Cuentas/secretos separados; flags no sustituyen equivalencia.

## Severidad y salida

S0 incidente activo/pérdida/fuga; S1 venta/acceso bloqueado o integridad; S2 función importante con workaround; S3 menor. S0/S1 y vulnerabilidad crítica/alta explotable bloquean. Flaky test se corrige o pone en cuarentena con owner/SLA de 48 h; no se reintenta para ocultar. Riesgo residual necesita owner, razón, compensación y expiración.

## Trazabilidad

Historia → RF/RNF/RA/RS → diseño/ADR → pruebas → build → despliegue → señal. La cobertura se reporta por requisito/riesgo, no sólo líneas. QA publica release report con cambios, evidencia, defectos, SLO esperado y recomendación go/no-go.
