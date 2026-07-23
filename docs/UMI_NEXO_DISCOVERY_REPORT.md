# UMI Platform Discovery & Consolidation Audit

**Fecha de corte:** 2026-07-21  
**Rol:** auditoría CTO externa, exclusivamente de descubrimiento  
**Estado del Quality Gate:** **BLOCKED**  
**Motivo:** el checkout/código fuente de UMI no está disponible en el filesystem inspeccionado. NEXO sí fue localizado y censado. No se atribuyó a UMI ningún código sin evidencia.

## Executive Summary

La auditoría confirma que NEXO es un monorepo operativo y amplio: contiene Web Admin, API NestJS/Fastify, worker, Flutter POS, dos Design Systems, PostgreSQL/Prisma con RLS, Redis, MinIO, Mailpit, OpenTelemetry, OpenAPI 3.1.1, SDK generado, CI/CD, pruebas unitarias, SQL, Playwright, Storybook y documentación arquitectónica extensa.

No existe un repositorio UMI localizable bajo `/home/hceja/Documents`, `/home/hceja/Desktop`, `/home/hceja/Downloads`, `/mnt` o `/media`, ni otro checkout Git identificable como UMI. Los cinco proyectos sueltos encontrados en `Desktop/STUFF` se identifican como APIs de `cvive` (`creditos`, `ingresos`, `pro`, `rh`, `uar`); sus manifiestos, READMEs y dominios no aportan evidencia de que sean UMI. Se excluyeron del comparativo.

Las referencias a UMI encontradas en NEXO describen una integración futura: UMI sería el shell/orquestador y NEXO una capability. Los puertos de Sales y Cash permanecen deshabilitados o conectados a sinks locales hasta recibir contratos definitivos de UMI. Por tanto, esas referencias son preparación de NEXO, no un inventario de UMI.

Conclusiones ejecutivas:

1. **No es posible decidir imparcialmente qué implementación UMI/NEXO es superior** sin el código de UMI. Toda celda comparativa de UMI queda `NO EVIDENCE`, no `NO EXISTE`.
2. **NEXO ya ofrece una plataforma transaccional sustancial** en Identity, Authorization, Control Plane, Product, Inventory, Sales, Cash y POS Flutter.
3. **NEXO debe preservarse como baseline de comparación**, no declararse automáticamente plataforma consolidada. Su arquitectura modular, contratos, RLS, outbox y pruebas tienen alto valor estratégico verificable.
4. **Customers, analytics avanzados, KDS, Customer Display, Scanner y Manager Companion no tienen una aplicación productiva demostrable en NEXO.** Algunos existen como referencias, flags o puertos futuros.
5. **Payroll no está implementado.** Existen puntos de anclaje reutilizables: User, Membership, Organization, Branch, roles, eventos, auditoría, notificaciones, OpenAPI y SDK.
6. **UMI Copilot no está implementado en NEXO.** No se encontraron dependencias o persistencia de RAG, embeddings, vector DB o LLM. La documentación NEXO sí puede constituir un corpus inicial, sujeto a gobierno y limpieza.
7. **Coverage:** NEXO disponible y censado; UMI no disponible. Cobertura por repositorios solicitados: `1/2 = 50%`. Cobertura del comparativo bilateral: `0%` demostrable. Cobertura estructural del checkout NEXO: `100%` de raíces y manifiestos censados, con inspección de autoridades de código por dominio.

## Alcance, método y límites

La auditoría fue read-only salvo este reporte. No se modificó código, arquitectura, APIs, dependencias ni documentación existente.

Método aplicado:

- búsqueda de checkouts, manifiestos y directorios UMI en ubicaciones locales y montajes comunes;
- censo de aplicaciones, paquetes, archivos fuente, esquemas, migraciones, rutas, contratos, tests, CI, infraestructura y documentación;
- lectura de autoridades reales: `package.json`, workspace, módulos API, rutas Web, Prisma, migraciones SQL, worker, Flutter, OpenAPI, SDK, Compose, workflows, ADRs y blueprints UMI;
- búsqueda transversal de clientes operativos, Payroll, RAG/LLM, eventos, observabilidad, feature flags y auditoría;
- clasificación conservadora: ausencia de evidencia nunca se convirtió en ausencia del producto externo.

No se ejecutaron tests funcionales porque la tarea solicitó discovery y comparación de código, no certificación. Los conteos de pruebas indican capacidad existente, no un PASS de runtime en esta ejecución.

## Repositorios localizados

| Candidato      | Ruta                                     | Identidad verificable                                        | Decisión       |
| -------------- | ---------------------------------------- | ------------------------------------------------------------ | -------------- |
| NEXO           | `/home/hceja/Documents/nexo`             | `package.json` name `nexo`, workspace `apps/*`, `packages/*` | Incluido       |
| UMI            | No localizado                            | Sin checkout, manifiesto o remote disponible                 | **Bloqueador** |
| api-cre        | `/home/hceja/Desktop/STUFF/api-cre-main` | `cvive-creditos-api`; dominio créditos                       | Excluido       |
| api-ing        | `/home/hceja/Desktop/STUFF/api-ing-main` | `cvive-ingresos-api`; dominio ingresos                       | Excluido       |
| api-pro/rh/uar | `/home/hceja/Desktop/STUFF/...`          | APIs `cvive`/genéricas, sin prueba UMI                       | Excluidos      |

## Inventario de UMI

**Clasificación:** `BLOCKED / NO EVIDENCE`.

No puede documentarse responsablemente la estructura, aplicaciones, packages, backend, frontend, Flutter, workers, infraestructura, base de datos, OpenAPI, SDK, testing, CI/CD, Design System, integraciones, eventos, feature flags, observabilidad o deployment de UMI.

Evidencia indirecta disponible exclusivamente desde NEXO:

- `docs/UmiExperienceIntegrationBlueprint.md`: UMI se conceptualiza como ecosystem shell; ninguna arquitectura se selecciona sin contratos UMI.
- `docs/UmiSalesIntegrationFoundation.md`: eventos públicos preliminares y `UmiSalesIntegrationPort`; sink local/deshabilitado; wallet y estructura UMI bloqueados por documentación externa.
- `docs/UmiCashIntegrationFoundation.md`: eventos Cash allowlisted; puerto deshabilitado/local hasta recibir contratos definitivos.
- ADR-0037 y ADR-0041: proyecciones públicas versionadas y minimizadas; no prueban implementación UMI.

Estos archivos no permiten derivar módulos, madurez ni calidad interna de UMI.

## Inventario de NEXO

### Censo

| Área                              |                                                           Resultado |
| --------------------------------- | ------------------------------------------------------------------: |
| Aplicaciones                      |                              4 (`api`, `web`, `worker`, `nexo_pos`) |
| Paquetes workspace                |                                                                  15 |
| Modelos Prisma                    |                                                                  61 |
| Enums Prisma                      |                                                                  27 |
| Migraciones                       |                                                                  39 |
| OpenAPI                           |                                                3.1.1, versión 8.9.0 |
| Paths / operaciones OpenAPI       |                                                           125 / 144 |
| Specs E2E Playwright              |                                                                 288 |
| Tests unitarios TS/TSX            |                                                                  32 |
| Documentos                        |                                                                 494 |
| Archivos censados sin builds/deps | apps 382; packages 351; tests 337; scripts 24; infra 7; workflows 5 |

### Aplicaciones

| Aplicación      | Tecnología               | Responsabilidad verificable                                                                                              |
| --------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `apps/api`      | NestJS 11, Fastify 5     | HTTP API, validación, auth, autorización, persistencia, MinIO, correo, OpenAPI                                           |
| `apps/web`      | Next.js 16, React 19     | Web Admin: login, onboarding, dashboard, productos, inventario, caja, ventas, equipo/configuración/perfil/reportes/ayuda |
| `apps/worker`   | TypeScript, Prisma, Pino | expiraciones, outboxes Product/Inventory/Sales/Cash/device, retry/quarantine y sinks locales                             |
| `apps/nexo_pos` | Flutter 3.44             | POS nativo: bootstrap, catálogo, carrito, checkout, caja, offline controlado, seguridad, impresión, recovery, enrollment |

### Paquetes y bounded contexts

| Paquete                   | Función                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `@nexo/identity`          | tipos, políticas y servicios puros de identidad/autenticación                                |
| `@nexo/authorization`     | motor RBAC/ABAC puro, scopes, decisiones y razones                                           |
| `@nexo/control-plane`     | Organization, Branch, Membership, onboarding, invitaciones y features                        |
| `@nexo/product`           | modelo de Product, variantes, precios, códigos, estados y búsqueda                           |
| `@nexo/inventory`         | ledger, disponibilidad, reservas, transferencias, conteos y políticas                        |
| `@nexo/sales`             | aggregate Sale, checkout, pagos, recibos, refunds, idempotencia y eventos                    |
| `@nexo/cash`              | registers, drawers, sessions, ledger, counts, approvals, deposits, transfers, reconciliation |
| `@nexo/database`          | Prisma client, schema, migraciones, seed y SQL/RLS tests                                     |
| `@nexo/contracts`         | OpenAPI canónico, validación y compatibilidad                                                |
| `@nexo/sdk`               | cliente/manifest generado desde OpenAPI y drift check                                        |
| `@nexo/ui`                | Design System Web, primitives, NexoSelect, feedback, data, admin, cash, sales, Storybook     |
| `@nexo/flutter-design`    | tokens, componentes, artwork, layouts, accesibilidad y goldens Flutter                       |
| `@nexo/observability`     | OpenTelemetry Node SDK y helper de spans                                                     |
| `@nexo/config`            | configuración validada con Zod                                                               |
| `@nexo/typescript-config` | configuración TypeScript compartida                                                          |

### Dominios API reales

- Authentication/Identity: login, refresh, logout, logout-all, reset, verificación, identity, sessions y devices.
- Authorization: context, roles, permissions, feature flags, memberships y evaluate.
- Control Plane: organizations, branches, onboarding, templates, features, invitations y memberships.
- Product: CRUD/lifecycle, variants, categories, barcodes, prices y media.
- Inventory: locations, movement, availability, timeline, reservation, transfer, count y policy.
- Sales: aggregate, items, checkout, payments, completion, suspend/resume/cancel, receipts, refunds, policies, mappings y administración.
- Cash: registers, drawers, sessions, movements, counts, reconciliation, closure, approvals, deposits, transfers, policies y read models.
- Device: enrollment, consume, current device, heartbeat, listing, revocation, status y credential rotation.

### Persistencia

PostgreSQL es la autoridad. Prisma modela 61 entidades; migraciones SQL aportan roles y RLS. Las entidades principales incluyen Organization, Branch, Membership, User, Session, RefreshToken, SecurityEvent, Product/Variant/Category/Media, Inventory ledger/snapshot/reservation/transfer, Sales/payment/receipt/refund, POS devices y Cash tables creadas en SQL.

El patrón tenant usa `tenant_id`, claves/índices compuestos, `ENABLE/FORCE ROW LEVEL SECURITY`, contexto `app.current_tenant_id()` y roles separados (`migration`, `runtime`, `worker`, `readonly`).

### Eventos, jobs e integraciones

- Outboxes separados para Product, Inventory, Sales, Cash y devices.
- Worker con expiración de reservas y ventas suspendidas, publicación at-least-once, claims, retry y quarantine.
- UMI sólo recibe proyecciones públicas allowlisted mediante puertos/sinks no productivos.
- Redis soporta coordinación/rate limiting; MinIO media privada; Mailpit correo local.

### Design System y assets

- Web: `@nexo/ui`, Storybook, tokens, primitives, NexoSelect, iconografía, artwork, feedback, patrones admin/POS.
- Flutter: paquete separado con paridad semántica, no reutilización forzada de widgets Web.
- Assets en Web cinematic/brand y Flutter artwork/fonts.

### Testing y CI/CD

- Vitest por aplicación/paquete, Playwright Web/E2E/UI, SQL integration para RLS/Cash, performance harness, Flutter tests/goldens.
- `pnpm check`: format, lint, typecheck, test y build.
- CI: quality/coverage, migration+RLS, Storybook/Playwright, Flutter foundation, Compose, container builds y authentication E2E.
- CodeQL semanal/PR/push.
- Flutter native workflow para Linux, Windows, macOS y Android.

### Infraestructura y deployment

`compose.yaml` orquesta PostgreSQL 18, Redis 8, MinIO, Mailpit, OTEL Collector, migrator, API, worker y Web. Existen Dockerfiles separados. No se encontró IaC de cloud/Kubernetes/Terraform; el deployment demostrado es contenedores/Compose y CI de builds.

## Comparación Arquitectónica

| Dimensión        | UMI         | NEXO                               | Veredicto                   |
| ---------------- | ----------- | ---------------------------------- | --------------------------- |
| Estructura       | NO EVIDENCE | monorepo pnpm/Turbo modular        | No comparable               |
| Bounded contexts | NO EVIDENCE | explícitos y separados de adapters | NEXO probado; UMI pendiente |
| Persistencia     | NO EVIDENCE | PostgreSQL/Prisma + SQL invariants | No comparable               |
| Multi-tenancy    | NO EVIDENCE | tenant explícito + FORCE RLS       | No comparable               |
| Eventos          | NO EVIDENCE | outbox por dominio + worker        | No comparable               |
| Contratos        | NO EVIDENCE | OpenAPI canónico + SDK/drift       | No comparable               |
| Clientes         | NO EVIDENCE | Web Admin + Flutter POS            | No comparable               |
| Observabilidad   | NO EVIDENCE | Pino + OpenTelemetry traces        | No comparable               |
| Delivery         | NO EVIDENCE | Compose, Docker, GitHub Actions    | No comparable               |

Arquitectura a cinco años: **no puede elegirse entre UMI y NEXO**. NEXO sí demuestra propiedades favorables: dominios puros sin frameworks, adapters explícitos, contrato canónico, tenant defense-in-depth, outbox, clientes desacoplados y CI. Deben usarse como criterios mínimos al evaluar UMI.

## Comparación Backend

No existe backend UMI inspeccionable. Para una futura comparación, NEXO establece este baseline:

- modular monolith con API y worker, no microservicios por dominio;
- DDD pragmático: paquetes puros y adapters Nest/Prisma;
- commands/queries y state machines, sin framework CQRS externo;
- invariantes financieras en domain/SQL;
- RLS forzado, RBAC/ABAC y tenancy explícita;
- OpenAPI design-first 3.1.1 y SDK derivado;
- outbox y proyecciones públicas UMI minimizadas;
- idempotencia en operaciones Sales/Cash/device;
- concurrencia mediante versiones, constraints, transacciones y claims.

Fuente de verdad provisional por dominio: NEXO sólo puede declararse **baseline existente**, no ganador. La decisión requiere mapear cada endpoint, entidad e invariante UMI contra esta implementación.

## Comparación Frontend

NEXO Web usa un AppShell, rutas Next, componentes `@nexo/ui`, NexoSelect, Premium Toast, contextual help, responsive layouts y Storybook. Flutter usa su propio Design System con paridad de tokens/semántica. No hay frontend UMI para comparar UX, performance, mantenibilidad o consistencia.

Ningún shell, token o componente UMI debe importarse o descartarse hasta inspeccionar:

- ownership de navegación y sesión;
- compatibilidad de tokens/licencias;
- accesibilidad/focus;
- deployment independiente;
- SSO, logout y tenant mapping;
- CSP y embedding.

## Comparación Dashboard

### NEXO verificable

El dashboard raíz consume Identity, Organization/Branch y `sales-administration/overview`. Presenta saludo, KPIs (ventas, ingresos, ticket, caja, outbox), resumen comercial, actividad, estado operacional y acciones rápidas. Usa `KpiCard`, `NexoIcon`, glass panels y AppShell.

Fortalezas:

- usa valores server-provided para KPIs disponibles;
- respeta contexto de sucursal;
- integra navegación y Design System;
- diferencia estado cargando/sin datos;
- reutiliza primitives.

Limitaciones verificables:

- el gráfico semanal no consume una serie temporal autoritativa; el propio código muestra un placeholder hasta contar con desglose autorizado;
- la actividad visible incluye composición editorial y no constituye por sí sola un audit/event feed general;
- analytics avanzados no están implementados como bounded context.

### UMI

No hay dashboard UMI inspeccionable. No es posible responder qué funcionalidades/componentes/UX/arquitectura UMI son superiores, qué pantallas sobreviven o qué debe eliminarse.

### Regla para la futura decisión

Comparar lado a lado: procedencia de datos, freshness, permisos, branch/tenant scoping, estados vacíos/error, accesibilidad, performance, extensibilidad, testabilidad y deuda. La apariencia será un criterio secundario.

## Matriz Funcional

`NO EVIDENCE` significa que UMI no fue entregado; no significa que la capacidad no exista.

| Dominio           | UMI         | NEXO / madurez verificable                          | Superior       | Decisión actual                     |
| ----------------- | ----------- | --------------------------------------------------- | -------------- | ----------------------------------- |
| Dashboard         | NO EVIDENCE | Funcional, analytics limitado                       | Indeterminable | Conservar NEXO como baseline        |
| Login/sesiones    | NO EVIDENCE | Funcional y endurecido                              | Indeterminable | Conservar                           |
| Usuarios          | NO EVIDENCE | User/Identity lifecycle                             | Indeterminable | Conservar                           |
| Roles/permisos    | NO EVIDENCE | RBAC+ABAC data-driven                               | Indeterminable | Conservar                           |
| Organizaciones    | NO EVIDENCE | CRUD/control plane                                  | Indeterminable | Conservar                           |
| Sucursales        | NO EVIDENCE | CRUD, scope y configuración                         | Indeterminable | Conservar                           |
| Membership        | NO EVIDENCE | Modelo, scopes, invitaciones                        | Indeterminable | Conservar                           |
| Onboarding        | NO EVIDENCE | Wizard persistido/data-driven                       | Indeterminable | Conservar                           |
| Productos         | NO EVIDENCE | Plataforma madura                                   | Indeterminable | Conservar                           |
| Categorías        | NO EVIDENCE | CRUD/listado                                        | Indeterminable | Conservar                           |
| Media             | NO EVIDENCE | Product media + avatar, MinIO privado               | Indeterminable | Conservar                           |
| Inventario        | NO EVIDENCE | Ledger/reservas/transfers/counts                    | Indeterminable | Conservar                           |
| Ventas            | NO EVIDENCE | Headless engine + admin                             | Indeterminable | Conservar                           |
| Caja              | NO EVIDENCE | Plataforma amplia                                   | Indeterminable | Conservar                           |
| Clientes          | NO EVIDENCE | Sólo referencia `customerId`; sin módulo            | Indeterminable | Gap NEXO; auditar UMI               |
| Reportes          | NO EVIDENCE | UI/read models limitados                            | Indeterminable | Evaluar UMI antes de ampliar        |
| Analytics         | NO EVIDENCE | KPIs y overview, sin motor avanzado                 | Indeterminable | Gap/posible aporte UMI              |
| Configuración     | NO EVIDENCE | Organization/Branch/features/profile                | Indeterminable | Conservar                           |
| Notificaciones    | NO EVIDENCE | Correo/invitaciones y retry script; sin hub general | Indeterminable | Posible consolidación               |
| Auditoría         | NO EVIDENCE | Security/domain events y timelines                  | Indeterminable | Conservar; revisar cobertura global |
| Archivos          | NO EVIDENCE | MinIO para media, no gestor documental              | Indeterminable | Evaluar por casos UMI               |
| SDK               | NO EVIDENCE | Generado y drift-checked                            | Indeterminable | Conservar contrato NEXO             |
| OpenAPI           | NO EVIDENCE | 3.1.1, 144 operaciones                              | Indeterminable | Conservar                           |
| CI/CD             | NO EVIDENCE | GitHub Actions + containers                         | Indeterminable | Conservar/mejorar deployment        |
| Testing           | NO EVIDENCE | Unit/SQL/E2E/UI/Flutter extensos                    | Indeterminable | Conservar                           |
| Seguridad         | NO EVIDENCE | CSP/CORS/CSRF/cookies/RBAC/ABAC/RLS                 | Indeterminable | No degradar                         |
| Observabilidad    | NO EVIDENCE | logs + OTEL traces; métricas/alerts no completas    | Indeterminable | Fusionar sólo con evidencia         |
| Deployment        | NO EVIDENCE | Compose/containers; cloud no demostrado             | Indeterminable | Gap de producción                   |
| Multi-tenancy     | NO EVIDENCE | tenant explícito + RLS                              | Indeterminable | Invariante no negociable            |
| Feature flags     | NO EVIDENCE | definiciones + org features, default deny           | Indeterminable | Conservar                           |
| Eventos           | NO EVIDENCE | domain events/outboxes                              | Indeterminable | Conservar                           |
| Device enrollment | NO EVIDENCE | API/persistencia/Flutter                            | Indeterminable | Conservar                           |
| Payroll           | NO EVIDENCE | No implementado                                     | Indeterminable | Diseñar después del audit UMI       |
| Copilot/AI        | NO EVIDENCE | No implementado                                     | Indeterminable | No iniciar sin fuentes/gobierno     |

## Matriz de Duplicidades

La duplicidad entre repositorios no puede medirse sin UMI.

| Área                                 | Clasificación cross-repo | Evidencia                               | Estrategia                                        |
| ------------------------------------ | ------------------------ | --------------------------------------- | ------------------------------------------------- |
| Todos los dominios                   | **NO DETERMINABLE**      | UMI ausente                             | No fusionar/eliminar                              |
| Design System Web/Flutter en NEXO    | Baja, intencional        | paridad semántica con widgets nativos   | Mantener fronteras                                |
| Modelos domain/API/Prisma NEXO       | Baja, capas deliberadas  | tipos puros + DTO + persistence mapping | No confundir mapping con duplicación              |
| Docs históricas NEXO                 | Media                    | 494 archivos y varios reportes de fase  | Consolidar índice después, no en esta auditoría   |
| UI de producto en varias superficies | Riesgo medio             | Web, POS, cards y selectors             | Reusar registries/primitives; verificar no forks  |
| Outbox por dominio                   | Baja, intencional        | Product/Inventory/Sales/Cash/device     | Mantener autonomía; unificar operación, no tablas |

## Componentes Reutilizables

Componentes NEXO de alto valor estratégico:

- motores puros `identity`, `authorization`, `product`, `inventory`, `sales`, `cash`;
- tenant context y RLS forzado;
- OpenAPI canónico y SDK drift-checked;
- outbox/worker y external mappings;
- Design Systems Web/Flutter y registries compartidos conceptualmente;
- session/cookie/CSRF/CORS/CSP hardening;
- Product media/MinIO privado;
- device enrollment y credential rotation;
- test harnesses SQL, Playwright, Storybook, goldens y manual acceptance;
- Compose reproducible y observabilidad OTEL;
- documentación de dominios y ADRs.

Su reutilización en una plataforma consolidada debe ocurrir por contratos/puertos, no copiando código a ciegas.

## Componentes Candidatos a Consolidación

Decisiones **condicionales** pendientes de UMI:

1. Identity/SSO/logout/tenant mapping.
2. AppShell, navegación, Design tokens y contextual help.
3. Dashboard y read models.
4. Organization/Branch/User/Role source of truth.
5. Product/Inventory/Sales/Cash ownership y mappings.
6. Audit/event pipeline y observabilidad.
7. Notifications/email/in-app channels.
8. OpenAPI gateways, SDKs y versionado.
9. Feature flags y entitlement ownership.
10. Knowledge/document corpus para Copilot.

Cada consolidación exige matriz entity-by-entity y operation-by-operation, data migration, compatibilidad y rollback.

## Componentes Candidatos a Eliminación

**Ningún componente de UMI o NEXO puede recomendarse para eliminación definitiva con la evidencia actual.**

Sólo se identifican candidatos de revisión, no autorización de borrado:

- documentación NEXO histórica redundante una vez exista un índice canónico;
- sinks locales UMI cuando una integración productiva reemplazante esté probada;
- variantes UI legacy únicamente después de demostrar cero consumidores;
- artefactos de build/cache, fuera del código fuente y sin valor arquitectónico.

## Estado de los Clientes Operativos

| Cliente           | Estado NEXO                | Evidencia                                                                  | Observación                                                                                          |
| ----------------- | -------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| POS               | **Existe funcional**       | `apps/nexo_pos`, 36 tests/7 goldens reportados, API real y workflow nativo | Certificado V1 por repo; builds nativos condicionados por runners y offline financiero deshabilitado |
| KDS               | **No existe como cliente** | flag `KITCHEN`, sin app/rutas KDS                                          | No confundir feature readiness con producto                                                          |
| Customer Display  | **No existe**              | sin aplicación/módulo encontrado                                           | Requiere discovery                                                                                   |
| Inventory Scanner | **Existe parcialmente**    | barcodes/product search y futuros adapters scanner en docs                 | Sin cliente scanner dedicado                                                                         |
| Manager Companion | **No existe**              | sin app dedicada                                                           | Web Admin cubre parte del caso, no equivale a companion                                              |
| Device Enrollment | **Existe funcional**       | módulo API, modelos, migración, Flutter docs/code                          | Requiere evidencia productiva de hardware/operación externa                                          |

El estado UMI de todos estos clientes es `NO EVIDENCE`.

## Preparación para Payroll

Payroll no debe implementarse dentro de Identity o Cash. Recomendación arquitectónica, no implementación:

- crear bounded context Payroll/Workforce separado;
- referenciar `userId`, `membershipId`, `organizationId` y `branchId`, sin duplicar identidad;
- distinguir usuario de empleado/contractor y permitir empleados sin acceso interactivo;
- incorporar employment lifecycle, compensation agreements versionados, pay periods, earnings/deductions, approvals y immutable payroll runs;
- usar roles/permisos nuevos y ABAC por organization/branch/ownership;
- aplicar tenant IDs, claves compuestas y FORCE RLS desde la primera migración;
- consumir eventos de membership/branch/user y emitir eventos payroll allowlisted;
- integrar notificaciones mediante puerto, no SMTP directo en domain;
- registrar actor, tenant, branch, timestamp, reason y before/after sanitizado;
- publicar OpenAPI/SDK sin exponer datos sensibles innecesarios;
- definir integración con Cash/accounting como posting explícito, nunca escritura directa al ledger;
- preparar retención, cifrado, segregación de funciones y regulación fiscal antes del roadmap.

Puntos NEXO reutilizables: Control Plane, Authorization Engine, RLS, outbox, idempotencia, OpenAPI/SDK, SecurityEvent/domain event patterns y observabilidad.

## Preparación para UMI Copilot

### Encontrado

- corpus documental amplio: arquitectura, dominios, seguridad, UX, manual acceptance, ADRs y Flutter;
- diagnostic bundles sanitizados para soporte;
- correlation IDs, events y structured logs que podrían alimentar herramientas operativas bajo control;
- Help Center/contextual help como superficie potencial.

### No encontrado

- proveedor LLM;
- RAG/retrieval pipeline;
- embeddings;
- vector database/pgvector;
- modelo de chunks/versiones/citas;
- políticas de prompt/tool execution;
- evaluación de respuestas;
- redacción y autorización por documento/tenant;
- chat interno productivo.

### Arquitectura recomendada

Construir posteriormente un bounded context/servicio Copilot separado. Ingesta versionada con provenance; retrieval filtrado por tenant/role; citations obligatorias; PII redaction; no acceso directo a tablas operativas; tools allowlisted vía APIs autorizadas; evaluación offline; audit trail; human confirmation para mutaciones. Primero se requiere el repositorio UMI y su Owner Knowledge Base real.

## Riesgos

| Riesgo                             | Severidad                   | Evidencia/impacto                                                                |
| ---------------------------------- | --------------------------- | -------------------------------------------------------------------------------- |
| UMI ausente                        | Crítico para esta auditoría | bloquea inventario, comparación y consolidación                                  |
| Consolidar basándose sólo en NEXO  | Alto                        | sesgo y posible duplicación/eliminación errónea                                  |
| Contratos UMI indefinidos          | Alto                        | SSO, mappings, events y shell siguen provisionales                               |
| Deployment cloud no demostrado     | Alto                        | Compose/CI no equivalen a operación productiva                                   |
| Customers ausente                  | Alto de roadmap             | Sales sólo conserva `customerId` opcional                                        |
| Analytics/reporting limitados      | Medio/alto                  | dashboard tiene overview y placeholder temporal                                  |
| Observabilidad parcial             | Medio                       | traces/logs presentes; SLOs, métricas y alerts no demostrados                    |
| Documentación masiva/histórica     | Medio                       | riesgo de fuentes contradictorias                                                |
| Puertos UMI locales/deshabilitados | Medio                       | no prueban integración end-to-end                                                |
| POS nativo condicionado            | Medio                       | código/test existe; cobertura de hardware/offline financiero limitada por diseño |

## Recomendaciones

1. Entregar ruta o checkout exacto de UMI, commit/tag y cualquier submódulo/LFS necesario.
2. Congelar ambos snapshots y registrar hashes antes de reanudar.
3. Ejecutar un censo equivalente sobre UMI con las mismas categorías y métricas.
4. Construir una matriz de ownership por entidad, comando, query, evento y UI; no por nombre de carpeta.
5. Usar como invariantes mínimas de consolidación: tenant isolation, RLS, autorización server-side, contratos versionados, idempotencia, auditabilidad y test evidence.
6. No seleccionar microfrontend, iframe, BFF o shared shell antes de conocer SSO, claims, CSP, deployment y ownership UMI.
7. No duplicar Customer, Payroll o Copilot hasta comprobar si UMI ya contiene implementaciones superiores.
8. Definir authoritative system y mapping para Organization, Branch, User, Membership, Product y Sale antes de mover datos.
9. Preservar NEXO como baseline ejecutable mientras se compara; no reescribir módulos certificados sin una ventaja demostrada.
10. Reanudar el audit desde esta evidencia, no desde cero, cuando UMI esté disponible.

## Impacto sobre el Roadmap

No se genera un roadmap nuevo. Impacto verificable:

### Etapas NEXO ya desarrolladas

- Foundation/tooling/infra local.
- Identity, Authentication y sesiones.
- Authorization RBAC/ABAC, memberships y RLS.
- Organization, Branch, invitations, onboarding y feature flags.
- Product/Catalog/Media.
- Inventory ledger y workflows.
- Sales headless, pagos externos, receipts, refunds y administración.
- Cash Management.
- Web Admin/Design Language/UX/motion.
- Flutter Design System y POS V1.
- Device Enrollment.
- OpenAPI/SDK/testing/CI/observabilidad base.

### Etapas que podrían ser trabajo duplicado

No puede declararse ninguna sin UMI. Las de mayor probabilidad de solapamiento son Identity/SSO, Organization/User/Role, dashboard, notifications, audit, reporting, Design System, deployment y Copilot knowledge surfaces.

### Etapas a fusionar o dividir

- Fusionar conceptualmente “UMI alignment” con una etapa previa de authoritative ownership/contract mapping.
- Dividir integración UMI en Identity/SSO, shell/navigation, master-data mappings, events/read models y operations/observability.
- Mantener Payroll separado de Identity/Team y de Cash.
- Mantener Copilot separado del Help Center y de operational APIs.
- Mantener clientes operativos como productos separados sobre contratos compartidos.

### Nuevas etapas potenciales gracias a UMI

No determinables hasta inspeccionar UMI. Posibles, no afirmadas: SSO, shell, Customer/CRM, analytics, notification hub, knowledge base, platform deployment y shared observability.

### Prioridad condicional

1. Obtener/auditar UMI.
2. Resolver ownership y contratos.
3. Cerrar gaps que ninguno cubra.
4. Integrar por puertos/eventos.
5. Sólo entonces retirar duplicados.

### Módulos NEXO que pueden considerarse implementados, no necesariamente consolidados

Identity, Authorization, Control Plane, Product, Inventory, Sales, Cash, Web Admin foundation, OpenAPI/SDK, Flutter POS V1 y Device Enrollment. “Implementado” no equivale a “ganador frente a UMI”.

## Conclusión del CTO

NEXO demuestra una base técnica seria y estratégicamente valiosa. Su mejor decisión es mantener el dominio separado de frameworks/adapters y reforzar autorización con contexto tenant y RLS. También son acertados el contrato OpenAPI canónico, SDK derivado, outbox, idempotencia, clientes desacoplados y Design Systems con paridad semántica.

La deuda principal observable no es una arquitectura defectuosa, sino límites de producto/operación: Customers y analytics avanzados ausentes, deployment productivo no demostrado, observabilidad operacional incompleta y documentación histórica muy extensa. Los módulos transaccionales y de seguridad no deberían tocarse sin una comparación y una ventaja medible.

La decisión CTO correcta hoy no es “NEXO gana” ni “fusionar UMI”. Es **detener cualquier consolidación irreversible hasta obtener UMI**. Declarar superioridad sin su código violaría el requisito de imparcialidad y crearía exactamente el trabajo duplicado que esta auditoría busca evitar.

## Archivos Inspeccionados

Se censaron todas las raíces fuente disponibles y se leyeron las autoridades siguientes (además de búsquedas transversales en sus descendientes):

### Workspace y delivery

- `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `compose.yaml`
- `apps/*/package.json`, `packages/*/package.json`, `apps/nexo_pos/pubspec.yaml`
- `.github/workflows/ci.yml`, `codeql.yml`, `flutter-native.yml`
- `infra/docker/*`, `infra/postgres/bootstrap/roles.sql`, `infra/otel/collector.yaml`

### Backend y datos

- `apps/api/src/modules/**`
- `apps/api/src/core/**`, `apps/api/src/infrastructure/**`, `apps/api/src/main.ts`
- `packages/{identity,authorization,control-plane,product,inventory,sales,cash}/src/**`
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/**`
- `packages/database/tests/**`
- `apps/worker/src/**`

### Frontend y clientes

- `apps/web/src/app/**`, `apps/web/src/lib/**`, `apps/web/src/security/**`
- `packages/ui/src/**`, `.storybook/**`
- `apps/nexo_pos/lib/**`, `apps/nexo_pos/test/**`
- `packages/nexo_flutter_design/lib/**`, `test/**`, `assets/**`

### Contratos, tests y docs

- `packages/contracts/openapi/openapi.json` y scripts
- `packages/sdk/src/**`, generated manifest y scripts
- `tests/e2e/**`, `tests/ui/**`, `tests/performance/**`
- ADRs y documentos de arquitectura/dominio/seguridad/Flutter/UMI bajo `docs/**`
- específicamente: `UmiExperienceIntegrationBlueprint.md`, `UmiSalesIntegrationFoundation.md`, `UmiCashIntegrationFoundation.md`, `Roadmap.md`, `RLS.md`, `PermissionEngine.md`, `OpenAPIContracts.md`, `FeatureFlags.md`, `FLUTTER_POS_V1_CERTIFICATION.md`.

### Búsqueda UMI externa

- `/home/hceja/Documents`, `/home/hceja/Desktop`, `/home/hceja/Downloads`, `/mnt`, `/media`
- checkouts `.git`, `package.json`, `pnpm-workspace.yaml`, `pubspec.yaml`, `pyproject.toml`, `Cargo.toml`
- candidatos `Desktop/STUFF/api-*-main` leídos y descartados por identidad verificable `cvive`.

## Evidencia

| Afirmación                         | Evidencia primaria                                                  |
| ---------------------------------- | ------------------------------------------------------------------- |
| UMI no está disponible             | búsqueda de directorios/manifiestos/checkouts en rutas documentadas |
| UMI sigue externo/indefinido       | tres blueprints UMI y ADR-0037/0041                                 |
| Monorepo NEXO                      | workspace/manifiestos/Turbo                                         |
| 4 apps/15 packages                 | censo de manifests                                                  |
| 61 modelos/27 enums/39 migraciones | Prisma y filesystem                                                 |
| OpenAPI 8.9.0, 144 ops             | `openapi.json` parseado                                             |
| RLS/tenant isolation               | migraciones, roles SQL, `RLS.md`, SQL tests                         |
| POS funcional                      | código Flutter, tests, certification doc y native workflow          |
| KDS/otros clientes ausentes        | búsqueda transversal de apps/rutas/manifiestos; sólo flags/docs     |
| Copilot no implementado            | búsqueda de dependencias, persistencia y código RAG/LLM/vector      |
| Payroll no implementado            | búsqueda de módulos/modelos/routes; sólo roles/employee fixtures    |
| CI/observability                   | workflows, Compose, OTEL package/collector                          |

## Quality Gate

| Gate                               | Resultado        | Motivo                                                |
| ---------------------------------- | ---------------- | ----------------------------------------------------- |
| UMI completamente inspeccionado    | **FAIL/BLOCKED** | repositorio no disponible                             |
| NEXO estructuralmente inventariado | **PASS**         | raíces, manifests y autoridades censadas              |
| Comparación bilateral completa     | **BLOCKED**      | no hay segundo código fuente                          |
| Duplicidad cross-repo demostrada   | **BLOCKED**      | no hay base UMI                                       |
| Reporte generado                   | **PASS**         | este archivo                                          |
| Código de producción modificado    | **PASS (0)**     | ninguna modificación de producción por esta auditoría |

**Veredicto final: BLOCKED.** No se autoriza marcar la auditoría `COMPLETE` hasta proporcionar y analizar UMI.
