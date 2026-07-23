# Blueprint de arquitectura

## Resumen ejecutivo

Se adopta un **monolito modular con procesos auxiliares**, API-first y orientado a eventos internos. Un frontend web/PWA Next.js consume un backend NestJS; PostgreSQL es sistema de registro, Redis una optimización/coordinar temporal, almacenamiento de objetos conserva artefactos y una cola ejecuta trabajo asíncrono. El despliegue inicial puede escalar réplicas sin convertir prematuramente cada módulo en servicio.

El backend es la única autoridad de reglas, permisos, tenant, importes y estados. El frontend optimiza interacción y continuidad, pero sus decisiones se revalidan al sincronizar.

## Contexto y contenedores

| Contenedor                    | Responsabilidad                                                     | No debe hacer                                  |
| ----------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| Web/PWA                       | interfaz, cache de shell/catálogo acotado, cola offline, impresión  | decidir autorización o totales finales         |
| API modular                   | casos de uso síncronos, transacciones, políticas, contratos         | trabajo pesado dentro de petición              |
| Worker                        | outbox, reportes, exportaciones, notificaciones, reintentos         | inventar contexto tenant o saltar políticas    |
| PostgreSQL                    | registro transaccional, constraints, RLS, outbox/auditoría          | ser accedido directamente por UI/integraciones |
| Redis                         | rate limit, locks breves, cache con namespace, colas según producto | ser fuente de verdad financiera                |
| Object storage                | exportaciones/recibos/adjuntos con claves tenant y URL temporal     | exposición pública por defecto                 |
| Proveedor de identidad/correo | verificación y entrega; adaptador sustituible                       | recibir más datos de los necesarios            |
| Observabilidad                | recibir OTLP/logs/métricas y alertar                                | convertirse en repositorio de PII              |

## Selección tecnológica

### Frontend: React + Next.js App Router + TypeScript

Seleccionado por ecosistema, renderizado híbrido, layouts, división cliente/servidor, localización y ruta PWA. Una SPA Vite sería más simple para POS puro y un framework nativo mejoraría dispositivos, pero NEXO necesita onboarding, administración, rutas autenticadas y futura superficie pública en una base web. Las capacidades dinámicas con datos de tenant **no se cachean públicamente**; el cache multi-instancia debe coordinarse o desactivarse para contenido sensible.

### Backend: NestJS + TypeScript

Seleccionado por módulos explícitos, inyección, validación y ecosistema Node coherente. Fastify directo ofrece menor abstracción y Go mayor eficiencia, pero NestJS reduce variación organizativa en un dominio grande. Se usará adaptador HTTP de alto rendimiento si las pruebas lo justifican. El framework no define el dominio: casos de uso y modelos permanecen aislados.

### Datos: PostgreSQL

Seleccionado por transacciones, constraints, índices, JSONB limitado, particionado y Row-Level Security. Una base documental facilita esquemas variables, pero compromete invariantes y reporting; base por tenant maximiza aislamiento pero encarece operación temprana. Redis no almacena estado definitivo.

### Forma de despliegue

Contenedores administrados y PostgreSQL/Redis/objetos administrados, IaC y proveedor desacoplado. Kubernetes no es requisito inicial: una plataforma de contenedores administrada reduce carga. Se evalúa cuando escala, aislamiento o topología lo exijan. No se fija nube hasta comparar región mexicana/latencia, DPA, cifrado/KMS, backups, egress, observabilidad y coste.

## Capas y reglas de dependencia

Cada módulo contiene: `domain` (entidades, valores, políticas, eventos), `application` (casos de uso/puertos), `infrastructure` (persistencia/adaptadores) e `interface` (HTTP/eventos). Dependencia sólo hacia dentro. Comunicación síncrona entre módulos mediante puertos públicos para decisión inmediata; eventos para efectos posteriores. Prohibido importar repositorios/tablas internos de otro módulo.

La API externa usa REST JSON inicialmente por comprensión y tooling. OpenAPI es contrato; errores siguen Problem Details (RFC 9457), fechas ISO 8601, IDs opacos, paginación cursor para conjuntos mutables y versión mayor en ruta/cabecera definida. GraphQL añade flexibilidad pero complejiza autorización/coste/cache y no se elige para MVP.

## Patrones de consistencia

- Una venta completa, sus pagos registrados, movimientos de inventario y efecto esperado de caja se confirman en una transacción local.
- Outbox se inserta en esa transacción; worker publica efectos al menos una vez. Consumidores son idempotentes e inbox/deduplicación se usa cuando el impacto lo requiere.
- No se promete “exactly once” de transporte; se garantiza **efecto de negocio único** por constraint, clave idempotente y estado.
- Reportes operativos leen proyecciones reconstruibles con marca de actualización; totales conciliables derivan del libro transaccional.
- Optimistic locking/version evita actualización perdida; reservas usan constraint/lock transaccional apropiado.

## Multi-tenant

### Modelo seleccionado: pool compartido con discriminador + RLS

Organización es tenant. Toda fila tenant-owned contiene `tenant_id NOT NULL`; claves únicas incluyen tenant, índices comienzan por tenant cuando sea selectivo, y referencias compuestas impiden enlazar recursos de otro tenant. El contexto se deriva de sesión verificada + membresía, nunca de un header confiado. PostgreSQL RLS es defensa en profundidad con **default deny**; el rol de aplicación no posee `BYPASSRLS` ni tablas. Jobs fijan contexto firmado/verificado por mensaje.

Comparación:

| Opción              | Ventaja                                      | Coste/riesgo                        | Decisión                    |
| ------------------- | -------------------------------------------- | ----------------------------------- | --------------------------- |
| BD compartida + RLS | eficiencia, migraciones y analítica operable | blast radius; disciplina extrema    | MVP/escala inicial          |
| esquema por tenant  | separación lógica                            | migraciones/pool/catálogo complejos | no ahora                    |
| BD por tenant       | mayor aislamiento/restauración selectiva     | coste y operación altos             | tier futuro regulado/grande |

La capa de acceso exige tenant incluso con RLS; cache, rate limit, objetos, colas, métricas y búsqueda incluyen namespace tenant. Soporte interno no tiene acceso implícito: flujo just-in-time, motivo, aprobación para alto riesgo, expiración y auditoría. Se ensaya exportación y offboarding. La estrategia permite “silo” futuro mediante router de tenant y puertos de repositorio.

## Internacionalización y fiscalidad

- `country`, locale BCP 47, moneda ISO 4217, zona IANA y calendario/semana son configuración versionada por organización/sucursal.
- Una venta tiene una moneda; conversiones futuras son transacciones explícitas con tasa/fuente.
- Motor de precios/impuestos recibe reglas efectivas por jurisdicción/fecha y produce breakdown + versión; una venta guarda snapshot, escala y modo incluido/excluido.
- Dinero es cantidad decimal o unidades menores según moneda y precisión; reglas de redondeo son explícitas por línea/documento.
- UI usa ICU/CLDR; el backend no persiste texto formateado como dato canónico.
- CFDI se implementará como bounded context/adaptador fiscal: venta comercial no cambia de identidad si SAT/PAC está caído. Certificados se guardan en vault/KMS, no en BD plana.

## Estrategia offline

PWA con service worker cachea sólo shell con hash y datos operativos permitidos. IndexedDB contiene catálogo mínimo, configuración firmada/versionada y cola cifrada con clave ligada al dispositivo/sesión cuando la plataforma lo permita. No se cachean páginas HTML personalizadas en CDN ni secretos reutilizables.

### Protocolo conceptual

1. El dispositivo online se registra, recibe capacidad offline, TTL, límites y último cursor.
2. Cada operación genera ID opaco, idempotency key, versión de catálogo/impuestos y hora local/servidor conocida.
3. La venta se marca **pendiente**, nunca “confirmada en servidor”. Se imprime recibo provisional claramente identificado si política lo permite.
4. Al volver, se envía en orden causal; servidor autentica, autoriza, recalcula/valida tolerancias y deduplica.
5. Resultado: confirmada, rechazada o requiere resolución. No hay last-write-wins para dinero/stock/caja.

Stock offline es informativo. Se limita importe, antigüedad, número pendiente y métodos admitidos; sin efectivo abierto o configuración vencida se bloquea. Logout/revocación impide nueva operación; los pendientes conservan flujo seguro de recuperación. Service worker se actualiza con estrategia compatible y rollback.

## Integraciones

Puertos: identidad, correo/mensajería, PAC fiscal, pagos externos, almacenamiento, webhooks y analítica. Adaptadores tienen timeout, circuit breaker, idempotencia, health y contrato. Credenciales se aíslan por ambiente/tenant cuando corresponda. Webhooks futuros se firman, incluyen timestamp/event ID, rotación, replay protection, entrega al menos una vez y DLQ observable.

## Escalamiento y evolución

Primero optimizar índices, paginación, cache medida, workers y réplicas de lectura para reporting tolerante. Particionar libros por tiempo/tenant sólo tras métricas. Candidato a extracción debe poseer alta cohesión, contrato estable, necesidad de escala/aislamiento distinta y equipo owner; posibles: notificaciones, reporting/exportaciones y fiscal. Venta, inventario y caja permanecen juntos mientras requieran transacción fuerte.

## Riesgos arquitectónicos

| Riesgo               | Mitigación                                       | Señal de revisión                           |
| -------------------- | ------------------------------------------------ | ------------------------------------------- |
| fuga cross-tenant    | doble filtro+RLS, constraints, pruebas y alertas | cualquier acceso denegado anómalo/incidente |
| amplitud multigiro   | capacidades y lenguaje ubicuo común              | >20% reglas condicionales por giro          |
| complejidad offline  | límites y recibo provisional                     | conflictos >0.5% ventas offline             |
| reportes afectan POS | proyección/worker y presupuestos                 | p95 o locks exceden SLO                     |
| monolito acoplado    | fitness tests y ownership                        | ciclos/deploy bloqueado por módulo          |
