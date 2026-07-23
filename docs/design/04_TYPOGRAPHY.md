# 04 — Typography

## Familias

- **Instrument Sans Variable**: display, page headings y títulos editoriales.
- **Manrope Variable**: body, navegación, controles, labels y datos.
- **SFMono-Regular / Consolas / Liberation Mono / monospace**: identificadores técnicos y contenido monoespaciado autorizado.

Los tokens fuente son `--nexo-font-display`, `--nexo-font-sans` y `--nexo-font-mono`.

Las fuentes empaquetadas son Instrument Sans Variable y Manrope Variable 5.2.8. Login/Onboarding declaran Inter como primera opción, pero Inter no está incluida; el fallback reproducible es Manrope. No se añade Inter sin una decisión de versión.

## Roles implementados

| Rol               | Familia                                        | Peso/comportamiento                                       | Uso                       |
| ----------------- | ---------------------------------------------- | --------------------------------------------------------- | ------------------------- |
| Display/editorial | Instrument Sans                                | variable; alrededor de 620 en headings finales            | frases y hero regions     |
| Page Header       | Instrument Sans                                | semibold variable                                         | título principal de ruta  |
| Section Header    | Instrument Sans                                | variable alrededor de 620 por la regla final de `h2`/`h3` | secciones y cards grandes |
| Card Title        | Instrument Sans                                | variable alrededor de 620                                 | superficies operativas    |
| Body              | Manrope                                        | regular                                                   | texto funcional           |
| Caption/metadata  | Manrope                                        | regular, color muted/faint                                | contexto secundario       |
| Navigation        | Manrope                                        | medium; active reforzado                                  | Sidebar/drawer/Topbar     |
| Button            | Manrope                                        | medium/semibold                                           | acciones                  |
| KPI value         | Instrument Sans o Manrope tabular según patrón | dominante                                                 | métricas                  |

## Escala oficial

| Rol                   | Token                                                                        | Tamaño                     |
| --------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| Display               | `--nexo-type-display-size`                                                   | `clamp(3.5rem, 7vw, 5rem)` |
| H1                    | `--nexo-type-h1-size`                                                        | `clamp(2.5rem, 5vw, 3rem)` |
| H2                    | `--nexo-type-h2-size`                                                        | `2rem`                     |
| H3                    | `--nexo-type-h3-size`                                                        | `1.5rem`                   |
| H4 / Subtitle         | `--nexo-type-h4-size`, `--nexo-type-subtitle-size`                           | `1.125rem`                 |
| Body Large            | `--nexo-type-body-large-size`                                                | `1rem`                     |
| Body                  | `--nexo-type-body-size`                                                      | `0.875rem`                 |
| Caption / Badge       | `--nexo-type-caption-size`, `--nexo-type-badge-size`                         | `0.75rem`                  |
| Label / Helper / Code | `--nexo-type-label-size`, `--nexo-type-helper-size`, `--nexo-type-code-size` | `0.8125rem`                |
| Button                | `--nexo-type-button-size`                                                    | `0.875rem`                 |

Los componentes consumen roles, no números nuevos por pantalla. Los tamaños responsive se
resuelven dentro de los tokens fluidos Display/H1; una excepción óptica debe vivir en el componente
autoritativo y quedar cubierta por regresión visual.

## Reglas

- Mantener tracking contenido; no usar uppercase o espaciado exagerado.
- Aplicar `font-variant-numeric: tabular-nums` donde la alineación numérica lo requiere.
- Conservar line-height suficiente para español y nombres largos.
- No usar placeholder como único label.
- No reducir helper text o captions por debajo de legibilidad para resolver layout.
- Un título editorial puede romper línea; un valor operativo no se oculta por estética.

Consulte [Editorial System](11_EDITORIAL_SYSTEM.md) y [Responsive](12_RESPONSIVE_SYSTEM.md).
