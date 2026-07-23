# UX Performance Budgets

| Métrica warmed                     | Objetivo |
| ---------------------------------- | -------: |
| feedback de interacción            |  <100 ms |
| apertura de capa                   |  <100 ms |
| búsqueda local/debounced percibida |  <150 ms |
| navegación shell                   |  <300 ms |
| CLS                                |     ≤0.1 |
| INP p75 productivo                 |  ≤200 ms |
| LCP p75 administrativo             |   ≤2.5 s |

Baseline local 2026-07-14: Storybook construye correctamente; el chunk iframe ronda 1.33 MB y addons de docs/a11y dominan el entorno de documentación, no el bundle consumidor de `@nexo/ui`. La aplicación debe medir bundle por ruta y Core Web Vitals en CI/telemetría cuando existan pantallas reales. Virtualización y memoización requieren evidencia; accesibilidad y mantenibilidad no se sacrifican.
