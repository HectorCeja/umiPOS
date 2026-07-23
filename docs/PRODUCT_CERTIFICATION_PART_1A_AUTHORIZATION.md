# NEXO Product Certification — Part 1A, Parte 3

Fecha de cierre técnico: 2026-07-21. Alcance: Authorization, RBAC, ABAC, RLS,
aislamiento tenant/branch, membresías, invitaciones y límite de autorización de
Device Enrollment.

## Veredicto

**PASS WITH OBSERVATIONS.** No quedó un bypass reproducible de autorización,
autoasignación, delegación de Owner, fuga entre organizaciones o fuga entre
sucursales en las suites dirigidas. RLS negó por defecto y aisló dos tenants al
reutilizar la misma conexión/transacción. Las observaciones abiertas son de
cobertura y de una suite amplia de Control Plane con fixtures/snapshots antiguos;
no demostraron un fallo del control de acceso corregido.

## Estado recuperado y causa de la interrupción anterior

- Docker tenía API, PostgreSQL, Redis, Web, Worker, MinIO y OTEL saludables.
- La imagen desplegada contenía la protección previa de edición de Owner.
- La ejecución anterior falló en el primer caso de cada `describe.serial`; por
  semántica de Playwright los cuatro casos restantes de cada archivo no se
  ejecutaron: 8 `did not run`. No fueron PASS ni FAIL.
- El seed conservaba una asignación `OWNER` adicional de una ejecución ofensiva
  anterior. Además, `test:e2e:reset` utilizó inicialmente una imagen `migrate`
  obsoleta. Se reconstruyó y el reset determinista dejó al administrador solo con
  `ADMINISTRATOR`.
- Git no ofrece una línea base utilizable: el repositorio completo aparece como
  no rastreado (`??`). La auditoría de cambios se hizo por contenido y timestamps;
  no se atribuyeron cambios ajenos.

## Correcciones validadas y aplicadas

1. `updateMembership` obtiene la membresía y roles autoritativos del actor dentro
   de la transacción. Solo un Owner activo puede asignar Owner o modificar una
   membresía Owner. Revocar requiere además `membership.revoke` y el último Owner
   activo no puede degradarse ni revocarse.
2. Se encontró y cerró una segunda ruta de escalamiento: un Administrator tenía
   `invitation.create` y podía solicitar `roleKey: OWNER`. `createInvitation`
   ahora exige también que el actor tenga una membresía Owner activa. El cliente
   no decide este atributo.
3. El seed elimina únicamente roles extra de las personas sintéticas oficiales,
   dentro de su tenant y membresía deterministas. No amplía permisos ni borra
   datos de negocio.
4. Las pruebas usan versiones autoritativas, sucursales autorizadas y restauran
   feature flags alterados.

No cambiaron contratos públicos, OpenAPI, SDK, RLS, RBAC ni reglas de dominio
ajenas a protección de Owner.

## Authorization Certification

| Área                       | Resultado              | Evidencia                                                                                             |
| -------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------- |
| Backend guards/policies    | PASS                   | API real: autoelevación, Owner, Cashier y contextos forjados rechazados                               |
| Frontend protection        | PASS WITH OBSERVATIONS | Middleware/shell protegen navegación; la barrera certificada es API, no ocultamiento visual           |
| RBAC                       | PASS                   | Registro oficial + pruebas de Owner, Administrator, Supervisor, Cashier, Employee y ReadOnly          |
| ABAC                       | PASS                   | branch scope, feature disabled, ownership forjado y permiso desconocido deniegan por defecto          |
| Tenant isolation           | PASS                   | Alpha no resuelve contexto/membresías Beta; RLS A→B                                                   |
| Branch isolation           | PASS                   | branch Beta rechazada en contexto Alpha; scopes BRANCH comprobados                                    |
| RLS                        | PASS                   | prueba SQL transaccional completa, FORCE RLS y políticas presentes                                    |
| Invitations authorization  | PASS WITH OBSERVATIONS | lifecycle y Owner delegation pasan; no existe rechazo explícito y faltan casos concurrentes profundos |
| Device Enrollment boundary | PASS                   | enrolamiento, autenticación, tenant isolation y revocación reales                                     |
| Auditoría                  | PASS WITH OBSERVATIONS | éxitos sensibles persistidos; denegaciones no tienen aún un evento de negocio uniforme                |

## Matriz real de roles

Los únicos roles encontrados son los siguientes; no se inventaron Support ni
Auditor.

| Rol           | Alcance declarado | Grants | Restricción principal                                                             |
| ------------- | ----------------- | -----: | --------------------------------------------------------------------------------- |
| OWNER         | ORGANIZATION      |    110 | Administración total; protegido como ownership contractual                        |
| ADMINISTRATOR | ORGANIZATION      |    108 | Sin `membership.revoke` ni `organization.archive`; no puede asignar/invitar Owner |
| SUPERVISOR    | BRANCH            |     78 | Operación de sucursal y excepciones controladas                                   |
| CASHIER       | BRANCH/SELF       |     48 | Venta/caja asignada; sin administración de membresías/features                    |
| EMPLOYEE      | BRANCH            |     25 | Operación limitada                                                                |
| READ_ONLY     | ORGANIZATION      |     21 | Consultas dentro del alcance, sin mutaciones                                      |

La fuente de verdad es `roleRegistry`/`rolePermissionRegistry`; la API resuelve
roles desde `membership_authorization_roles`, flags desde DB y restricciones
ABAC desde el recurso/branch/status. Las pruebas no detectaron divergencia entre
la matriz y los casos ejercitados.

## Protección de Owner, autoasignación y delegación

- Administrator → self Owner: `403`, rol permanece `ADMINISTRATOR`.
- Administrator → modificar/degradar Owner: `403`, incluso con headers de
  identidad/rol/tenant falsos.
- Administrator → invitación Owner: `403` después de la corrección defensiva.
- Cashier → membresía o feature flag: `403`.
- Último Owner activo: protegido con `409` frente a degradación/revocación.
- Un actor autorizado conserva las operaciones no-Owner permitidas por su grant.

## Tenant Isolation, Branch Isolation, RBAC y ABAC

- Contextos `organizationId`, `branchId`, membership, role y ownership enviados
  por el cliente no sustituyen el contexto autenticado.
- Alpha y Beta no pueden leer contextos ni membresías cruzadas.
- Una sucursal Beta no puede seleccionarse bajo Alpha.
- Feature deshabilitada produce `FEATURE_DISABLED`; permiso inexistente produce
  `UNKNOWN_PERMISSION`; ownership forjado no concede acceso.
- La API es la barrera autoritativa. La UI consume el contexto para presentación,
  pero llamadas manuales reciben la misma decisión del backend.

## RLS y limpieza de contexto

`packages/database/tests/rls.integration.sql` pasó completo. Sin contexto, las
tablas de organización, autorización, features, Control Plane, invitaciones,
eventos, productos, inventario, ventas y caja devuelven solo la fila centinela de
denegación. En la misma conexión/transacción se estableció tenant A, luego tenant
B; B no leyó ni actualizó filas A. `RESET` y `ROLLBACK` cerraron la prueba. FORCE
RLS y políticas fueron comprobados. No se desactivó RLS.

## Membership Lifecycle

PASS para membresía activa, modificación autorizada, revocación protegida y
protección del último Owner. Estados suspendido/revocado participan en la
resolución autoritativa. **Observación:** no existe estado `EXPIRED` en el DTO de
membresía y no se ejecutó una matriz E2E independiente para organización
archivada, sucursal inactiva y cada transición de usuario; quedan como cobertura
de la siguiente profundización, no como bypass demostrado.

## Invitations Authorization

PASS: crear/listar/reenviar/revocar, scope tenant/branch, rol existente, token
rotado por reenvío y prohibición de delegar Owner desde Administrator. La
aceptación exige invitación PENDING, email, tenant, hash y expiración válidos y
marca el registro ACCEPTED transaccionalmente. **Observaciones:** no existe una
operación de rechazo explícito; aceptación concurrente/repetida y reemplazo de
invitación merecen una suite de concurrencia específica.

## Device Enrollment Authorization Boundary

PASS en `pos-device.spec.ts`: enrolamiento real, autenticación, asociación tenant,
aislamiento entre tenants y revocación. La certificación funcional completa del
ecosistema Device permanece fuera de esta Parte 3.

## Auditoría y observabilidad

`ControlPlaneEvent` persiste tenant, actor, tipo, recurso, outcome, metadata y
timestamp para cambios exitosos de feature, invitación y membresía. Los flujos no
registran secretos en estos eventos. **Observación:** el modelo no incluye branch,
IP ni correlation ID y las denegaciones no generan uniformemente un evento de
seguridad persistido. OTEL/logs técnicos no equivalen todavía a exportación SIEM.

## Vulnerabilidades o defectos encontrados

1. **Corregido:** delegación de Owner mediante invitación por Administrator.
2. **Corregido:** seed no eliminaba un rol sintético extra dejado por una prueba de
   escalamiento y podía falsear posteriores resultados.
3. **Observación no explotable en esta ejecución:** cobertura incompleta de
   concurrencia de invitaciones y lifecycle exhaustivo.
4. **Observación operativa:** Git no permite demostrar un diff confiable porque
   todos los archivos están sin rastrear.

## Tests ejecutados

- `test:e2e:reset` con imagen `migrate` reconstruida: PASS.
- Authorization Playwright dirigido: **11 PASS, 0 FAIL, 0 SKIPPED**.
- Invitation + POS device Playwright: **2 PASS, 0 FAIL**.
- RLS SQL integration: PASS; 32 comprobaciones visibles y rollback.
- Authorization unit: 5 PASS; Control Plane unit: 2 PASS; API unit: 25 PASS;
  SDK: 2 PASS.
- OpenAPI: 144 operations válidas; compatibility 3.0.0 PASS; SDK drift PASS.
- `pnpm check`: PASS final — format, 29 lint tasks, 29 typecheck tasks, 29 test
  tasks y 16 build tasks; Next generó 26 rutas.
- Smoke desplegado: `/health/live` y `/health/ready` PASS; DB, Redis y object
  storage `up`.

## Tests no ejecutados y observaciones de suites amplias

- Los 8 `did not run` originales fueron explicados y repetidos: ahora PASS.
- Una ejecución amplia previa de `control-plane.spec.ts` produjo 2 PASS, 6 FAIL y
  2 sin ejecutar: un fixture de onboarding ya no satisface la validación actual y
  cinco snapshots visuales están desactualizados. El filtro posterior omitió el
  setup serial y dejó `owner` indefinido. No se cuentan como PASS ni como fallos de
  autorización; requieren mantenimiento propio de esa suite.
- No se ejecutó una prueba separada de workers con identidad multi-tenant porque
  no se encontró un job de autorización de membresías/invitaciones en alcance. RLS
  y el test unitario del worker sí pasaron.

## Quality Gates

El primer `pnpm check` de la continuación falló solo por formato de un reporte
Markdown anterior; fue formateado sin cambiar contenido. El `pnpm check` posterior
y el final después de la corrección de invitaciones pasaron completos. No hay
drift OpenAPI/SDK.

## Evidencia reproducible

- `tests/e2e/authorization-escalation-certification.spec.ts`
- `tests/e2e/authorization.spec.ts`
- `tests/e2e/team-invitation-lifecycle.spec.ts`
- `tests/e2e/pos-device.spec.ts`
- `packages/database/tests/rls.integration.sql`
- `packages/authorization/src/registry.ts`
- `apps/api/src/modules/control-plane/infrastructure/prisma-control-plane.repository.ts`
- `test-results/.last-run.json` y traces previos para la causa de los 8 omitidos.

## Archivos modificados en esta continuación

- `apps/api/src/modules/control-plane/infrastructure/prisma-control-plane.repository.ts`
- `packages/database/prisma/seed.ts`
- `tests/e2e/authorization-escalation-certification.spec.ts`
- `tests/e2e/authorization.spec.ts`
- `docs/UMI_NEXO_DISCOVERY_REPORT.md` (solo formato)
- `docs/PRODUCT_CERTIFICATION_PART_1A_AUTHORIZATION.md`

## Riesgos restantes y próxima Parte 4

- Añadir cobertura concurrente/idempotente de aceptación de invitaciones.
- Definir si el producto necesita rechazo explícito de invitación.
- Uniformar eventos de denegación con correlation ID, branch e integración SIEM.
- Reparar fixtures/snapshots de `control-plane.spec.ts` fuera de esta corrección.
- Restaurar una línea base Git rastreada antes de la próxima auditoría formal.

Ninguna observación anterior constituye un bypass reproducido en las validaciones
de esta Parte 3.
