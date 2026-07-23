# Motion System

Feedback instantáneo: 80 ms. Microinteracción: 100–180 ms. Transición de componente: 220 ms. Transición espacial: 320 ms. Ambiente: 19–59 s.

Solo se animan `transform` y `opacity` en loops ambientales. Hover eleva como máximo 1–2 px; press conserva layout. Focus no depende de animación.

`prefers-reduced-motion` detiene Ken Burns, auroras, halos, light leaks y partículas. `LivingScene` aplica `is-static` en modo determinista, calidad estática, movimiento deshabilitado o documento oculto. Ningún contenido comienza invisible.
