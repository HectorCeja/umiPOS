# Owner blocker — NexoSelect motion y alineación óptica

Estado técnico: `TECHNICALLY_RESOLVED`. Estado owner: pendiente; nunca `OWNER_CONFIRMED`.

## Causas raíz

- Floating UI posicionaba el portal con `transform: translate(x, y)` y la superficie animaba esa misma propiedad. Mientras el keyframe estaba activo, sustituía las coordenadas de posicionamiento y al terminar las reintroducía, produciendo el viaje lateral percibido.
- El fallback `flip` podía abrir el panel sobre el trigger. Se eliminó para cumplir literalmente que NexoSelect nazca debajo; el viewport interno reduce su altura cuando falta espacio.
- Los grids estiraban los wrappers de campos hasta la altura del campo vecino. Sin `align-content: start`, ese espacio se distribuía entre tracks y desplazaba label/control.
- Inventario simulaba helper text con una fila invisible en la acción, dejando el botón 39.7 px fuera de baseline.
- Reglas de formulario antiguas imponían 46 px a inputs sobre el token compartido de 44 px.

## Contrato final

- El positioner del portal no tiene animación.
- Solo la superficie completa usa opacity, scale `0.98 → 1` y `translateY` de 6 px; no existe movimiento X.
- Opciones ya montadas: `animation: none`, `animation-delay: 0s`, `transform: none`.
- Trigger inmóvil y panel conectado inmediatamente debajo.
- Wrappers de `TextField` y `NexoSelect` alinean contenido al inicio; controles comparten altura tokenizada.
- Inventario usa tres estructuras equivalentes de label/control, sin filas fantasma.

## Evidencia

Capturas Retina finales: `artifacts/owner-blocker-motion-layout/after/`.

La suite `tests/e2e/owner-blocker-motion-layout.spec.ts` valida geometría real en Chromium, ausencia de motion por opción, inmovilidad del trigger, conexión del panel, baselines de Sucursales e Inventario, overflow y la superficie real de Onboarding con Alpha2.
