# Motion de NexoSelect

La entrada oficial dura el token rápido del Motion System y combina:

- opacidad 0 → 1;
- `translateY(-6px)` cuando abre debajo;
- `translateY(6px)` cuando abre arriba;
- escala 0.98 → 1;
- origen superior izquierdo o inferior izquierdo según placement.

No existe `translateX`, `translate3d` ni transición de las coordenadas calculadas por Floating UI. El positioner fijo y la superficie animada son nodos distintos: el primero nunca anima y el segundo anima como una sola pieza. Las opciones no tienen stagger, delay, transform ni animación propia. El panel nace debajo del trigger y limita su viewport interno en alturas reducidas; no se invierte hacia arriba. `prefers-reduced-motion` elimina la animación.
