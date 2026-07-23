# NEXO Product Certification Part 1A — Parte 4

Fecha: 2026-07-21  
Veredicto: **BLOCKED**

## Executive Summary

Los controles dirigidos de seguridad quedaron funcionalmente demostrados: 15 pruebas E2E pasaron contra API y PostgreSQL reales; `pnpm check` pasó; API, Web, Worker, PostgreSQL, Redis, MinIO, Mailpit y OTEL están saludables. Se corrigieron carreras de invitaciones y enrolamiento, la autoridad de capabilities del dispositivo, la validación de secretos, los correlation IDs y headers defensivos de API.

La certificación no puede cerrar: el lockfile endurecido conserva 7 avisos `high` transitivos y la reconstrucción final de la imagen API fue bloqueada por timeouts de Corepack/registry. La API desplegada contiene las correcciones funcionales y de headers, pero no se demostró el artefacto final con las versiones de dependencias actualizadas.

## Alcance

Se inspeccionaron Identity, Control Plane, Device Enrollment, configuración, HTTP hardening, media de perfil, OpenAPI/SDK, CI/CD y supply chain. No se reabrieron certificaciones completas de negocio.

## Estado heredado de Partes 2 y 3

- Identity y sesiones: PASS WITH OBSERVATIONS.
- Authorization, RBAC, ABAC, RLS y aislamiento: PASS WITH OBSERVATIONS.
- Protección de Owner y delegación de Owner conservadas.
- No se encontró un bypass crítico, alto o medio reproducible.
- Git no ofrece línea base: el workspace completo aparece no rastreado; la atribución usa archivos, pruebas y evidencia runtime.

## MFA Readiness

**PREPARACIÓN ARQUITECTÓNICA / PARTIAL.** Existe `MfaStatus` (`NOT_ENROLLED`, `ENROLLED`, `REQUIRED`) en el perfil de sesión. No existen TOTP, WebAuthn/passkeys, recovery codes, challenges, endpoints, persistencia ni UI operativa. El estado enviado por cliente no concede permisos y fue rechazado en E2E. NEXO no debe anunciar MFA como funcional.

## Trusted Devices

**PARTIAL.** `Device` registra usuario, fingerprint y `trustedUntil`; una sesión puede clasificarse `RECOGNIZED`, pero solo después de autenticación correcta. No sustituye contraseña/MFA ni concede permisos. E2E demostró que campos de confianza forjados no elevan al actor. Faltan administración, revocación y política de expiración certificables; no se demostró fingerprinting invasivo.

## Device Enrollment Security

El token usa 32 bytes aleatorios, hash SHA-256, expiración, tenant/branch autoritativos y uso único. Se corrigió una carrera read-then-write mediante claim atómico `PENDING → CONSUMED`. Se eliminó la capacidad de reemplazar `capabilities` autorizadas mediante body cliente. E2E: consumo concurrente produce exactamente un 201 y un 409; revocación invalida autenticación; tenant ajeno es rechazado.

## Invitation Lifecycle

Se corrigió la aceptación read-then-write con claim atómico y se normalizó el caso de membership existente. Resend rota el token. E2E: token anterior 403, aceptación concurrente exactamente un 201, replay 403. La acción explícita de rechazo no existe y queda **NOT IMPLEMENTED**; es un gap de producto/UX, no un bypass demostrado.

## User Lifecycle

Estados reales: `PENDING_VERIFICATION`, `ACTIVE`, `LOCKED`, `SUSPENDED`, `DISABLED`, `DELETED`, `EXPIRED`. La autorización revalida estado autoritativo; no depende exclusivamente del token emitido. No se certificó una matriz comercial completa para cada estado raro: observación pendiente.

## Membership Lifecycle

Estados reales: `ACTIVE`, `SUSPENDED`, `REVOKED`. Una sesión ya emitida recibe 403 al suspender membership y vuelve a funcionar solo tras restauración controlada. El alcance de branch/organization continúa autoritativo.

## Organization Lifecycle

Estados: `ACTIVE`, `SUSPENDED`, `OFFBOARDING`. E2E demostró que organización suspendida bloquea una sesión existente. Retención y finalización de `OFFBOARDING` no se certificaron aquí.

## Branch Lifecycle

Estados: `ACTIVE`, `INACTIVE`, `ARCHIVED`. E2E demostró que branch inactiva bloquea operación de sesión existente.

## Secret Inventory

Se inspeccionaron HMAC de tokens y rate limits, DB, Redis, S3/MinIO, SMTP, OTEL y credenciales locales. Zod exige secretos HMAC de al menos 32 caracteres. Se añadió fail-fast si ambos HMAC son iguales. No se hallaron secretos sensibles `NEXT_PUBLIC`, ejemplos OpenAPI con tokens ni impresión de valores en startup. Compose contiene credenciales locales explícitas y debe permanecer solo en desarrollo.

## Secret Rotation

**MANUAL / PARTIAL.** Invitaciones y credenciales de dispositivo rotan; los HMAC de tokens no tienen key-ring, versionado ni dual-read. Rotarlos invalida material vigente y requiere ventana operativa documentada.

## Environment Security

LAN, cookies no seguras y orígenes locales dependen de `LOCAL_DEVELOPMENT`. El compose local combina `NODE_ENV=production` para builds optimizados con `LOCAL_DEVELOPMENT=true`; por ello la frontera real es esta última variable. La infraestructura productiva debe imponerla en `false`. No se encontró wildcard/origin reflection ni bypass de auth.

## Headers

La API ahora emite `X-Request-Id`, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` y `Permissions-Policy` en success y error. Curl sobre la API desplegada confirmó headers y `correlationId` en Problem Details. Web conserva sus headers propios.

## CSP

Producción conserva nonce/`strict-dynamic`, sin `unsafe-eval`; `object-src 'none'`, `frame-ancestors 'none'`, `base-uri` y `form-action` restringidos. `data:`/`blob:` se limitan a imagen donde aplica. LAN se incorpora solo en desarrollo. Cinco pruebas CSP existentes pasan dentro del gate.

## CORS

Allowlist exacta normalizada, credentials explícitas y sin wildcard. Sufijos maliciosos y orígenes no configurados se rechazan. `null`/sin Origin solo sigue la semántica server-to-server y no se acepta como CORS de navegador.

## Cookies

Producción usa cookies host-only `__Host-`, `Secure`, `HttpOnly`, `SameSite=Strict` y path `/`; desarrollo LAN mantiene la excepción HTTP explícita. Logout usa atributos concordantes. No se detectó cache público de respuestas autenticadas.

## API Hardening

Los DTO rechazan propiedades inesperadas y los errores usan Problem Details sin stack/SQL. Los lifecycle E2E comprobaron autoridad de servidor, concurrencia y revalidación. Límites uniformes de tamaño/timeout en todos los endpoints no quedaron certificados de forma exhaustiva.

## Error Redaction

Pino redacta Authorization, Cookie, CSRF, credencial de dispositivo y Set-Cookie; Worker redacta password/token/secret. Los correlation IDs arbitrarios se normalizan. No se encontró una fuga reproducible de secretos.

## Audit Denials

**PARTIAL.** Existen `ControlPlaneEvent` para éxitos y `SecurityEvent` para fallos de autenticación. Las denegaciones sensibles de autorización no se registran uniformemente. No se introdujo un segundo sistema de auditoría sin autoridad arquitectónica; se requiere contrato transversal en una fase posterior.

## Correlation IDs

Se añadió un resolvedor central: acepta solo `[A-Za-z0-9._:-]`, máximo 128 caracteres, y reemplaza valores inválidos, arrays o inyección por UUID. Se propaga en respuesta y Problem Details. Se añadieron seis pruebas unitarias.

## Proxy Trust

Fastify mantiene `trustProxy=false`; no confía ciegamente en `X-Forwarded-*`. El reverse proxy productivo deberá configurarse explícitamente antes de depender de IP/proto reenviados.

## Rate Limiting

Login/reset tienen cobertura heredada. No se demostró limitación dedicada y uniforme para invitations, enrollment y cambios sensibles. Redis failure behavior y política productiva de proxies quedan como observación.

## Files and Media

Avatar usa claves bajo prefijo del usuario, autorización en completion/get, PUT firmado por 15 minutos, máximo 5 MB y magic bytes PNG/JPEG/WebP. SVG/HTML no son aceptados; secretos S3 no llegan al navegador. La aserción de ownership existe; no se ejecutó una nueva matriz browser cross-tenant independiente.

## Feature Flags

El evaluador autoritativo es default-deny para flag desconocida/deshabilitada. Flags MFA no vuelven funcional una capacidad ausente y un valor de cliente no habilita backend.

## Impersonation / Support Access

**NOT IMPLEMENTED.** No se encontró login-as, break-glass, superusuario oculto ni debug-auth productivo.

## OpenAPI

144 operaciones válidas; endpoints protegidos conservan security schemes. MFA solo aparece como estado, no como endpoints falsos. Compatibility y generación pasaron mediante el gate.

## SDK

Sin drift. No se detectaron campos sensibles autoritativos nuevos generados como writeables.

## CI/CD Security

Workflows usan permisos restringidos, CodeQL y Dependabot. Varias actions están fijadas por major tag y no SHA inmutable. Branch protection, approvals y environments externos quedan **UNVERIFIED** localmente.

## Dependencies

Se actualizaron Nest 11.1.24, Fastify 5.8.5 y Nodemailer 9.0.1. El audit productivo bajó de 45 (1 critical, 18 high, 24 moderate, 2 low) a 21 (7 high, 14 moderate). Los high restantes son transitivos de Swagger/OpenTelemetry. No se realizó upgrade masivo sin validación. El rebuild Docker final quedó bloqueado por timeout del registry durante `pnpm fetch`.

## Privacy and Retention

Email, IP, user-agent, dispositivos, sesiones e invitaciones tienen timestamps y separación tenant. No se demostró una política automatizada de retención, anonimización, exportación o eliminación integral. Para operación SaaS en México se requiere política operativa/legal y evidencia de backups/restauración; queda documentado, no implementado.

## Vulnerabilidades Encontradas

1. Race de consumo de enrollment — corregida.
2. Capabilities de dispositivo controlables por cliente — corregida.
3. Race de aceptación de invitación — corregida.
4. HMAC de funciones distintas podía reutilizarse — corregida con fail-fast.
5. Headers/correlation IDs de API no uniformes — corregidos.
6. 1 critical y múltiples high de dependencias — critical eliminado localmente; 7 high pendientes.

## Correcciones Aplicadas

- Claims atómicos de invitation y device enrollment.
- Capabilities autoritativas desde enrollment.
- Conflicto explícito para membership existente.
- Sanitización y propagación de request ID.
- Headers defensivos/no-store en API.
- Separación obligatoria de HMAC secrets.
- Actualizaciones dirigidas de dependencias.

## Riesgos Restantes

- Artefacto Docker dependency-hardened no desplegado por indisponibilidad de registry.
- 7 avisos high y 14 moderate transitivos.
- Auditoría uniforme de denegaciones, rate limits completos, rotación HMAC y políticas de retención parciales.
- MFA y trusted-device management no son capacidades productivas.
- Controles externos CI/CD no verificables localmente.

## Tests

- E2E combinado security lifecycle, device, authorization escalation y authorization: **15/15 PASS** (4.5 s).
- API unitarios afectados: **31/31 PASS**, 14 archivos.
- Config: **9/9 PASS**.
- `pnpm check`: **PASS**, 16/16 tareas de build; format, lint y typecheck completados.
- Control Plane amplio heredado: 2 PASS, 6 FAIL visual/fixtures, 2 no ejecutadas; formalmente clasificado como deuda de fixtures/snapshots, sin aceptar snapshots ciegamente.

## Quality Gates

| Gate                        | Resultado | Impacto                                         |
| --------------------------- | --------- | ----------------------------------------------- |
| Servicios Docker            | PASS      | Todos saludables                                |
| Suites dirigidas            | PASS      | 15/15                                           |
| Unit/config                 | PASS      | 40/40                                           |
| pnpm check                  | PASS      | Incluye format/lint/typecheck/tests/build       |
| OpenAPI/SDK                 | PASS      | 144 operaciones; sin drift                      |
| Audit dependencias          | FAIL      | 7 high, 14 moderate                             |
| Rebuild Docker final        | BLOCKED   | timeout Corepack/registry                       |
| Control Plane visual amplio | PARTIAL   | 6 fixtures/snapshots obsoletos, 2 no ejecutados |

## Evidencia

- `tests/e2e/security-hardening-lifecycle.spec.ts`
- `tests/e2e/pos-device.spec.ts`
- `apps/api/src/core/request-id.test.ts`
- Headers runtime de `/health/ready` y Problem Details de `/v1/not-found`.
- Salidas reproducibles de `pnpm check`, Playwright, `pnpm audit --prod` y Docker Compose.

## Archivos Modificados

- `apps/api/src/modules/device/application/device.service.ts`
- `apps/api/src/modules/control-plane/infrastructure/prisma-control-plane.repository.ts`
- `apps/api/src/core/request-id.ts`
- `apps/api/src/core/request-id.test.ts`
- `apps/api/src/main.ts`
- `apps/api/src/core/problem-details.filter.ts`
- `packages/config/src/index.ts`
- `packages/config/src/index.test.ts`
- `apps/api/package.json`
- `pnpm-lock.yaml`
- `tests/e2e/pos-device.spec.ts`
- `tests/e2e/security-hardening-lifecycle.spec.ts`
- `docs/PRODUCT_CERTIFICATION_PART_1A_SECURITY_HARDENING.md`

## Veredicto

**BLOCKED.** Los defectos funcionales de seguridad encontrados están corregidos y las suites dirigidas pasan, pero no existe evidencia del artefacto final desplegado con el lockfile endurecido y permanecen avisos high. Part 1A Parte 4 no se certifica hasta reconstruir/desplegar, repetir smoke/E2E y resolver o aceptar formalmente cada advisory restante.
