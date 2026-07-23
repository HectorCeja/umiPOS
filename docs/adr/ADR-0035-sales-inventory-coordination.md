# ADR-0035: Coordinación Sales–Inventory híbrida mediante process manager

- Estado: Aceptada
- Fecha: 2026-07-13

## Decisión

Checkout usa `InventorySalesPort`: reserva durante `prepare`, convierte reserva a salida durante `confirm` y libera de forma idempotente al cancelar/fallar/expirar. En el monolito, cambios locales críticos comparten transacción adaptadora cuando sea posible; publicación e integraciones son eventuales por outbox at-least-once. Fallos parciales permanecen visibles y compensables.

Sales nunca consulta ni modifica ledger, balances o tablas Inventory. Solo referencia `ProductVariant.id`.

## Alternativas

- Transacción distribuida 2PC: descartada por fragilidad y acoplamiento.
- Eventos sin reserva sincrónica: descartada para checkout presencial porque permite sobreventa silenciosa.
- Acceso SQL directo: prohibido por boundary y evolución independiente.

## Riesgo residual

Una caída entre confirmación externa de pago y commit local requiere reconciliación; proveedores reales se incorporarán con estados explícitos, no ocultando el fallo.
