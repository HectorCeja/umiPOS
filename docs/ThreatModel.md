# Threat Model — Core tenancy

Cash-specific threats and controls are maintained in [CashThreatModel.md](CashThreatModel.md), including forged/duplicate entries, count manipulation, fraudulent withdrawals/refunds, collusion, force-close/reopen abuse, races and cross-tenant/Branch IDOR.

Método STRIDE enfocado en Organization, Branch, Membership, resolución y autorización.

| Activo         | Amenaza / vector                             | Mitigación                                                             | Referencia              |
| -------------- | -------------------------------------------- | ---------------------------------------------------------------------- | ----------------------- |
| Datos tenant   | IDOR cambiando organizationId                | principal verificado + Membership ACTIVE + RLS/FORCE + pruebas A/B     | OWASP A01:2025; ASVS V8 |
| Contexto       | tenant enviado en header/body o fuga de pool | candidato solo desde ruta, contexto explícito, `set_config(..., true)` | OWASP Multi-Tenant CS   |
| Membership     | elevación de rol o scope                     | matriz central, optimistic locking, default-deny, futura auditoría     | ASVS V8                 |
| Branch         | FK cruzada entre tenants                     | PK/FK compuestas y RLS WITH CHECK                                      | ASVS V11                |
| DB             | conexión con owner/BYPASSRLS                 | roles separados, secretos distintos, runtime mínimo                    | ASVS V14                |
| API            | contrato divergente o enumeración            | OpenAPI canónico, compatibility gate, 404/403 no reveladores           | OWASP A01/A10           |
| Disponibilidad | consultas tenant sin índice                  | índices tenant-first, límites/paginación futura                        | ASVS V12                |

Riesgos residuales: compromiso del proceso runtime permite seleccionar otro GUC; compromiso de migration/admin supera RLS; JSON no validado puede introducir configuración inválida. Se mitigan con secretos aislados, workloads separados, validación de esquema y monitoreo. No se consideran aceptables credenciales compartidas ni pruebas simuladas de aislamiento.

## Extensión Prompt 5 — Authorization Platform

| Activo   | Amenaza / vector                                   | Mitigación implementada                                                  | OWASP / ASVS      |
| -------- | -------------------------------------------------- | ------------------------------------------------------------------------ | ----------------- |
| Contexto | claims/session/route usados como autoridad         | session sólo da User; Membership/grants/features se releen de DB         | A01:2025; ASVS V8 |
| Registry | string mágico o permiso redefinido                 | registry v2 único, tipos, seed y compatibility gate                      | ASVS V1/V8        |
| Roles    | elevación mediante role-name check                 | engine evalúa grants; búsqueda de checks manuales prohibida              | Authorization CS  |
| Objeto   | owner/status/branch falsificado                    | módulos deben cargar atributos en transacción; endpoint evaluate no muta | A01; ASVS V8      |
| Feature  | flag usado para conceder                           | flag sólo es prerrequisito AND; permiso y ABAC siguen obligatorios       | ASVS V8           |
| Scope    | escape de Branch/Self/Custom                       | intersección assignment/context/resource; Self exacto; Custom deny       | A01; ASVS V8      |
| Tiempo   | grant vencido o reloj inconsistente                | `evaluatedAt` único y ventanas `validFrom/validUntil`                    | ASVS V8           |
| Datos    | lectura/escritura cross-tenant en tablas de policy | tenant transaction, forced RLS, constraints, runtime sin BYPASS          | Multi-Tenant CS   |

Riesgo residual controlado: el endpoint diagnóstico recibe atributos declarados por el cliente, pero sólo explica una decisión y nunca ejecuta una operación. Cada módulo futuro debe autorizar con atributos persistidos; incumplirlo es un release blocker.

## Extensión Prompt 6 — Control Plane

| Activo         | Amenaza / vector                                          | Mitigación implementada                                                                   | OWASP / ASVS         |
| -------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------- |
| Bootstrap      | creación tenant por identidad no verificada o duplicación | User verificado, transacción atómica, OWNER y Branch primaria inseparables                | A01/A04; ASVS V1/V8  |
| Onboarding     | reintento parcial deja flags/configuración divergentes    | optimistic locking, template versionada, complete atómico y restart no destructivo        | A04; ASVS V1/V11     |
| Invitación     | robo, replay, enumeración o escalamiento de rol/scope     | 256 bits, digest HMAC, tenant+email+rol+scope ligados, expiración, revocación y uso único | A01/A07; ASVS V2/V8  |
| Administración | permiso revocado entre preflight y escritura              | el engine relee Membership/grants/features dentro de la misma transacción de escritura    | A01; ASVS V8         |
| Evidencia      | borrado o manipulación del historial                      | eventos tenant-owned append-only y runtime sin UPDATE/DELETE                              | A09; ASVS V7         |
| Plantillas     | activación arbitraria o drift de versión                  | datos globales validados, versionados y sólo lectura en runtime                           | A04/A08; ASVS V1/V14 |
