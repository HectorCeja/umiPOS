# Prepare and seed idempotency

| Ejecución                 | Resultado      | Tiempo |
| ------------------------- | -------------- | -----: |
| Prepare 1, rebuild frío   | PASS / 8 READY |  358 s |
| Prepare 2, cache caliente | PASS / 8 READY |   69 s |
| Prepare 3, cache caliente | PASS / 8 READY |   69 s |

Los logs completos están en `artifacts/owner-final-acceptance-master-part-2c/logs/prepare-*.log`.
No hubo FK, transacción parcial ni modificación del centinela owner.
