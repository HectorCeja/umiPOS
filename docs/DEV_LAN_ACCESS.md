# Acceso LAN de desarrollo

## Contrato

`DEV_LAN_HOST` habilita, exclusivamente cuando `LOCAL_DEVELOPMENT=true`, un host o IPv4 concreto
para abrir NEXO desde otro equipo de la misma red. El valor no lleva esquema, puerto ni ruta.

```dotenv
DEV_LAN_HOST=192.168.100.87
DEV_WEB_PORT=3000
DEV_API_PORT=3001
DEV_OBJECT_STORAGE_PORT=9000
```

`pnpm owner:share` detecta la IPv4 local si la variable no está definida. También acepta
`DEV_LAN_HOST` explícito, deriva las URLs públicas y muestra Web, API, Mailpit, MinIO y Health. Para
usar los comandos cotidianos directamente:

```sh
DEV_LAN_HOST=192.168.100.87 pnpm manual-acceptance:stop
DEV_LAN_HOST=192.168.100.87 pnpm manual-acceptance:start
```

Al cambiar de Wi-Fi, cambia `DEV_LAN_HOST` y reinicia. El arranque detecta el cambio y recrea solo
los contenedores de red necesarios; no elimina PostgreSQL, uploads ni volúmenes.

## Modelo de seguridad

- CSP agrega API, object storage y WebSocket de `localhost`, `127.0.0.1` y el host configurado solo
  en desarrollo local explícito. Las directivas de scripts, objetos, frames y base URI no se relajan.
- CORS usa un `Set` de orígenes normalizados y coincidencia exacta, con credenciales. Nunca refleja
  el origen ni usa `*`.
- CORS y las comprobaciones Origin/Referer de CSRF consumen la misma lista. Los tokens CSRF siguen
  siendo obligatorios en mutaciones autenticadas.
- Las cookies son host-only, `Path=/`, `SameSite=Strict` y HTTP-only salvo el token CSRF. En HTTP
  local `Secure=false`; la configuración ya impide desactivarlo fuera de desarrollo local explícito.
- Los puertos cambian el origen, pero Web y API sobre la misma IP siguen siendo same-site. Por eso no
  se necesita `SameSite=None`, que además exigiría HTTPS.
- `DEV_LAN_HOST` con esquema, puerto o ruta falla al iniciar. Tampoco puede habilitarse sin
  `LOCAL_DEVELOPMENT=true`. No se confía en `Host` ni `X-Forwarded-Host` de la petición.

Producción no incorpora `DEV_LAN_HOST` en CSP y la configuración de servidor rechaza activar esa
confianza de desarrollo sin la bandera local explícita. RLS, RBAC, tenancy y sesiones no cambian.

## Por qué `localhost` falla desde la Mac

En el navegador de la Mac, `localhost` es la propia Mac, no Linux Mint. Aunque el cliente pueda
resolver la API al hostname actual, el navegador bloquea la petición si la CSP entregada por Web no
autoriza exactamente esa URL. NEXO ahora configura ambos lados desde el mismo host LAN validado.

## Cookies y sesión

Web `:3000` y API `:3001` deben usar el mismo hostname textual. No mezcles IP y nombre DNS durante
una sesión. Login crea cookies para ese host; refresh y navegación las conservan; logout las elimina
con los mismos atributos. No se configura `Domain` y nunca se usa un dominio IP parcial.

## Diagnóstico

1. Ejecuta `DEV_LAN_HOST=<ip> pnpm owner:share` y usa exactamente la URL impresa.
2. Si CSP todavía menciona localhost, haz recarga forzada y confirma el header
   `Content-Security-Policy` del documento, no una copia en caché.
3. Si CORS falla, comprueba que `Origin` sea exactamente la Web impresa y revisa
   `pnpm manual-acceptance:logs api` para el rechazo sanitizado.
4. Si no se guardan cookies, confirma que Web y API comparten hostname, que no se mezcló HTTP/HTTPS
   y que el navegador no conserva una sesión de otro host.
5. Si las peticiones apuntan a localhost, detén e inicia con `DEV_LAN_HOST`; una build antigua puede
   conservar variables `NEXT_PUBLIC_*`, aunque el cliente también protege el acceso LAN.
6. Para limpiar solo salidas regenerables, simula `pnpm owner:cache:clean` y aplica con
   `pnpm owner:cache:clean -- --apply`. No toca base de datos ni uploads.

No hay service worker en la aplicación Web. `.next`, Turbo y reportes son desechables; los volúmenes
de PostgreSQL y MinIO no lo son.

## Verificación del owner en Mac

1. Conecta ambos equipos al mismo Wi-Fi.
2. En Linux: `DEV_LAN_HOST=<ip-linux> pnpm owner:share`.
3. Abre la URL Web impresa en la Mac y realiza una recarga forzada.
4. Inicia sesión, navega por Productos, Inventario y Perfil, y recarga.
5. Confirma avatar e imágenes, después cierra sesión.
6. En DevTools verifica Console limpia y que Network no contiene CSP/CORS/CSRF, blocked requests ni
   peticiones browser-visible a `localhost`.
