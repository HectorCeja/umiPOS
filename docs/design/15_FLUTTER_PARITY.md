# 15 — Flutter Parity

## Estado

V1 no incluye código Flutter ejecutable. No existen widgets, tema, goldens ni build Flutter en el repositorio. Este documento define el contrato de réplica; una implementación futura solo puede declararse equivalente con evidencia.

## Foundations

Flutter debe consumir una exportación versionada de los tokens V1, no transcribir valores manualmente. Instrument Sans corresponde a display/headings; Manrope a UI/body; monospace a datos técnicos autorizados. Canvas, surfaces, line, text y accents conservan valores de [Color](03_COLOR_SYSTEM.md).

## Components

Cada widget debe mapear propósito, anatomía, variants, states, focus/keyboard/touch, reduced motion y semantics del componente Web. Aliases legacy del paquete no se trasladan como patrones nuevos. POS/Cash/Sales usan las mismas semánticas, no necesariamente el mismo árbol de widgets.

## Layout/adaptive

El equivalente administrativo mantiene shell estable, navegación adaptativa y content scroll. Los breakpoints Web no se copian ciegamente a píxeles Flutter: el resultado debe producir los mismos estados desktop/tablet/mobile documentados y conservar capacidades/permisos.

## Motion y LivingScene

Curvas/duraciones se traducen desde [Motion](08_MOTION_SYSTEM.md). Ambient animation pausa con lifecycle/inactive. Reduced motion elimina drift, parallax, trails y Ken Burns. Una réplica de LivingScene requiere pipeline, quality modes y registry equivalentes; si no existe, se usa fallback estático documentado, no una escena distinta.

## Accessibility

Semantics labels, traversal order, focus, keyboard, text scaling, contrast y tap targets deben demostrar paridad. Un golden visual no prueba accesibilidad.

## Certificación requerida

- tokens generados/versionados;
- catálogo de widgets y estados;
- adaptive matrix;
- golden tests en viewports/densidades fijados;
- reduced motion y lifecycle tests;
- comparación Web/Flutter aprobada;
- registro de diferencias inevitables de rendering.

Hasta cumplir lo anterior, el estado oficial es **especificación disponible; paridad ejecutable inexistente**.
