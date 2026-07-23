# Sales Cancellations

Solo ventas no completadas se cancelan. Requiere permiso, motivo, actor, estado válido, versión e idempotencia; libera reservas y emite SaleCancelled. Una venta completada jamás se “cancela” ni borra: usa refund trazable.
