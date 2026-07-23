# 13 — Accessibility

Objetivo normativo: WCAG 2.2 AA dentro del alcance implementado.

## Semántica

Una pantalla tiene un h1, landmarks distinguibles, labels reales, botones/enlaces nativos, listas/tablas cuando corresponde y `aria-current` en navegación. Loading/error se anuncian solo cuando aporta valor.

## Keyboard y focus

- Todo control funciona con Tab/Shift+Tab y Enter/Space según patrón.
- Escape cierra drawer, dialog, menu y palette.
- Focus trap se limita a overlays modales; al cerrar vuelve al trigger.
- El ring permanece visible sobre canvas, surface, aurora y artwork.
- Focus dentro de un panel scrolleable no queda oculto bajo actions sticky.

## Forms

Label persistente, help/error asociado, invalid no depende de color. Password reveal y icon buttons tienen nombre dinámico. Submit loading evita duplicados. Se conservan valores no sensibles y el error seguro recibe foco cuando corresponde.

## Navigation y overlays

Sidebar/drawer exponen el mismo conjunto autorizado. Context selectors expresan expanded/controls
y abren/focalizan el primer o último item con ArrowDown/ArrowUp; Enter/Space provienen del button y
Escape restaura foco. Command Palette usa Dialog, SearchInput, listbox/options y restore focus; su
navegación actual es Tab/Shift+Tab, no active-descendant ni flechas internas.

## Data y charts

`NexoDataTable` aporta caption, headers y una región enfocable; las tables genéricas dependen del
consumer para caption/headers. Sort state, row actions y pagination no están integrados en esa
primitive. Reportes no renderiza charts de series en V1 y comunica la ausencia mediante EmptyState.

## Contrast

Texto primario/secundario, focus, disabled, badges, borders de estado y charts se validan sobre la escena real. Scrims estabilizan luminancia detrás de contenido; no se degrada texto para conservar una foto.

## Motion

Reduced motion muestra contenido de inmediato y elimina parallax, Ken Burns, drift, trails y partículas móviles. Feedback esencial permanece.

## Zoom, reflow y touch

La interfaz conserva contenido a 320 CSS px, 200% y 400% cuando aplica. No hay solapamiento crítico ni horizontal overflow accidental. Targets táctiles usan la densidad touch; ninguna tarea depende de hover.

## Gate

Cero violaciones serious/critical de axe en pantallas objetivo y overlays abiertos. Una prueba automática no sustituye recorrido de teclado, zoom y lector de pantalla conceptual.
