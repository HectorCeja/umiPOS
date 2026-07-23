# NEXO Motion System V1

Estado: implementado para revisión visual del propietario. No constituye aprobación perceptual.

## Propósito

El movimiento explica relación, respuesta y continuidad. El shell permanece estable; cambia el canvas. Ninguna transición bloquea una acción ni compensa una jerarquía débil.

| Familia      |      Duración | Curva                       | Uso                            |
| ------------ | ------------: | --------------------------- | ------------------------------ |
| Instantánea  |         80 ms | salida lineal               | pressed, selección y highlight |
| Micro        |        140 ms | `cubic-bezier(.2,.8,.2,1)`  | hover, foco e iconos           |
| Componente   |        220 ms | `cubic-bezier(.22,1,.36,1)` | menús, cards y selectores      |
| Espacial     |        320 ms | `cubic-bezier(.16,1,.3,1)`  | ruta, onboarding y capas       |
| Confirmación | 480 ms máximo | secuencia amortiguada       | finalizaciones excepcionales   |

Desplazamiento máximo: 8 px en microinteracción y 24 px en capas. Press usa escala 0.985. Las rutas aplican opacidad, 8 px verticales y blur inicial de 2 px, sin mover el shell. Menús usan opacidad, 6 px y escala 0.98. Cards clicables elevan 2 px.

## Ambiente

Login, onboarding e Inicio usan dos halos ambientales con deriva de 22 segundos y noise monocromo al 2.2 %. Las pantallas de datos conservan una intensidad menor. La implementación usa `transform` y `opacity`, no produce layout shift ni intercepta interacción.

## Reduced motion

`prefers-reduced-motion: reduce` detiene la deriva, elimina transformación, blur y entrada espacial, conserva feedback instantáneo y no cambia el significado de ningún estado.

## Gate

- El movimiento no debe retrasar interacción.
- Focus y estado nunca dependen de animación.
- No hay partículas, video, GIF, parallax agresivo ni loops de alta frecuencia.
- La aprobación perceptual permanece pendiente del propietario.
