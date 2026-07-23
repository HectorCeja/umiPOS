# CSRF Protection

NEXO usa cookies para sesiones web y aplica sincronización double-submit ligada a estado server-side:

1. login genera un secreto CSRF aleatorio;
2. el navegador recibe una cookie CSRF legible;
3. PostgreSQL conserva sólo su HMAC dentro de la Session;
4. cada mutación autenticada exige `X-CSRF-Token`;
5. el servidor compara en tiempo constante el header contra el digest de esa sesión;
6. refresh rota el secreto CSRF junto con access/refresh.

No es un token global ni sólo una comparación cookie-header. Copiar el CSRF de otra sesión no funciona. Logout, logout global, refresh y revocación de sesiones están protegidos. Login y solicitudes/completado por token no dependen de una sesión existente, pero mantienen CORS/Origin estricto, content type JSON, rate limiting y tokens de alta entropía.

Controles complementarios: cookies `SameSite=Strict`, `Secure` en no-local, host-only mediante prefijo `__Host-`, `HttpOnly` para credenciales, allowlist exacta de Origin y ausencia de GET mutables. XSS sigue pudiendo actuar como el usuario; CSP, escaping y no persistir secretos en Web Storage siguen siendo obligatorios.

Una prueba E2E confirma que omitir CSRF produce RFC 9457 `403` y no revoca la sesión.

Fuente: [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
