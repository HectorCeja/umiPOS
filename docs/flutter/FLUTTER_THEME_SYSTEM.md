# Flutter theme system

`NexoTheme.dark()` es el único theme V1. No se fabrica light theme.

| Capa        | API                                                | Responsabilidad                                                      |
| ----------- | -------------------------------------------------- | -------------------------------------------------------------------- |
| Material    | `ColorScheme`, `TextTheme`, `InputDecorationTheme` | behavior, base semantics                                             |
| NEXO colors | `NexoColors`                                       | surfaces, tertiary text, offline/sync/restricted, accents for charts |
| Metrics     | `NexoMetrics`                                      | spacing, radius, blur, shadows, shell metrics                        |
| Motion      | `NexoMotion`                                       | durations/curves and reduced mode                                    |
| Density     | `NexoDensity`                                      | control/target/row/card/icon dimensions                              |

Todas las extensiones son inmutables, implementan `copyWith` y `lerp`. Focus usa blue V1; disabled combina faint con la opacidad 0.55 usada por la implementación. Estados no dependen solo de color: widgets futuros añaden icon/text/semantics.

`NexoStates` resolves success, warning, danger, info, neutral, pending, syncing, offline, stale, restricted, disabled and loading from certified colors. Every result includes icon and localization key; no state is color-only.

Instrument Sans corresponde a display/headings y Manrope a body/navigation/control. Ambos variable TTF se empaquetan desde el repositorio oficial Google Fonts bajo OFL-1.1; `assets/manifest.json` fija origen, licencia y SHA-256 para goldens reproducibles.
