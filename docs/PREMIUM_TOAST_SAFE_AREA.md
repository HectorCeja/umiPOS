# Premium Toast Safe Area

## Resultado

El único provider `#nexo-toast-provider` permanece en la esquina superior derecha del viewport y comienza después del borde inferior real del Header persistente. La separación adicional procede de `--nexo-space-3`; no existe una altura de Header codificada.

## Causa raíz

La política anterior fijaba el toast contra el borde superior del viewport. Era consistente entre módulos, pero desconocía la geometría del AppShell, por lo que podía cubrir navegación, selector de sucursal, acciones rápidas y menú de cuenta.

## Implementación autoritativa

1. El Header activo expone `data-nexo-toast-safe-area`.
2. `PremiumToastPortal` conserva un solo portal global en `document.body`.
3. Un `ResizeObserver` mide el borde inferior del Header real y publica `--nexo-toast-safe-top` en el provider.
4. La región calcula su inicio con `max(--nexo-toast-safe-top, env(safe-area-inset-top)) + --nexo-toast-safe-gap`.
5. Un `MutationObserver` vuelve a resolver el Header cuando cambia el shell o la ruta.
6. La posición horizontal usa los tokens oficiales y las safe areas del sistema.

La animación, ancho, stacking, blur, elevación y duración no cambiaron.

## Barrido sistémico

- AppShell autenticado: Header global marcado y medido.
- Onboarding: Header editorial marcado y medido.
- Desktop, tablet y móvil: misma fórmula; solo cambia el margen lateral responsivo.
- Scroll profundo: el provider sigue siendo `position: fixed` y no altera el scroll.
- Dialogs/top layer: el provider conserva su portal global y no queda detrás de una superficie modal.
- No existen clases de posición por pantalla ni offsets verticales específicos de módulo.
- Flutter POS: no existe actualmente un Header global persistente equivalente en el overlay del POS; sus safe areas nativas continúan a cargo de `SafeArea`. La política Web no introduce contratos nuevos.

## Certificación

- `premium-toast-safe-area.spec.ts`
- `toast-header-clearance.spec.ts`
- `toast-responsive-offset.spec.ts`
- `toast-official-position.spec.ts`

La suite verifica intersección geométrica, respuesta a cambios reales de altura, scroll profundo y breakpoints 1440, 1024, 768, 390 y 320 px.
