# NEXO Design Language V1

NEXO es un sistema operativo visual para negocios. Su interfaz convierte operaciones complejas en una experiencia calmada, precisa y contextual. La identidad no depende de un efecto aislado: surge de la relación entre un canvas oscuro, superficies jerárquicas, tipografía editorial, movimiento discreto, escenas vivas y datos operativos legibles.

## Identidad

NEXO transmite control, claridad, inteligencia, sofisticación, estabilidad y confianza operativa. Es cinematográfico sin ser promocional; premium sin ostentación; tecnológico sin lenguaje gamer o cyberpunk. Consulte [Brand DNA](01_BRAND_DNA.md) y [Visual Language Philosophy](20_VISUAL_LANGUAGE_PHILOSOPHY.md).

## Arquitectura visual

```text
Brand DNA
  ├─ Foundations: color · type · spacing
  ├─ Structure: shell · layout · responsive
  ├─ Interaction: components · motion · accessibility
  ├─ Atmosphere: LivingScene · artwork · editorial system
  └─ Governance: performance · visual QA · parity
```

El shell fijo ancla la operación. Sidebar y Topbar permanecen estables; solo el contenido de ruta se desplaza. LivingScene aporta continuidad detrás del producto sin alterar su chrome. El contenido conserva personalidad por módulo mediante composición editorial, scene variant y artwork registrado.

## Principios operativos

- La información y la acción tienen prioridad sobre el efecto.
- La profundidad diferencia jerarquías; no convierte cada card en vidrio brillante.
- El movimiento explica estado, continuidad o ambiente; nunca retrasa la tarea.
- El espacio crea calma y legibilidad sin eliminar densidad operativa.
- La escena aporta contexto, pero no determina permisos, datos ni navegación.
- Responsive conserva capacidades; no oculta módulos por falta de espacio.

## Relación entre documentos

Los capítulos [Color](03_COLOR_SYSTEM.md), [Typography](04_TYPOGRAPHY.md) y [Spacing](05_SPACING_SYSTEM.md) forman la base. [Layout](06_LAYOUT_SYSTEM.md), [Components](07_COMPONENT_LIBRARY.md) y [Patterns](18_COMPONENT_PATTERNS.md) materializan esa base. [Motion](08_MOTION_SYSTEM.md), [LivingScene](09_LIVING_SCENE_ENGINE.md), [Artwork](10_ARTWORK_SYSTEM.md) y [Editorial](11_EDITORIAL_SYSTEM.md) añaden continuidad y carácter. [Responsive](12_RESPONSIVE_SYSTEM.md), [Accessibility](13_ACCESSIBILITY.md) y [Performance](14_PERFORMANCE.md) son requisitos, no capas opcionales. [Visual QA](16_VISUAL_QA.md) gobierna cualquier cambio.

## Regla normativa

No se crea una tercera interpretación. Una futura pantalla reutiliza tokens, shell, primitives, motion y scene variants existentes. Cuando una capacidad no esté especificada, se registra como hueco y se somete a decisión; no se inventa silenciosamente.
