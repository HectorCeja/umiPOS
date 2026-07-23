# NEXO Design System

`@nexo/ui` es la única fuente oficial de componentes web. Contiene presentación, interacción accesible y composición; no conoce Sales, Inventory, tenants ni Prisma. Recibe datos ya autorizados y montos ya calculados, y emite intenciones.

Principios: HTML nativo primero; composición sobre configuración extensa; aliases semánticos; keyboard/touch equivalentes; estados explícitos; API pequeña y tipada. Componentes complejos deben seguir WAI-ARIA APG y probar foco, escape, nombre accesible y reducción de movimiento.

Motion tokens: fast 100 ms, normal 180 ms, easing estándar. Motion comunica continuidad/feedback, nunca resultado único; reduced-motion lleva duraciones a cero. Capas: contenido, sticky, overlay (40), toast (60).

La gobernanza exige story, tests relevantes, revisión de accesibilidad, visual baseline justificada y changelog/ADR si rompe un contrato transversal.
