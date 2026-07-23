# Component performance

Baseline del gate final Linux headless (2026-07-16; microsegundos, una muestra de test): product grid 100 = 388775; list 100 = 92171; table 100 = 184591; showcase startup = 142996; dialog open = 107825; menu open = 64704. Son observaciones, no budgets universales.

La implementación evita controller por row, `BackdropFilter` por defecto, intrinsic layout y lógica por frame. Glass consulta quality mode. Riesgos a medir en app: image decode/cache del catálogo, virtualización real y GPU de terminal. Ninguna cifra de memoria/p95 se declara sin profile run productivo.
