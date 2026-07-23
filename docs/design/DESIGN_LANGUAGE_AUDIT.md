# NEXO Design Language V1 — Consistency Audit

Fecha: 2026-07-16

## Resumen ejecutivo

Los 23 documentos generados en Parte 2 fueron contrastados con la implementación congelada, tokens,
exports públicos, Motion, LivingScene, Artwork Registry, rutas, responsive y evidencia final. La
auditoría encontró afirmaciones más amplias que la API real; se corrigieron exclusivamente esos
ERROR documentales. No se modificó implementación, UI, Storybook, Flutter, tokens, assets, tests ni
snapshots.

Resultado final: **0 ERROR abiertos**, enlaces internos válidos y cobertura completa de tokens
públicos/componentes exportados.

## Documentos auditados

| Documento                        | Estado | Cobertura verificada                                 |
| -------------------------------- | ------ | ---------------------------------------------------- |
| README.md                        | PASS   | propósito, orden, autoridad y enlaces                |
| NEXO_DESIGN_LANGUAGE.md          | PASS   | identidad y arquitectura visual                      |
| 01_BRAND_DNA.md                  | PASS   | personalidad/tono aprobados                          |
| 02_DESIGN_PRINCIPLES.md          | PASS   | principios sin persistencia ficticia                 |
| 03_COLOR_SYSTEM.md               | PASS   | V1 + contrato semántico público completo             |
| 04_TYPOGRAPHY.md                 | PASS   | fuentes empaquetadas, roles y fallback real          |
| 05_SPACING_SYSTEM.md             | PASS   | spacing, radius, shadow, blur, density y z-index     |
| 06_LAYOUT_SYSTEM.md              | PASS   | shell fijo, scroll, subnav y límites de persistencia |
| 07_COMPONENT_LIBRARY.md          | PASS   | 144/144 exports públicos nombrados y API real        |
| 08_MOTION_SYSTEM.md              | PASS   | tokens, curvas y duraciones exactas                  |
| 09_LIVING_SCENE_ENGINE.md        | PASS   | pipeline, variants, quality y lifecycle reales       |
| 10_ARTWORK_SYSTEM.md             | PASS   | registry, assets, intensidades y crops               |
| 11_EDITORIAL_SYSTEM.md           | PASS   | props/tones reales de NexoEditorialHeader            |
| 12_RESPONSIVE_SYSTEM.md          | PASS   | breakpoints y artwork móvil reales                   |
| 13_ACCESSIBILITY.md              | PASS   | comportamiento observable sin APIs inventadas        |
| 14_PERFORMANCE.md                | PASS   | capacidades existentes y presupuestos no definidos   |
| 15_FLUTTER_PARITY.md             | PASS   | especificación; implementación declarada inexistente |
| 16_VISUAL_QA.md                  | PASS   | aprobación, freeze y baselines                       |
| 17_DO_AND_DONT.md                | PASS   | reglas coherentes con V1                             |
| 18_COMPONENT_PATTERNS.md         | PASS   | contratos compuestos limitados a primitives reales   |
| 19_SCREEN_PATTERNS.md            | PASS   | 11 familias/pantallas y estados reales               |
| 20_VISUAL_LANGUAGE_PHILOSOPHY.md | PASS   | narrativa consistente sin API técnica                |
| DESIGN_LANGUAGE_REPORT.md        | PASS   | manifiesto, correcciones y freeze                    |

## Cobertura

| Área                                        | Resultado                                                         |
| ------------------------------------------- | ----------------------------------------------------------------- |
| Documentos obligatorios de Parte 2          | 23/23 auditados                                                   |
| Exports públicos `@nexo/ui`                 | 144/144 nombrados                                                 |
| Tokens públicos CSS                         | 109/109 referenciados                                             |
| LivingScene variants tipadas                | 16/16 registradas en documentación                                |
| Variantes autenticadas del Artwork Registry | 14/14 cubiertas                                                   |
| Assets oficiales                            | 4 fotográficos + 2 cinematográficos verificados                   |
| Rutas Web                                   | todas las rutas `page.tsx`, incluidos aliases Sales, clasificadas |
| Flutter ejecutable                          | 0; estado documentado correctamente                               |

## Coherencia y terminología oficial

- `NexoAppShell`: implementación canónica reutilizada; no “GlobalShell”.
- `Sidebar`, `Topbar`, `RouteContent`: chrome/layout oficial.
- `LivingScene`: engine autenticado; `AmbientExperience`: Login/Onboarding.
- `Artwork Registry`: única relación variant → asset/crop/intensity.
- `Context Selector`: selector flotante de organización/sucursal.
- `Command Palette`: nombre oficial del diálogo global.
- `NexoEditorialHeader`: componente actual con tones `sales` y `cash`.
- `Button`: variants `primary`, `secondary`, `danger`.

Los aliases genéricos de `admin.tsx` y las variables CSS locales se describen como implementación o
compatibilidad, no como un segundo sistema oficial.

## Referencias cruzadas

La comprobación automatizada valida archivos y anchors Markdown. README enlaza todos los capítulos,
el índice maestro enlaza cada sistema relacionado y el reporte enlaza este audit. Resultado final:
0 archivos/anchors rotos.

## Hallazgos corregidos

| ID     | Clasificación inicial | Hallazgo                                                                        | Corrección documental                                            |
| ------ | --------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| DL-001 | ERROR                 | Button incluía `ghost`; IconButton sugería tone danger                          | se limitaron a las props reales                                  |
| DL-002 | ERROR                 | Card titles se atribuían a Manrope                                              | se corrigieron a Instrument Sans por la regla final h1/h2/h3     |
| DL-003 | ERROR                 | tokens de motion confundían normal/standard/slow                                | se fijaron 180/220/320ms y nombres exactos                       |
| DL-004 | ERROR                 | faltaban nombres exactos de color/depth/layout tokens                           | se documentaron 109/109 tokens públicos                          |
| DL-005 | ERROR                 | se afirmaba persistencia del shell/scene entre rutas                            | se documentó remount posible y crossfade vía sessionStorage      |
| DL-006 | ERROR                 | quality se describía como reducción general de movimiento                       | se limitó a partículas; static también congela                   |
| DL-007 | ERROR                 | Search, FileUpload, EmptyState, Table y KPI incluían estados/props inexistentes | se alineó cada anatomía con su API pública                       |
| DL-008 | ERROR                 | NexoEditorialHeader se presentaba genérico/alineable                            | se fijaron props y tones `sales`/`cash`                          |
| DL-009 | ERROR                 | artwork móvil se describía como estático                                        | se registró crop móvil con drift; static solo por reduced/static |
| DL-010 | ERROR                 | se afirmaban chart tokens/engine y series en Reportes                           | se documentó su inexistencia y el EmptyState real                |
| DL-011 | ERROR                 | Command Palette afirmaba active-descendant/flechas                              | se documentó Dialog + Tab/Shift+Tab + buttons                    |
| DL-012 | ERROR                 | Performance afirmaba virtualización/server filtering genéricos                  | se limitó a rows/rowKey y NexoPagination separada                |

## Warnings abiertos

| ID     | Clasificación | Hallazgo                                                               | Impacto                                                   |
| ------ | ------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| DL-W01 | WARNING       | `admin.tsx` exporta AppShell/Sidebar/Topbar/MobileNavigation genéricos | no se usan como chrome productivo; quedan etiquetados     |
| DL-W02 | WARNING       | no existe implementación Flutter                                       | la paridad se declara como especificación, no como código |
| DL-W03 | WARNING       | no existen chart tokens ni chart engine V1                             | Reportes muestra estado honesto; no afecta exactitud      |
| DL-W04 | WARNING       | no hay budgets numéricos normativos de KB/LCP/INP/memoria              | el documento exige medir sin inventar cifras              |
| DL-W05 | WARNING       | la certificación browser final es Chromium                             | Firefox/WebKit no se declaran certificados                |

Ningún WARNING contradice la implementación o autoriza cambios de UI.

## Tokens

PASS. Se verificaron color, typography families, spacing, radius, shadow, blur, control/touch,
motion/easings y z-index. Custom properties internas (`artwork-x/y`, particle index, optical padding,
sidebar width) están descritas dentro de su sistema y no se presentan como API pública.

## Componentes

PASS. Todos los exports están nombrados. Aliases se identifican como aliases. El componente
productivo `NexoEditorialHeader` y `NexoAppShell` se documentan en su ubicación Web. No se atribuyen
sort, virtualization, active-descendant, progress upload o props editoriales que no existen.

## Motion

PASS. Tokens 80/100/180/220/320ms y scene 30s; reveal 420/700ms con delays; artwork 38s,
crossfade 1600ms, trails/particles 26s, auroras 47/53/59/43s, halos 19/23s y light leak 37s.
Reduced motion y Page Visibility coinciden con CSS/TS.

## LivingScene y Artwork

PASS. Pipeline, 16 variants, quality 22/14/6/0, static mode, pointer parallax ±4px/±2.5px,
preload y crossfade coinciden. Home/Sales/Cash usan womanpos; Products/Catalog products; Inventory
inventory; Reports analytics; las variantes administrativas usan abstract.

## Responsive

PASS. Drawer a 64rem, crop móvil a 48rem, grids Home a 1180/850/520px y reglas internas existentes
se distinguen. No se documenta bottom nav ni ocultamiento ordinal. Mobile conserva artwork drift salvo
reduced/static y elimina pointer parallax/trails.

## Flutter

PASS. No se afirma código, widgets, theme, goldens o build. El capítulo define exclusivamente el
contrato que una implementación futura deberá certificar.

## Design Freeze

```text
DESIGN LANGUAGE
STATUS  FROZEN
VERSION 1.0
```

Toda modificación futura al sistema visual debe comenzar actualizando esta documentación y su versión
antes de modificar la implementación. El cambio requiere evidencia visual y el proceso de
[Visual QA](16_VISUAL_QA.md).

## Quality Gate final

- 24/24 documentos esperados presentes; ninguno vacío.
- 78 referencias internas verificadas; 0 archivos o anchors rotos.
- 144/144 componentes públicos nombrados.
- 109/109 tokens públicos referenciados.
- 16/16 LivingScene variants y 14/14 variants autenticadas cubiertas.
- 13/13 valores críticos de registry/asset y 13/13 valores de Motion comprobados.
- Prettier: PASS para todo `docs/design/`.
- ERROR abiertos: 0.

El resultado ntfy se registra en `artifacts/design-language-v1-audit/ntfy-result.json` sin topic ni
token.
