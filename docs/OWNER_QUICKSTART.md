# Guía rápida para el propietario

## Empieza aquí

Ejecuta `pnpm manual-acceptance:prepare` y abre únicamente `http://localhost:3000`. NEXO te llevará al inicio de sesión y decidirá, según el estado real, si debes continuar onboarding o entrar a Inicio. No necesitas conocer rutas de Ventas/Caja ni abrir Mailpit para probar el producto.

NEXO ya permite administrar organizaciones, catálogo, inventario, ventas y caja. La web sirve para consulta, soporte, refunds, recibos y operaciones administrativas; **no es una terminal POS**.

1. Ejecuta `pnpm manual-acceptance:prepare`.
2. Abre `http://localhost:3000/sales`; entra con una persona demo indicada por el comando.
3. Busca una venta por folio o ID, revisa líneas, pagos, Inventory, Cash y timeline.
4. Para caja abre `/cash`. Para un refund, selecciona la venta completada y usa el flujo administrativo autorizado.
5. Revisa errores en Excepciones, outbox y quarantine. Copia sólo el bundle sanitizado para pedir ayuda a ChatGPT, Codex o soporte.
6. Al terminar ejecuta `docker compose down`.

El recorrido detallado empieza en `artifacts/manual-acceptance/current-run/START_HERE.md`. Registra resultados reales y después ejecuta `pnpm manual-acceptance:record`; el comando no aprueba casos por sí mismo.

Todavía no existen Flutter, POS de producción, hardware, offline, UMI productivo, CFDI, reversos de tarjeta ni conciliación bancaria.
