# Authentication Architecture

## Alcance y decisión

Prompt 4.1B activa una plataforma de autenticación nativa, desacoplada de POS y de la autoridad tenant. `User` continúa siendo global; autenticarse sólo establece el principal. `Membership` y `TenantContext` siguen siendo obligatorios para entrar a recursos de negocio.

ADR-0028 selecciona un verificador first-party con sesiones opacas server-side, detrás de puertos reemplazables. No se reactivó el módulo interrumpido: la implementación vigente vive en `apps/api/src/modules/authentication` y usa el dominio puro `@nexo/identity`.

## Capas y dependencias

```text
HTTP/Fastify cookies + RFC 9457
              ↓
AuthenticationService (casos de uso)
              ↓
Repository | AbuseProtection | Mailer | PasswordBlocklist
              ↓
PostgreSQL | Redis | SMTP/Mailpit | archivo montado
```

- El caso de uso depende de interfaces, no de Prisma, Redis ni SMTP.
- PostgreSQL conserva sesiones, generaciones refresh, tokens de acción y eventos de seguridad.
- Redis limita abuso; una falla del limitador cierra el acceso, no abre el control.
- Los secretos opacos tienen 256 bits aleatorios; sólo se persisten HMAC-SHA-256.
- Node 24 Argon2id usa los parámetros centralizados de Identity; cada credencial tiene salt aleatorio y metadatos versionados.
- El blocklist es obligatorio y no vacío al iniciar. El corpus local es sólo una fixture; producción debe montar un corpus aprobado.

## Fronteras HTTP

Las rutas publicadas son exclusivamente las 11 operaciones OpenAPI 2.1.0: login, refresh, logout, logout global, reset, verificación, identidad actual, listado y revocación de sesiones. CORS usa allowlist exacta. Si existe `Origin`, debe coincidir; clientes no navegador pueden omitirlo.

Las cookies de acceso y refresh son `HttpOnly`, `SameSite=Strict`, `Path=/` y `Secure` fuera de desarrollo local. El token CSRF es legible por el cliente y su digest está ligado a la sesión. Las respuestas sensibles usan `Cache-Control: no-store`; logout limpia cookies y estado de sitio.

## Autenticación y resistencia a abuso

1. Se normaliza el email y se consumen límites Redis por IP y por cuenta con claves HMAC.
2. Usuario existente e inexistente recorren una verificación Argon2id; el error público es uniforme.
3. Sólo `ACTIVE`, o `LOCKED` cuyo bloqueo ya venció, con email primario verificado puede entrar.
4. Los fallos incrementan contadores durables y producen bloqueo temporal auditable.
5. El éxito crea Device, Session y RefreshToken generación 0 en una transacción y reinicia contadores.

Las solicitudes de reset y verificación devuelven siempre `202`, tienen un piso de 250 ms y no revelan existencia. Un fallo SMTP genera `SECURITY_WARNING`, sin cambiar la respuesta pública.

## Controles y límites deliberados

- `rememberDevice` marca reconocimiento de dispositivo; nunca omite MFA. MFA/WebAuthn permanecen apagados hasta una ceremonia completa.
- Location queda `null` mientras no exista un proveedor GeoIP con evaluación de privacidad.
- Existe revocación administrativa en la capa de aplicación con actor y motivo obligatorios. No se publica endpoint hasta contar con autenticación/autoridad de plataforma; exponerlo antes sería un bypass.
- OAuth, SSO, passkeys, magic links y passwordless permanecen deshabilitados.

Véanse [ThreatModelAuthentication.md](ThreatModelAuthentication.md), [SessionManagement.md](SessionManagement.md), [TokenLifecycle.md](TokenLifecycle.md) y [CSRF.md](CSRF.md).
