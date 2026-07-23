# Sales Performance Budgets

## Presupuestos

Objetivos p95 warmed: create 150 ms; add 120 ms; checkout 200 ms; suspend/resume 150 ms; complete cash 350 ms; get 120 ms; list active 200 ms. Consistencia, RLS y autorización permanecen activas durante la medición.

## Evidencia local — 2026-07-14

Ambiente: Docker local warmed, una API y un worker, PostgreSQL 18 y Redis 8.2.1; AMD Ryzen 5 3600 (6c/12t), 15 GiB RAM, Docker 29.6.1 y Compose 5.3.1. Medición extremo a extremo con sesión real, RLS y autorización DB:

| Operación   | Muestras |     p50 |     p95 |  Máximo | Presupuesto | Resultado |
| ----------- | -------: | ------: | ------: | ------: | ----------: | --------- |
| List Sales  |      200 | 17.6 ms | 23.6 ms | 42.6 ms |      200 ms | 🟢        |
| Create Sale |      200 | 24.2 ms | 28.9 ms | 33.7 ms |      150 ms | 🟢        |

La regresión E2E warmed aportó además evidencia orientativa: add 44 ms, checkout 50 ms, complete 53 ms, suspend 22 ms y resume 14 ms como máximos observados en esa ejecución. Estas muestras pequeñas no sustituyen un benchmark de carga; los presupuestos restantes quedan como guardrails y deberán medirse con ≥200 muestras antes de un piloto de volumen.
