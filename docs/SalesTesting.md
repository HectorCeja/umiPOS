# Sales Testing

Capas: unit/domain y property monetary; application services con adapters reales; PostgreSQL integration/RLS/concurrency/outbox; OpenAPI→backend→SDK contract; Playwright E2E. Mocks solo para proveedor de pago y UMI inexistentes.

Matriz obligatoria: efectivo/mixto/cambio; físico/servicio; suspensión/expiración/cancelación; shortage/policy; moneda/descuento/supervisor; doble complete; same/different idempotency payload; snapshot histórico; Alpha/Beta y Branch scope; SaleCompleted outbox/dedupe; partial refund y destinos; evento UMI minimizado; runtime no delete.
