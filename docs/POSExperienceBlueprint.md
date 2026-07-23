# POS Experience Blueprint

## Layout

Desktop/landscape: header de contexto/conexión, búsqueda+categorías+grid a la izquierda y carrito sticky a la derecha. Tablet vertical: catálogo principal, carrito como panel inferior accesible y total sticky. Móvil: modo limitado en pasos; no se recomienda operación continua. Windows conserva el mismo shell con foco visible, escáner y fullscreen future-ready.

Áreas: búsqueda/escáner, categorías, resultados, cards/lista, disponibilidad, carrito/líneas/notas, cliente future-ready, descuentos, impuestos/total autoritativos, pagos, suspender/cancelar, ventas suspendidas, conexión/sync, usuario/sucursal.

## Atajos

| Atajo            | Acción                                         |
| ---------------- | ---------------------------------------------- |
| `/` o `F2`       | enfocar búsqueda                               |
| `Enter`          | agregar selección segura                       |
| `+` / `-`        | cantidad de línea enfocada                     |
| `Delete`         | solicita confirmar quitar línea                |
| `F4`             | suspender (abre confirmación)                  |
| `F8`             | abrir checkout                                 |
| `Esc`            | cerrar capa/restaurar foco                     |
| `Ctrl/Cmd+Enter` | confirmar solo si la acción mostrada es segura |

Backend confirma cada cambio comercial. Mientras una intención está pendiente, la acción se bloquea; tras timeout se consulta su idempotency key. Permisos indican “requiere autorización” sin explicar reglas internas sensibles.
