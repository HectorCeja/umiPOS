# ADR-0036: Payment Intent y asignaciones sin procesamiento PCI

- Estado: Aceptada
- Fecha: 2026-07-13

## Decisión

PaymentIntent/Attempt/Allocation se modelan independientemente del proveedor. CASH, CARD_EXTERNAL y BANK_TRANSFER registran evidencia; MIXED es composición de asignaciones, no método persistido. No se almacena PAN ni CVV. La finalización requiere saldo cero y solo efectivo genera cambio.

La rotación de estados toma el principio de PaymentIntent: un objeto conserva lifecycle e idempotencia, en vez de crear un cargo nuevo por cada reintento.

## Alternativas

- SDK de proveedor dentro de Sales: descartado por lock-in y alcance PCI.
- Pago como campo en Sale: descartado porque no soporta intentos, mixtos, rechazo o refund.

## Fuente

- [Stripe Payment Intents](https://docs.stripe.com/payments/payment-intents)
