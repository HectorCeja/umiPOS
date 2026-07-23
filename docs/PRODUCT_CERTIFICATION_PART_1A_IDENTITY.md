# NEXO Product Certification — Part 1A, Parte 2

Fecha: 2026-07-21  
Alcance: Identity, Authentication y Session Management  
Estado global: **PASS WITH OBSERVATIONS**

## Executive Summary

La autenticación Web usa tres secretos opacos independientes de 256 bits (access, refresh y
CSRF). Solo sus HMAC-SHA-256 se guardan en PostgreSQL. No existe JWT en este flujo. La rotación de
refresh es serializable y de un solo uso; detectar replay revoca la familia completa. Las sesiones
tienen expiración idle y absoluta, revocación individual/global y evidencia append-only. Login,
logout, recuperación, verificación, cookies, CSRF, CORS/LAN y los ataques negativos ejecutados
pasaron contra API, PostgreSQL, Redis y Mailpit reales.

No se encontraron vulnerabilidades Critical, High o Medium explotables durante esta parte. No se
modificó código productivo. Se agregaron suites de certificación para cubrir payloads hostiles,
enumeración, timing observable, cookies, orígenes, token/CSRF alterados, brute force y expiración.

Observaciones abiertas: MFA existe solo como estado de dominio y no como challenge operativo;
trusted-device es evidencia de reconocimiento, no autenticador; Invitation no tiene acción
explícita de rechazo; expiración y replay de Invitation requieren cobertura negativa dedicada más
amplia en la Parte 3. Ninguna de estas capacidades se presenta como certificada.

## Identity Certification

Flujo real:

`Browser/Flutter -> AuthenticationController -> AuthenticationService ->
PrismaAuthenticationRepository -> PostgreSQL`, con Redis para rate limiting, Mailpit/SMTP para
tokens de acción y MinIO para avatar. `AuthenticationService.authenticate` resuelve el secreto de
access a una Session activa y luego al User global; Organization/Branch no se seleccionan durante
autenticación.

| Módulo                      | Clasificación          | Evidencia                                                                   |
| --------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| Login                       | PASS                   | payloads válidos/hostiles, enumeración, origen, timing y rate limit reales  |
| Logout / logout-all         | PASS                   | CSRF ligado a sesión, 204, revocación y eliminación de cookies              |
| Password Reset              | PASS                   | entrega real, blocklist, uso único, replay rechazado, sesiones revocadas    |
| Email Verification          | PASS                   | entrega real, propósito/estado ligados, uso único y replay rechazado        |
| Invitations                 | PASS WITH OBSERVATIONS | create/resend/accept/tenant/role probados; reject no existe                 |
| Sessions                    | PASS                   | rotación, race, replay, revocación remota, idle y absolute expiry           |
| JWT                         | PASS (NOT APPLICABLE)  | búsqueda exhaustiva: sesiones Web usan tokens opacos, no JWT                |
| Cookies                     | PASS                   | host-only; access/refresh HttpOnly; SameSite Strict; Secure por entorno     |
| CSRF                        | PASS                   | HMAC ligado a Session; ausencia y token de otra sesión devuelven 403        |
| Brute Force                 | PASS                   | cuenta bloqueada al umbral 10; límite IP 30/min; Redis fail-closed          |
| Remember Session            | PASS                   | presupuesto absoluto 12 h normal / 30 días remember, nunca infinito         |
| Trusted Devices             | PARTIAL                | reconocimiento persistido; no eleva ni sustituye autenticación              |
| MFA Readiness               | PARTIAL                | estado `MfaStatus` existe; challenge/enrollment MFA no existe               |
| Device Enrollment Readiness | PARTIAL                | boundary separado existe; no certificado en esta parte                      |
| Auditoría                   | PASS WITH OBSERVATIONS | eventos de éxito/fallo/replay/reset/verificación; revisión SIEM queda fuera |

## Login

- Válido: 200 y cookies nuevas; el cliente no aporta identificador de sesión.
- Password incorrecto, usuario inexistente y usuario no elegible: 401 genérico.
- Vacíos, null, tipos incorrectos, campos extra, tamaños excesivos, SQLi y XSS: 400, nunca 500.
- JSON mal formado: 400.
- Origen desconocido, sufijo malicioso y LAN no configurada: 403 sin cookies.
- Enumeración: mismo status, media type, detalle y ausencia de Set-Cookie. La dispersión observada
  quedó bajo la tolerancia adversarial de 750 ms; Argon2id dummy se ejecuta para usuario inexistente.
- Brute force: bloqueo de cuenta después de 10 fallos consecutivos y límite compartido por IP de
  30 intentos/minuto; password spraying fue bloqueado.

## Password Reset

Token CSPRNG de un solo uso, HMAC en persistencia, TTL configurado de 30 minutos, propósito y User
ligados, revocación del token anterior y consumo atómico. El completion revalida lifecycle,
blocklist y política Argon2id, cambia credencial, revoca todas las sesiones y rechaza replay. La
solicitud pública mantiene respuesta uniforme de 202 y tiempo mínimo de 250 ms.

## Email Verification

Token CSPRNG/HMAC, TTL, propósito, EmailIdentity PENDING y User PENDING_VERIFICATION ligados. El
consumo es atómico, invalida hermanos y rechaza reutilización con 403. La solicitud pública no
revela existencia.

## Invitations

Los tokens son opacos/HMAC, expiran a 72 h, resend rota el token, la aceptación exige email de la
sesión, tenant exacto y estado PENDING. Role y Branch son validados y la escritura ocurre bajo
transacción tenant/RLS. El lifecycle real create/resend/accept pasó. No hay endpoint `reject`; esa
capacidad se clasifica no implementada, no PASS. La matriz negativa exhaustiva continúa en Parte 3.

## Sessions

Access, refresh y CSRF son independientes. Refresh conserva generaciones, consume con CAS dentro
de transacción Serializable y el replay cierra la familia. La carrera real tuvo un ganador; luego
la familia quedó revocada. Logout, logout-all y revocación remota escriben estado REVOKED y revocan
refresh activos. Se forzaron expiraciones idle y absoluta directamente en PostgreSQL y ambos access
tokens devolvieron 401.

## JWT

No hay JWT de autenticación en la implementación inspeccionada. Por tanto no existen `alg`, `iss`,
`aud` o claims alterables que certificar. Intentar certificar JWT aquí sería describir una
arquitectura inexistente. La firma/integridad equivalente es HMAC-SHA-256 sobre secretos opacos.

## Cookies

Desarrollo HTTP: `nexo_session` y `nexo_refresh` son HttpOnly; `nexo_csrf` es deliberadamente
legible para double-submit; todas son host-only, Path `/`, SameSite Strict y Secure false únicamente
con `LOCAL_DEVELOPMENT=true`. Producción usa nombres `__Host-` y Secure true. Logout limpia con los
mismos atributos. La prueba LAN real confirmó persistencia, refresh/navegación y eliminación.

## CSRF

Las mutaciones autenticadas requieren origen confiable exacto y header `X-CSRF-Token`; el HMAC debe
coincidir con la Session autenticada. Un token CSRF válido de otra sesión fue rechazado. Refresh,
logout, logout-all, revocación y perfil permanecen protegidos. CORS no usa wildcard.

## Vulnerabilidades Encontradas

Ninguna Critical/High/Medium demostrada. Hallazgos de certificación:

1. `OBS-IDENTITY-001` — MFA operativo ausente: **PARTIAL**, no vulnerabilidad introducida.
2. `OBS-IDENTITY-002` — trusted-device no es segundo factor: **PARTIAL**, comportamiento seguro.
3. `OBS-IDENTITY-003` — Invitation no ofrece reject explícito: **PASS WITH OBSERVATIONS**.
4. `OBS-IDENTITY-004` — suite Control Plane histórica contiene expectativas visuales/datos stale
   fuera del dominio Identity; su lifecycle de Invitation sí pasó.

## Correcciones Aplicadas

No se aplicaron correcciones productivas porque no se demostró un defecto de seguridad real. Se
agregaron únicamente pruebas adversariales reproducibles.

## Riesgos Restantes

- MFA y enrolment no deben comercializarse como disponibles.
- La ausencia de reject de Invitation debe resolverse solo si una parte autorizada lo requiere.
- Timing debe volver a medirse bajo infraestructura de producción y volumen estadístico mayor.
- Rotación de secretos HMAC, retención/exportación de eventos y respuesta SIEM requieren revisión
  operativa de producción.

## Evidencia y Tests Ejecutados

- `identity-certification.spec.ts` + `identity.spec.ts`: **12/12 PASS**.
- `identity-brute-force-certification.spec.ts`: **2/2 PASS**.
- `identity-expiration-certification.spec.ts`: **2/2 PASS**.
- LAN/CORS/Browser (`dev-lan-access`, `cors-certification`): **5/5 PASS**, Console/Network limpias.
- `@nexo/identity`: **5/5 PASS**.
- `@nexo/config`: **8/8 PASS**.
- `@nexo/api`: **25/25 PASS**.
- OpenAPI: **144 operations valid**, compatibility **PASS**.
- SDK generated drift: **PASS**.
- Identity histórica: refresh reuse, refresh race, remote revoke, reset y verification: **7/7 PASS**.

El gate combinado inicial incluyó pruebas históricas fuera de alcance: 7 PASS, 7 FAIL y 6 no
ejecutadas. Los FAIL fueron expectativas stale de conteo/onboarding y snapshots visuales de Control
Plane; el flujo de Invitation funcional pasó. No se cuentan como fallos de Identity, pero tampoco se
ocultan.

## Archivos Modificados

- `tests/e2e/identity-certification.spec.ts`
- `tests/e2e/identity-brute-force-certification.spec.ts`
- `tests/e2e/identity-expiration-certification.spec.ts`
- `docs/PRODUCT_CERTIFICATION_PART_1A_IDENTITY.md`

## Próximas observaciones para Part 1A – Parte 3

Certificar autorización/tenant/RLS con foco en Invitation race/replay/expiry, lifecycle suspendido y
eliminado, escalamiento role/branch, MFA enforcement futuro y seguridad de device enrollment. No
iniciar módulos Products, Inventory, Sales, Cash o Reports.
