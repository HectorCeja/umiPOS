# NEXO Design Language V1

Esta carpeta es la especificación normativa del sistema visual congelado de NEXO. Define cómo mantener y extender la experiencia Web y cómo trasladar sus reglas a otras superficies sin diseñar un sistema paralelo.

## Alcance

La especificación cubre identidad, tokens, tipografía, espacio, layouts, componentes, Motion, LivingScene, Artwork, composición editorial, responsive, accesibilidad, rendimiento, QA visual y paridad Flutter. Describe la implementación aprobada; no conserva exploraciones ni alternativas descartadas.

## Cómo usarla

1. Lea [NEXO_DESIGN_LANGUAGE.md](NEXO_DESIGN_LANGUAGE.md) para entender el sistema completo.
2. Use los capítulos 01–06 para decisiones visuales fundamentales.
3. Consulte 07–12 al implementar componentes, movimiento, escenas y layouts adaptativos.
4. Aplique 13–16 como gates obligatorios de accesibilidad, rendimiento y aprobación.
5. Use 17–19 para revisar implementaciones concretas.
6. Lea 20 para comprender la intención cultural y emocional del producto.

## Documentos

- [NEXO Design Language](NEXO_DESIGN_LANGUAGE.md)
- [01 — Brand DNA](01_BRAND_DNA.md)
- [02 — Design Principles](02_DESIGN_PRINCIPLES.md)
- [03 — Color System](03_COLOR_SYSTEM.md)
- [04 — Typography](04_TYPOGRAPHY.md)
- [05 — Spacing System](05_SPACING_SYSTEM.md)
- [06 — Layout System](06_LAYOUT_SYSTEM.md)
- [07 — Component Library](07_COMPONENT_LIBRARY.md)
- [08 — Motion System](08_MOTION_SYSTEM.md)
- [09 — LivingScene Engine](09_LIVING_SCENE_ENGINE.md)
- [10 — Artwork System](10_ARTWORK_SYSTEM.md)
- [11 — Editorial System](11_EDITORIAL_SYSTEM.md)
- [12 — Responsive System](12_RESPONSIVE_SYSTEM.md)
- [13 — Accessibility](13_ACCESSIBILITY.md)
- [14 — Performance](14_PERFORMANCE.md)
- [15 — Flutter Parity](15_FLUTTER_PARITY.md)
- [16 — Visual QA](16_VISUAL_QA.md)
- [17 — Do and Don’t](17_DO_AND_DONT.md)
- [18 — Component Patterns](18_COMPONENT_PATTERNS.md)
- [19 — Screen Patterns](19_SCREEN_PATTERNS.md)
- [20 — Visual Language Philosophy](20_VISUAL_LANGUAGE_PHILOSOPHY.md)
- [Design Language Report](DESIGN_LANGUAGE_REPORT.md)
- [Design Language Audit](DESIGN_LANGUAGE_AUDIT.md)

## Fuente de verdad

La autoridad es esta documentación respaldada por la implementación congelada. Los valores ejecutables viven en `packages/ui/src/styles.css` y en la cascada final de `apps/web/src/app/styles.css`, `optical-layout.css` e `immersion-layout.css`. Si una copia histórica contradice estos documentos, esta especificación y la implementación aprobada prevalecen. Cualquier cambio futuro requiere versión, evidencia visual y aprobación conforme a [Visual QA](16_VISUAL_QA.md).

Estado normativo: **FROZEN · VERSION 1.0**. Toda evolución comienza modificando esta documentación
antes del código.
