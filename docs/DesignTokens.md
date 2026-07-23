# Design Tokens

`packages/ui/src/styles.css` es el contrato canónico web. Tres capas: valores base privados, aliases semánticos públicos y tokens específicos de componente solo cuando una necesidad no puede expresarse con aliases.

Familias: canvas/surface/subtle; foreground default/muted/inverse; border/focus/overlay; success/warning/danger/info/offline/sync; spacing 1–6; typography sans/mono; radius; elevation; opacity; motion; z-index; control height y touch target.

Modos soportados:

- claro por defecto y oscuro con `[data-theme=dark]`;
- densidad cómoda, compacta y táctil POS mediante `[data-density]`;
- reducción de movimiento con `prefers-reduced-motion`;
- high contrast future-ready mediante `forced-colors`.

Reglas: no usar hex/rgb fuera del archivo canónico; no usar `transition: all`; los estados conservan texto/icono; branding del negocio solo ocupa superficies decorativas controladas y nunca reemplaza estados ni focus.
