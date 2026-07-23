# Sales Administration Performance

Budgets warmed: overview/history/refunds/timeline 250 ms p95; detail 200 ms; exceptions/diagnostic 300 ms. El harness `tests/performance/sales-administration.mjs` mide p50/p95/max con dataset seed. La ejecución final está en `artifacts/sales-administration-certification/performance.json`; las nueve operaciones permanecieron dentro de budget (20 muestras cada una; peor p95 observado 35.01 ms).
