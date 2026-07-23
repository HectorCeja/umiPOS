# Visual QA

Referencias: `/home/hceja/Documents/nexo/login.png` (1672×941) y `/home/hceja/Documents/nexo/home.png` (1600×900). No se incrustan como UI.

Proceso: preparar fixtures; activar escena determinista; fijar es-MX/timezone; esperar fuentes; capturar viewport de referencia; producir comparación lado a lado y diff; revisar proporción, offsets, radios, tipografía, luminancia y overflow. Los snapshots nunca se actualizan automáticamente dentro del gate.

Artefactos de Parte 1 viven en `artifacts/ui-part-1/`. Diferencias inevitables deben anotarse: antialiasing por plataforma y el uso del logo tipográfico existente porque no hay un asset vectorial oficial en el repositorio.
