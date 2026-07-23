# Configuración de red

| Entorno     | Origen Web              | Cookies                                                | CORS / CSRF                                       |
| ----------- | ----------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| Localhost   | `http://localhost:3000` | HttpOnly sesión/refresh, SameSite Strict, Secure false | origen exacto                                     |
| LAN privada | `http://<ip>:3000`      | mismas garantías locales                               | localhost, 127.0.0.1 e IP detectada, sin wildcard |
| Producción  | HTTPS público           | HttpOnly, SameSite según política, Secure true         | allowlist HTTPS explícita                         |

La CSP solo añade `upgrade-insecure-requests` cuando todos los orígenes configurados son HTTPS.
En LAN permite exclusivamente API y media configurados. WebSocket no forma parte del flujo actual.
Mailpit y la consola MinIO son herramientas locales y no deben publicarse a Internet.

Si el firewall bloquea el acceso, habilita únicamente TCP 3000, 3001, 8025 y 9000 desde la subred
privada y vuelve a ejecutar `pnpm owner:share`.
