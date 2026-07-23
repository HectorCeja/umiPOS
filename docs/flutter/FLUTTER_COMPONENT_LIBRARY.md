# Flutter Component Library

Estado: **Part 2 of 5 — Component Library Foundation**. Autoridad visual: [Design Language V1](../design/NEXO_DESIGN_LANGUAGE.md). El package `nexo_flutter_design` contiene UI sin dominio, red, persistencia ni navegación productiva.

## Capas

| Capa         | Archivos            | Responsabilidad                                       |
| ------------ | ------------------- | ----------------------------------------------------- |
| Primitives   | `primitives.dart`   | surface, divider, tooltip, size/tone contracts        |
| Controls     | `controls.dart`     | buttons, fields, selection, chips, status             |
| Feedback     | `feedback.dart`     | loading, empty, notice, toast                         |
| Data display | `data_display.dart` | cards, product tile, list, numeric, table, pagination |
| Overlays     | `overlays.dart`     | dialog, adaptive sheet, anchored menu                 |
| Patterns     | `patterns.dart`     | tabs, toolbar, page header, form section/group        |

Todos consumen `NexoTheme`, sus extensions y tokens generados. Feature UI compone estas APIs fuera del package.

## Regla pública

Los constructors son inmutables, las variantes son enums y los callbacks expresan interacción sin introducir estado de negocio. Fixtures del showcase están rotulados como visuales. LivingScene, carrito, venta, pagos y offline productivo permanecen fuera de alcance.
