# 05 — Spacing System

## Escala base

| Paso | Valor   |
| ---- | ------- |
| 1    | 0.25rem |
| 2    | 0.5rem  |
| 3    | 0.75rem |
| 4    | 1rem    |
| 5    | 1.5rem  |
| 6    | 2rem    |

Los tokens son `--nexo-space-1`, `--nexo-space-2`, `--nexo-space-3`, `--nexo-space-4`,
`--nexo-space-5` y `--nexo-space-6`. Radius usa `--nexo-radius-xs`,
`--nexo-radius-sm`, `--nexo-radius-md`, `--nexo-radius-lg`, `--nexo-radius-xl`,
`--nexo-radius-2xl` y `--nexo-radius-pill`.

La escala gobierna gaps, padding y ritmo. Control base: 2.75rem; compact: 2.25rem; touch density: 3.25rem. Radios asociados: 0.375, 0.5, 0.75, 1.05, 1.4 y 1.875rem; pill 999px.

## Profundidad y blur asociados

El contrato ejecutable incluye shadows `1`, `2`, `xs`, `sm`, `md`, `lg`, `xl`, `glow` y
`focus`: `0 12px 32px rgb(31 33 61 / 6%)`, `0 24px 64px rgb(25 26 52 / 20%)`,
`0 1px 2px rgb(2 4 12 / 16%)`, `0 8px 24px rgb(2 4 12 / 18%)`,
`0 18px 44px rgb(2 4 12 / 24%)`, `0 28px 72px rgb(2 4 12 / 32%)`,
`0 42px 110px rgb(2 4 12 / 46%)`, `0 0 42px rgb(128 104 255 / 24%)` y
`0 0 0 3px rgb(77 159 255 / 36%)`. Blur surface/overlay/aurora es `18px`/`28px`/`50px`.
Overlay y toast usan z-index `40` y `60`.

Los tokens de profundidad son `--nexo-shadow-1`, `--nexo-shadow-2`, `--nexo-shadow-xs`,
`--nexo-shadow-sm`, `--nexo-shadow-md`, `--nexo-shadow-lg`, `--nexo-shadow-xl`,
`--nexo-shadow-glow`, `--nexo-shadow-focus`, `--nexo-blur-surface`, `--nexo-blur-overlay`,
`--nexo-blur-aurora`, `--nexo-z-overlay` y `--nexo-z-toast`. Dimensión de control usa
`--nexo-control-height` y `--nexo-touch-target`.

La capa óptica final define padding de card inline
`clamp(1.35rem, 1.8vw, 1.65rem)` y block `clamp(1.25rem, 1.6vw, 1.5rem)`. La compatibilidad web
activa conserva radius de control `12px`, radius de card `18px` y shadow
`0 18px 54px rgb(0 0 0 / 20%)`; no son una escala adicional.

## Respiración

Ningún contenido importante queda pegado al borde de una superficie premium. Page headers, empty states, toolbars, búsquedas y CTAs preservan aire lateral y vertical. La corrección óptica final forma parte de V1: centrar matemáticamente no basta si el icono, texto o bloque se percibe desplazado.

## Aplicación

- Cards: padding coherente con densidad; title/content y bloques tienen separación visible.
- Inputs: el contenedor separa label, control, helper y borde de card.
- Buttons: padding inline permite respirar a icono y texto; gap no se comprime a 2–4px.
- Tables: densidad compacta reduce filas y padding, no targets interactivos esenciales.
- Page gutters: responden al viewport; no se resuelven con offsets por pantalla.

## Excepciones ópticas

Se permite romper la escala cuando el render final requiere alineación óptica documentada: iconos con bounding box asimétrico, títulos editoriales o strokes que desplazan el centro percibido. La excepción vive en el componente o primitive, nunca como margen mágico por ruta.

## Densidades

`comfortable` es el default de `NexoDataTable`. `compact` existe como variante de esa tabla y como
override de control/touch target; las rutas productivas actuales no activan globalmente
`data-density="compact"`. `touch` se demuestra en las superficies touch/POS de Storybook.
