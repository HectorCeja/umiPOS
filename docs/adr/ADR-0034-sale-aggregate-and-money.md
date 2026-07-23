# ADR-0034: Aggregate Sale y dinero decimal determinista

- Estado: Aceptada
- Fecha: 2026-07-13

## Decisión

Sale es el único aggregate root de líneas, pagos asignados y lifecycle. Los importes persistidos son unidades menores `BIGINT`; contratos los serializan como strings. Cantidades usan decimal de escala 6. La aritmética de dominio usa `bigint`, orden explícito descuento→impuesto→redondeo y modos HALF_UP/HALF_EVEN/DOWN. Cada línea conserva snapshot comercial y fiscal.

La versión optimista protege toda mutación. Ventas completadas no se eliminan; cambios de catálogo jamás reescriben historia.

## Alternativas

- `float/double`: descartado por pérdida de precisión.
- `number` de JavaScript: descartado como autoridad por límite entero y redondeo implícito.
- aggregate por cada línea: descartado porque rompe invariantes de total y finalización.

## Consecuencias

Los clientes conocen escala de moneda mediante configuración; nunca calculan el total autoritativo.
