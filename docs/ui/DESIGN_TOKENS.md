# Design Tokens

Contrato canónico: `packages/ui/src/styles.css`. Las custom properties `--nexo-*` son la única fuente web.

- Canvas: `bg-canvas`, `bg-canvas-elevated`, `bg-sidebar`, `bg-topbar`.
- Superficies: `bg-surface`, `surface-hover`, `surface-active`, `surface-muted`.
- Texto: `text-primary`, `secondary`, `tertiary`, `muted`, estados semánticos.
- Bordes: `subtle`, `default`, `strong`, `hover`, `focus`, `accent`.
- Profundidad: `shadow-xs` a `shadow-xl`, `shadow-glow`, `shadow-focus`.
- Radios: `xs` a `2xl` y `pill`.
- Motion: duraciones instantánea, estándar, lenta y escena; curvas semánticas.

Los componentes no deben introducir hex/rgb cuando un alias semántico cubre el uso. Un valor óptico específico del mockup puede permanecer en CSS de pantalla, nunca en lógica JSX.
