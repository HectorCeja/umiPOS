# Authentication Performance Budgets

## Presupuestos iniciales

Medición: infraestructura Compose local, PostgreSQL 18, Redis 8.2, API de producción y E2E real del 2026-07-12. Son objetivos de regresión, no un SLO de producción hasta medir hardware/carga representativos.

| Operación            | Presupuesto p95 warmed | Evidencia observada local                       |
| -------------------- | ---------------------- | ----------------------------------------------- |
| login                | < 300 ms               | 43–68 ms warmed; 304 ms primer request frío     |
| refresh              | < 150 ms               | 9–25 ms                                         |
| logout/revoke        | < 150 ms               | 7–11 ms                                         |
| session query        | < 150 ms               | 6–14 ms                                         |
| reset/verify request | < 400 ms               | 251 ms, incluye piso anti-enumeración de 250 ms |
| reset complete       | < 300 ms               | 54–66 ms más hashing Argon2id                   |

El primer request después de despliegue se mide aparte (`cold-start < 500 ms`) y readiness debe evitar enviar tráfico antes de inicializar dependencias. No se reduce Argon2id para ganar latencia. La prueba de carga futura debe reportar p50/p95/p99, error rate, pool PostgreSQL, Redis, CPU, memoria y saturación; login y recuperación se prueban respetando límites de abuso.

Un cambio que exceda presupuesto requiere perfilado, explicación del entorno y decisión; no se oculta elevando umbrales automáticamente.
