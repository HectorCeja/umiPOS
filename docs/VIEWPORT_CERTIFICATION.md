# Viewport Certification

La aplicación autenticada usa una superficie de scroll deliberada (`.product-shell > .unified-content`) mientras el documento permanece fijo. La prueba anterior que exigía scroll del `window` no representaba esta arquitectura.

| Escenario       | Viewport equivalente | Resultado técnico                       |
| --------------- | -------------------: | --------------------------------------- |
| Desktop         |           1280 × 720 | contenido accesible, scroll interno     |
| DevTools docked |            820 × 560 | contenido accesible, scroll interno     |
| Tablet          |           768 × 1024 | navegación y contenido accesibles       |
| Móvil           |            390 × 720 | navegación móvil y safe area accesibles |

La regresión comprueba overflow vertical de la superficie real, capacidad de llegar al final, heading visible y Console/Network limpios. La aprobación visual final corresponde al owner.
