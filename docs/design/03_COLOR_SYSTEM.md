# 03 — Color System

## Paleta canónica V1

| Función             | Token                      | Valor                    |
| ------------------- | -------------------------- | ------------------------ |
| Canvas              | `--v1-canvas`              | `#070912`                |
| Canvas elevado      | `--v1-canvas-2`            | `#0b0f1c`                |
| Surface             | `--v1-surface`             | `#101627`                |
| Surface elevada     | `--v1-surface-raised`      | `#161d32`                |
| Surface interactiva | `--v1-surface-interactive` | `#1d2640`                |
| Border              | `--v1-line`                | `rgb(255 255 255 / 8%)`  |
| Border fuerte       | `--v1-line-strong`         | `rgb(255 255 255 / 15%)` |
| Texto primario      | `--v1-text`                | `#f7f8fc`                |
| Texto secundario    | `--v1-muted`               | `#b3bbd0`                |
| Texto terciario     | `--v1-faint`               | `#7f89a3`                |
| Violeta             | `--v1-violet`              | `#8068ff`                |
| Violeta hover       | `--v1-violet-hover`        | `#927fff`                |
| Azul                | `--v1-blue`                | `#4d9fff`                |
| Cian                | `--v1-cyan`                | `#39d9d2`                |
| Rosa                | `--v1-pink`                | `#f47cc3`                |
| Success             | `--v1-mint`                | `#55d99a`                |
| Warning             | `--v1-warning`             | `#f4c76b`                |
| Danger              | `--v1-danger`              | `#ff667a`                |

## Jerarquía

Canvas contiene escena y contenido. Surface separa bloques; raised distingue overlays y paneles de mayor profundidad; interactive señala controles o selección. Los borders nunca forman una cuadrícula blanca uniforme: line define separación tonal y line-strong se reserva para foco, open y jerarquía.

## Texto

Primario se usa para títulos, valores y acciones. Muted acompaña sin competir. Faint se reserva para metadata legible, nunca para información crítica. Blanco puro indiscriminado elimina jerarquía y no forma parte del sistema.

## Acentos y estado

Violeta identifica acción/selección de marca; azul y cian construyen ambiente y visualización; rosa aparece como acento controlado. Mint, warning y danger expresan semántica, no el signo numérico por sí solo. Un descenso puede ser positivo o negativo según el modelo de datos.

## Charts

V1 no expone tokens específicos para charts. Las visualizaciones implementadas usan valores fijos
alineados visualmente con violeta, azul y cian; Reportes muestra un empty state honesto mientras no
existe la serie temporal. Una futura serie no puede declarar un token de chart inexistente.

## Overlays y scrims

Scrims oscurecen y estabilizan contraste detrás de drawers, dialogs y artwork. No se corrige una mala fotografía cambiando colores de texto: se ajustan crop, mask, luminancia y scrim.

## Fuente ejecutable

Los tokens base viven en `packages/ui/src/styles.css`; la paleta congelada se resuelve mediante la capa terminal `--v1-*` y sus aliases en `apps/web/src/app/styles.css`. No se consumen los antiguos valores verdes `--freeze-*` previos al override V1.

## Contrato semántico del paquete

El paquete también expone los aliases ejecutables `--nexo-bg-*`, `--nexo-fg-*`, `--nexo-text-*`,
`--nexo-border-*`, `--nexo-action`, `--nexo-focus`, `--nexo-success`, `--nexo-warning`,
`--nexo-danger`, `--nexo-info`, `--nexo-offline`, `--nexo-sync` y `--nexo-overlay`. El tema oscuro
reasigna canvas `#070912`, surface `#101627`, subtle `#1d2640`, selected `#27244e`, foreground
`#f7f8fc`, muted `#b3bbd0`, action `#8068ff`, hover `#927fff`, focus/info `#4d9fff`, success
`#55d99a`, warning `#f4c76b`, danger `#ff667a`, offline `#e2b65a`, sync `#39d9d2` y overlay
`rgb(0 0 0 / 70%)`. La aplicación autenticada fija este tema oscuro.

La declaración base del paquete —visible también en sus superficies no autenticadas de Storybook— es:

| Grupo         | Tokens y valores base                                                                                                                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background    | canvas `#f7f8fb`; elevated/surface `#fff`; sidebar `#0a0d1a`; topbar `rgb(8 11 23 / 88%)`; subtle/muted `#f0f1f6`; hover `#f4f3ff`; active `#ebe8ff`; selected `#efedff`; overlay `rgb(7 9 19 / 72%)`; scrim `rgb(2 4 12 / 72%)` |
| Foreground    | default `#191a2e`; muted `#65687c`; inverse `#fff`                                                                                                                                                                               |
| Text          | primary/default; secondary/muted; tertiary `#7f849a`; muted `#9498aa`; inverse `#fff`; accent `#6256e8`; success `#157347`; warning `#8a5800`; danger `#b42318`                                                                  |
| Border        | default `#e2e3eb`; strong `#8c8ea1`; subtle `rgb(25 26 46 / 9%)`; hover `rgb(98 86 232 / 48%)`; focus `#0969da`; accent `#6256e8`                                                                                                |
| Action/status | action `#6256e8`; hover `#5145d2`; focus `#0969da`; success `#157347`; warning `#8a5800`; danger `#b42318`; info `#075985`; offline `#6b4f00`; sync `#5b35a5`                                                                    |
| Accents       | purple `#8068ff`; blue `#4d9fff`; cyan `#39d9d2`; indigo `#604cff`; success `#55d99a`; warning `#f4c76b`; danger `#ff667a`                                                                                                       |

Los compatibility aliases públicos son `--nexo-surface`, `--nexo-surface-muted`, `--nexo-text`,
`--nexo-text-muted`, `--nexo-border` y `--nexo-primary`; apuntan a los tokens semánticos anteriores.
Custom properties locales como artwork offsets, particle index, optical padding o sidebar width son
variables de implementación documentadas en sus sistemas, no parte del API público de color.

Los nombres públicos completos son `--nexo-bg-canvas`, `--nexo-bg-canvas-elevated`,
`--nexo-bg-sidebar`, `--nexo-bg-topbar`, `--nexo-bg-surface`, `--nexo-bg-subtle`,
`--nexo-bg-surface-hover`, `--nexo-bg-surface-active`, `--nexo-bg-surface-muted`,
`--nexo-bg-overlay`, `--nexo-bg-scrim`, `--nexo-bg-selected`, `--nexo-fg-default`,
`--nexo-fg-muted`, `--nexo-fg-inverse`, `--nexo-text-primary`, `--nexo-text-secondary`,
`--nexo-text-tertiary`, `--nexo-text-muted`, `--nexo-text-inverse`, `--nexo-text-accent`,
`--nexo-text-success`, `--nexo-text-warning`, `--nexo-text-danger`, `--nexo-border-default`,
`--nexo-border-strong`, `--nexo-border-subtle`, `--nexo-border-hover`, `--nexo-border-focus`,
`--nexo-border-accent`, `--nexo-action`, `--nexo-action-hover`, `--nexo-focus`,
`--nexo-success`, `--nexo-warning`, `--nexo-danger`, `--nexo-info`, `--nexo-accent-purple`,
`--nexo-accent-blue`, `--nexo-accent-cyan`, `--nexo-accent-indigo`, `--nexo-accent-success`,
`--nexo-accent-warning`, `--nexo-accent-danger`, `--nexo-offline`, `--nexo-sync` y
`--nexo-overlay`.
