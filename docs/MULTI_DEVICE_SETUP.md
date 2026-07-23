# NEXO en varios dispositivos

## Uso diario

1. Conecta Linux Mint y el Mac a la misma red privada.
2. En Linux Mint ejecuta `pnpm owner:share`.
3. Abre en el Mac la URL **Web** mostrada por el comando.
4. Comprueba `Health` si la pantalla no responde.

El comando detecta la IPv4 local, configura una allowlist exacta de orígenes, expone Web, API,
Mailpit y MinIO, espera los health checks y muestra todas las URLs. No usa `*` en CORS.

Si cambia la red, vuelve a ejecutar `pnpm owner:share`; no edites archivos. Para fijar una interfaz
concreta: `NEXO_LAN_IP=192.168.1.20 pnpm owner:share`.

## Validación física en Mac

Probar Login, Productos, Inventario, Caja, Perfil, Centro de ayuda y logout. Subir un avatar PNG y
confirmar que permanece después de recargar. Console debe quedar sin errores y Network sin 401,
409 o 500 inesperados. Esta ejecución física no puede ser automatizada desde el runner Linux.
