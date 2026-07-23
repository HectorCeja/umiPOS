# Select — ancho fijo y protección contra overflow

## Resultado

El ancho de todos los Select Web depende exclusivamente de su contenedor. Una opción, placeholder o valor seleccionado ya no puede imponer ancho intrínseco, invadir otra columna ni desplazar acciones vecinas.

## Causa raíz reproducida

El grid de Inventario ya utilizaba columnas `minmax(0, 1fr)`, pero sus controles nativos conservaban `width: auto`. El algoritmo de tamaño intrínseco del `<select>` tomaba la opción larga como referencia y permitía que el control atravesara su celda.

## Contrato autoritativo

- `box-sizing: border-box`.
- `inline-size: 100%`, `max-inline-size: 100%` y `min-inline-size: 0`.
- Altura procedente de `--nexo-control-height`.
- Una sola línea y `text-overflow: ellipsis`.
- Chevron con su inset y padding oficiales.
- Wrappers de campo y children de grids con `min-width: 0` y `max-width: 100%`.
- El option conserva el texto completo; Inventario añade además `title` con el valor seleccionado completo.

Los doce selects nativos que permanecían en Web fueron conectados a `nexo-select`. No se agregó ningún ancho especial para Inventario.

## Responsive

- Desktop: Producto, Ubicación y acción permanecen en tres columnas con separación positiva.
- Tablet: los Select conservan dos columnas y la acción pasa a una fila completa.
- Mobile: los tres elementos se apilan y ocupan el ancho disponible.
- Se certificaron 1280, 900, 390 y 320 px, además de zoom CSS al 150 %.
- `documentElement.scrollWidth` nunca superó el viewport en los casos móviles.

## Dropdown y Flutter

Web utiliza el popup nativo de Chromium: abrirlo no modifica el trigger ni el grid, y el texto completo permanece disponible en sus opciones. Flutter POS ya consume exclusivamente `NexoSelect`, cuyo `DropdownMenu` utiliza `expandedInsets: EdgeInsets.zero`; queda constreñido por el layout padre y no mantiene variantes locales.

## Pruebas

- `select-fixed-width-contract.spec.ts`
- `select-long-option-overflow.spec.ts`
- `inventory-select-collision.spec.ts`
- `select-trigger-ellipsis.spec.ts`
- `select-dropdown-viewport.spec.ts`
- `select-responsive-layout.spec.ts`
- `systemic-select-sizing-sweep.spec.ts`

Las pruebas usan opciones deliberadamente largas y verifican bounding boxes reales, altura, intersección, botón vecino, viewport, scroll horizontal, ellipsis y acceso al texto completo.
