# NEXO Product Certification Part 1A — Final

Fecha: 2026-07-21  
Decisión: **PART 1A CERTIFIED WITH OBSERVATIONS**

## Veredicto final de Part 1A

El artefacto final fue construido con frozen lockfile, desplegado y probado. No quedan advisories critical ni high. Los controles esenciales de identidad, autenticación, sesiones, autorización, RLS, aislamiento y hardening no presentan un bypass material reproducible. Las observaciones parciales no se convierten en PASS: se transfieren explícitamente.

## Executive Summary

- Imagen certificada: `sha256:6bf7b37da5f223585cf273dc64c4c2fcb4c89d5b6f13eabe162a3020fc0a5feb`.
- Usuario runtime: `nexo`.
- Health live/ready: PASS.
- Dependency audit: 0 critical, 0 high, 6 moderate.
- Regresión Security/Authorization: 15/15 PASS.
- Control Plane actual: 8/8 PASS.
- Identity dirigido final: 31 pruebas PASS acumuladas; los fallos intermedios fueron fixtures corregidos y repetidos.
- `pnpm check`: PASS.
- OpenAPI: 144 operaciones; SDK sin drift.

## Alcance certificado

Identity, login, logout, refresh/session lifecycle, reset, verification, invitations, authorization, RBAC/ABAC/RLS, tenant/branch isolation, Owner protection, Device Enrollment, headers, CSP/CORS/cookies, correlation, redaction, configuración y dependencias del artefacto.

## Alcance no certificado

MFA funcional, administración comercial de Trusted Devices, SIEM productivo, retención legal completa, configuración externa de plataforma CI/CD y una matriz browser de media de dos tenants con expiración temporal real de URL.

## Estado del artefacto desplegado

BuildKit utilizó Node 24.18.0, Corepack/pnpm 10.13.1, `pnpm fetch --frozen-lockfile`, instalación offline y build Nest. La imagen desplegada coincide con el ID esperado, corre sin root y contiene las correcciones de races, capabilities, correlation IDs y headers.

## Identity

**PASS WITH OBSERVATIONS.** Estados y credenciales son autoritativos. Fixtures destructivos de password/email fueron restaurados explícitamente para evitar contaminación entre suites.

## Authentication

**PASS.** Payloads inválidos, injection, orígenes maliciosos y credenciales incorrectas se rechazan sin 500 ni enumeración.

## Session Management

**PASS.** Rotación, expiración idle/absolute, revocación individual/global, replay y carrera de refresh demostrados.

## Password Reset

**PASS.** Token de un uso, expiración/replay, nueva credencial y revocación de sesiones demostrados.

## Email Verification

**PASS.** Estado pendiente autoritativo, entrega Mailpit, consumo único y replay rechazado.

## Invitations

**PASS WITH OBSERVATIONS.** Resend rota, aceptación es atómica y replay falla. Rechazo explícito continúa NOT IMPLEMENTED.

## Authorization

**PASS.** No se reprodujo bypass mediante body, query, headers, cookies, SDK o navegación directa.

## RBAC

**PASS.** Matriz real backend/frontend consistente en las suites dirigidas.

## ABAC

**PASS.** Tenant, branch, membership, estado y ownership se revalidan autoritativamente.

## RLS

**PASS.** Se conserva como barrera final y no se deshabilitó en pruebas.

## Tenant Isolation

**PASS.** Cruces de IDs/tenant y headers forjados son rechazados.

## Branch Isolation

**PASS.** Branch scope y branch inactiva bloquean operaciones.

## Owner Protection

**PASS.** No existe self-elevation, degradación no autorizada ni invitación Owner delegada indebidamente.

## Membership Lifecycle

**PASS.** ACTIVE funciona; SUSPENDED/REVOKED bloquean una sesión ya emitida.

## Organization Lifecycle

**PASS WITH OBSERVATIONS.** SUSPENDED bloquea inmediatamente. OFFBOARDING completo no está implementado como workflow comercial.

## Branch Lifecycle

**PASS.** ACTIVE/INACTIVE/ARCHIVED se aplican de forma autoritativa.

## Device Enrollment

**PASS.** Entropía, hash, expiración, claim atómico, uso único, tenant/branch, capabilities autoritativas y revocación demostrados.

## MFA Readiness

**PARTIAL — ARCHITECTURAL READINESS ONLY.** No existe MFA comercial/funcional y no se encontró un claim falso que lo anuncie.

## Trusted Devices

**PARTIAL — RECOGNITION ONLY.** No autentica ni eleva permisos; carece de administración comercial completa.

## Secret Management

**PASS WITH OBSERVATIONS.** Validación fail-fast y separación HMAC demostradas; no se halló exposición frontend.

## Secret Rotation

**PARTIAL / MANUAL.** Existe runbook; token HMAC no tiene key-ring ni dual-read.

## Environment Security

**PASS WITH OBSERVATIONS.** LAN está aislado por `LOCAL_DEVELOPMENT`; producción debe imponerlo en false.

## Headers

**PASS.** Headers defensivos y no-store confirmados en el contenedor final.

## CSP

**PASS.** Producción estricta; LAN solo desarrollo.

## CORS

**PASS.** Allowlist exacta, credentials sin wildcard y suffix attacks rechazados.

## Cookies

**PASS.** Producción host-only, `__Host-`, Secure, HttpOnly y Strict.

## API Hardening

**PASS WITH OBSERVATIONS.** DTO/error contracts cubiertos; límites globales exhaustivos por endpoint quedan para evolución.

## Error Redaction

**PASS.** Secretos, cookies y headers sensibles redactados.

## Audit Denials

**PARTIAL.** SecurityEvent cubre autenticación; ControlPlaneEvent cubre éxitos. Falta contrato uniforme transversal de denegaciones de autorización. No se creó un sistema paralelo.

## Correlation IDs

**PASS.** Formato/longitud limitados, inyección reemplazada y propagación a Problem Details.

## Rate Limiting

**PASS WITH OBSERVATIONS.** Login/brute force/password spraying demostrados. Invitations/enrollment usan cobertura compartida, sin política dedicada uniforme documentada. Las suites ahora aíslan el estado Redis.

## Media Security

**PASS WITH OBSERVATIONS.** Persistencia MinIO, magic bytes, MIME, ownership y key ajena rechazados. La matriz completa A/B de dos tenants y expiración browser queda transferida a Part 1B Media.

## OpenAPI

**PASS.** 144 operaciones y security schemes válidos.

## SDK

**PASS.** Sin drift ni campos sensibles autoritativos nuevos.

## CI/CD

**PASS WITH OBSERVATIONS.** CodeQL/Dependabot y permisos locales presentes. Pinning SHA, branch protection y approvals requieren acceso de plataforma.

## Dependency Security

**PASS WITH OBSERVATIONS.** De 1 critical/18 high/24 moderate/2 low a 0 critical/0 high/6 moderate. Overrides acotados: `fast-uri 3.1.4`, `glob 11.1.0`, `js-yaml 4.3.0`, `lodash 4.18.0`, `path-to-regexp 8.4.0`, `sharp 0.35.0`. Nest/Fastify/OTEL/Next pasaron types, tests, builds y runtime.

Moderate restantes: AJV `$data` ReDoS; dos advisories Hono transitivos de Prisma dev; dos de `@fastify/static` directory/encoded-path; PostCSS stringify. No existe exposición pública de directory listing ni Hono dev server en runtime API. Requieren actualización cuando las dependencias directas admitan versiones corregidas.

## Privacy and Retention

**PARTIAL.** Gap register creado. No se afirma cumplimiento legal integral.

## Vulnerabilidades corregidas

Races de invitations/enrollment, capabilities cliente, mutación ambigua de token en test, HMAC compartido, correlation/header gaps y todos los advisories critical/high.

## Vulnerabilidades restantes

Seis moderate, ninguna critical/high. No se identificó explotación material del runtime certificado.

## Risk Acceptances

No existen aceptaciones high. Los moderate se documentan como observaciones técnicas; owner y fecha de remediación requieren **OWNER REQUIRED**.

## Tests ejecutados

- Security/Authorization final: 15/15 PASS.
- Control Plane: 8/8 PASS (la suite actual contiene ocho, no diez pruebas).
- Identity/expiration/session: 14/14 PASS tras normalizar fixtures; verification 1/1 PASS.
- Brute force: 2/2 PASS.
- Avatar sync: 1/1 PASS.
- Profile media: 2/2 PASS.
- LAN/origin contract: 4/4 PASS.
- Unit API: 31/31; config: 9/9.

## Quality Gates

| Gate                                | Resultado                                            |
| ----------------------------------- | ---------------------------------------------------- |
| Format/lint/typecheck/unit/build    | PASS                                                 |
| pnpm check                          | PASS                                                 |
| Docker build/deploy                 | PASS                                                 |
| Health live/ready/worker            | PASS                                                 |
| Identity/Authorization/Security E2E | PASS                                                 |
| Control Plane                       | PASS 8/8                                             |
| OpenAPI/SDK                         | PASS                                                 |
| Dependency audit                    | PASS WITH OBSERVATIONS: 0/0/6 critical/high/moderate |
| SBOM                                | SKIPPED: plugin `docker sbom` no instalado           |

## Evidencia

- `artifacts/certification/part-1a-final/pnpm-audit-final.json`
- `artifacts/certification/part-1a-final/image-identity.txt`
- Playwright traces/screenshots y reportes de las suites citadas.
- Reportes históricos Partes 2, 3 y 4.

## Archivos modificados

Además de los archivos enumerados en Partes 2–4: manifests/lockfile de dependencias, fixtures Identity/Control Plane, snapshots revisados, helper de navegación y documentación final/runbooks.

## Observaciones transferidas a fases futuras

MFA funcional, Trusted Devices management, denials audit transversal, rate limits dedicados, key-ring HMAC, media browser A/B completa, retención legal y controles externos CI/CD.

## Criterios comerciales

MFA: **NOT AVAILABLE / ARCHITECTURAL READINESS ONLY**. Trusted Devices: **RECOGNITION ONLY**. No deben comercializarse como capacidades completas.

## Matriz final de certificación

| Dominio                       | Resultado              | Evidencia/observación    | Bloqueo | Fase futura      |
| ----------------------------- | ---------------------- | ------------------------ | ------- | ---------------- |
| Identity/Login/Authentication | PASS                   | E2E adversarial          | No      | Regresión        |
| Sessions/Refresh/Logout       | PASS                   | Rotation/replay/expiry   | No      | Regresión        |
| Reset/Verification            | PASS                   | Mailpit + one-use        | No      | Regresión        |
| Invitations                   | PASS WITH OBSERVATIONS | Atomic/replay; no reject | No      | Producto         |
| Authorization/RBAC/ABAC       | PASS                   | 15 E2E combinados        | No      | Regresión        |
| RLS/Tenant/Branch             | PASS                   | aislamiento real         | No      | Regresión        |
| Owner Protection              | PASS                   | no elevation/delegation  | No      | Regresión        |
| Device Enrollment             | PASS                   | concurrency/revoke       | No      | Ecosistema       |
| MFA                           | PARTIAL                | readiness only           | No      | Identity roadmap |
| Trusted Devices               | PARTIAL                | recognition only         | No      | Identity roadmap |
| Secrets/Rotation              | PASS WITH OBSERVATIONS | fail-fast/manual runbook | No      | Operaciones      |
| Headers/CSP/CORS/Cookies      | PASS                   | runtime + tests          | No      | Regresión        |
| API/Redaction/Correlation     | PASS                   | unit/runtime             | No      | Regresión        |
| Audit Denials                 | PARTIAL                | autoridad no uniforme    | No      | Observabilidad   |
| Rate Limiting                 | PASS WITH OBSERVATIONS | auth covered             | No      | Hardening        |
| Media                         | PASS WITH OBSERVATIONS | ownership/magic bytes    | No      | Part 1B          |
| OpenAPI/SDK                   | PASS                   | 144/no drift             | No      | Regresión        |
| CI/CD                         | PASS WITH OBSERVATIONS | externos no verificados  | No      | Owner action     |
| Dependencies                  | PASS WITH OBSERVATIONS | 0 critical/high          | No      | Maintenance      |
| Privacy                       | PARTIAL                | gap register             | No      | Legal/Operations |

## Certificación final

**PART 1A CERTIFIED WITH OBSERVATIONS.** Part 1B puede comenzar, manteniendo las observaciones y regresiones indicadas.

## Handoff to Product Certification Part 1B

Part 1B puede asumir sesiones, authorization context, Owner protection, RLS y tenant/branch isolation. Debe repetir suites de authorization/RLS, completar media A/B y no romper ownership, signed URLs, MIME/magic-byte validation ni contratos OpenAPI/SDK.
