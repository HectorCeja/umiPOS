# Inventory — Saldo por estado

“Consultar existencias” espera la respuesta real, desplaza suavemente al bloque actualizado, coloca
focus en su contenedor y lo resalta durante 1.8 segundos. `prefers-reduced-motion` usa movimiento
instantáneo y `scroll-margin-top` evita la topbar.

Cada estado se presenta como tarjeta editorial con valor grande, explicación comercial, color
semántico, glass, hover y grid responsive. Durante la consulta aparece un skeleton; sin selección se
mantiene un empty state educativo.

Pruebas: `inventory-scroll-highlight.spec.ts` e `inventory-dashboard-redesign.spec.ts`.
