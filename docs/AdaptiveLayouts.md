# Adaptive Layouts

| Espacio/modo            | Navegación          | Contenido                 | Acción                           |
| ----------------------- | ------------------- | ------------------------- | -------------------------------- |
| Móvil pequeño           | bottom nav          | lista/pasos               | sticky inferior segura           |
| Móvil grande            | bottom nav          | cards + detail route      | una primaria                     |
| Tablet vertical         | rail/drawer         | pane único; carrito sheet | touch 52 px                      |
| Tablet horizontal       | rail                | catálogo + carrito        | total siempre visible            |
| Laptop                  | sidebar compactable | grid 2–3 panes            | toolbar                          |
| Desktop                 | sidebar             | panes con ancho máximo    | múltiples acciones jerarquizadas |
| POS 1024×768            | shell dedicado      | grid + carrito estrecho   | teclado/touch                    |
| POS 1366×768 / 1280×800 | shell dedicado      | grid + carrito estable    | touch density                    |

El layout responde a constraints. Modalidad de entrada se detecta con capacidades (`pointer`, teclado/focus), nunca mediante user-agent.
