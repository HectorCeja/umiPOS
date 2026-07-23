# 18 — Component Patterns

## KPI Cards

`KpiCard` implementa label, value opcional, detail, icon opcional y tone
success/info/warning/accent. La ausencia de value muestra skeleton y el `aria-label` anuncia
“Cargando”. Periodo, trend y sparkline no forman parte de su API actual.

## Data Cards

Title/metadata, content y action opcional dentro de una surface jerárquica. Solo usa hover/cursor/focus si la card ejecuta una acción. El contenido respira y no hereda glow indiscriminado.

## Tables

`NexoDataTable` compone caption oculto, header, body y empty opcional; comfortable/compact controlan
densidad. No incluye sort, selection, row actions, loading, error o pagination. En móvil su región es
enfocable y permite overflow; cualquier transformación adicional pertenece a la pantalla que ya la
implemente.

## Toolbars y Search

Toolbar agrupa search, filters y actions por prioridad. Search tiene label accesible y estado loading/empty. Los controles hacen wrap o pasan a drawer/sheet; no se reducen hasta perder target. `NexoToolbar` usa clase aislada y no comparte selectores globales ambiguos.

## Dropdowns y Context Selectors

Trigger: context icon, label/secondary text y chevron con separación amplia. Open refuerza border/halo y rota chevron. Floating positioning usa bottom-start con fallbacks, flip, shift, collision padding, resize/scroll observers y portal controlado. Menu conserva ancho mínimo, scroll interno, selected y focus restore.

## Dialogs

`Dialog` usa `<dialog>` modal con title, description opcional, content y actions; conserva Escape y
restore focus. `Sheet` es alias de `Drawer` y `BottomSheet` es una variante separada; Dialog no se
transforma automáticamente en Sheet. Ninguno monta LivingScene.

## Drawers

Trigger real, scrim, panel, close, full authorized navigation/content, internal scroll y safe area. Motion rápido; reduced motion casi inmediato. Close after navigation cuando es navegación global.

## Forms

FormSection agrupa title/help/fields. Campos cortos pueden compartir dos columnas; contenido largo usa una. Dirty/saving/saved/error son explícitos. Action bar sticky no tapa fields. Validation se asocia a campo/form y no revela detalles sensibles.

## Empty States

`EmptyState` contiene title, description y action opcional dentro de Card. Padding y distribución
vertical preservan respiración; icon/artwork no son props de la primitive. Sin datos, restricted,
unavailable y error se componen con primitives distintas.

## Loading/error/retry

Skeleton refleja composición y reduced motion. Error parcial permanece en su sección. Retry conserva contexto. Una falla no reemplaza todo el dashboard si otras fuentes están disponibles.
