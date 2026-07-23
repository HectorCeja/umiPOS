# Payment Abstraction

PaymentIntent agrupa intentos; PaymentAllocation aplica resultados a Sale. Estados: PENDING, AUTHORIZED, CAPTURED, REJECTED, CANCELLED, REFUNDED. CASH captura localmente; CARD_EXTERNAL registra referencia de terminal; BANK_TRANSFER exige referencia según política. PAN/CVV están prohibidos.

Los proveedores futuros implementan `PaymentProviderPort`. Reintentos usan idempotencia; asignaciones rechazadas no pagan saldo.
