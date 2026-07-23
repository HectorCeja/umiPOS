# Reservations

Una reserva enlaza variante, ubicación, cantidad, origen externo y expiración. Crear agrega cantidad a `RESERVED`; liberar o expirar agrega el inverso. Estados: ACTIVE → RELEASED, EXPIRED o CONSUMED; son terminales. Source e idempotencia evitan duplicados y cada transición produce evento/outbox.

El Worker reclama reservas ACTIVE vencidas de forma atómica, las marca EXPIRED y agrega el movimiento inverso más evento/outbox idempotentes. Su rol sólo puede leer/actualizar reservas e insertar evidencia; no administra Product ni otros aggregates. El POS futuro no descontará stock directamente: reservará, confirmará demanda y registrará Sale mediante casos de uso. Oracle recomienda tratar la reserva como vínculo entre demanda y suministro, haciendo ese suministro indisponible para otras demandas.
