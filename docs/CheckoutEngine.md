# Checkout Engine

Orden fijo: tenant → autorización → estado → variante vigente → disponibilidad comercial → Inventory → precio/moneda → impuesto → descuento → redondeo → reserva → pagos requeridos → totales → finalización.

`calculate` no muta; `prepare` revalida y reserva; `confirm` revalida autorización/versión/pago dentro de la operación crítica, convierte reservas y completa. Entradas del cliente son selecciones, nunca totales confiables. Una preparación parcial libera reservas idempotentemente y conserva evidencia.
