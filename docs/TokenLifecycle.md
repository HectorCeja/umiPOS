# Token Lifecycle

## Secretos de sesión

Access, refresh y CSRF son valores opacos independientes de 256 bits. Se entregan sólo por canal TLS/cookies (TLS es obligatorio fuera de local) y se almacenan como HMAC-SHA-256 con secretos distintos de rate limiting. No son JWT y no incorporan autoridad tenant.

| Secreto | Cliente         | Persistencia            | Rotación / fin                            |
| ------- | --------------- | ----------------------- | ----------------------------------------- |
| access  | cookie HttpOnly | digest Session          | cada refresh; idle/absolute/revoke        |
| refresh | cookie HttpOnly | registro por generación | un uso; replay revoca familia             |
| CSRF    | cookie legible  | digest Session          | cada refresh; comparación ligada a sesión |

## Tokens de acción

Reset y verificación son opacos, digeridos, ligados a User + email + propósito, con expiración, revocación y consumo atómico de una sola vez.

- Reset: TTL 30 min; al consumir cambia contraseña y revoca sesiones/tokens.
- Verificación: TTL 24 h; confirma el `UserEmail` pendiente correcto.
- Emitir otro token revoca el anterior del mismo propósito.
- Un segundo consumo devuelve `403` sin reutilizar efecto.
- Reset no inicia sesión automáticamente.
- El consumo revalida lifecycle y estado del email; una suspensión posterior a la emisión invalida el efecto.

Los tokens crudos sólo aparecen en el correo local capturado por Mailpit. Logs, eventos, OpenAPI responses y base de datos no los contienen.

## Compromiso y rotación operativa

Rotar `AUTH_TOKEN_HMAC_SECRET` invalida los secretos existentes; producción debe tratarlo como una revocación coordinada y comunicar cierre global. Los secretos de entorno no tienen default productivo. La evidencia de generaciones refresh se conserva conforme a la política de retención futura.
