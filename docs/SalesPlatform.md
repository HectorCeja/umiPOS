# Sales Platform

Sales es la única autoridad comercial de NEXO y un cliente neutral para Web, Flutter, UMI y automatizaciones. `@nexo/sales` contiene dominio puro; API/application services orquestan identidad, TenantContext y AuthorizationContext resueltos desde PostgreSQL; adaptadores implementan persistencia y puertos públicos de Product/Inventory.

## Flujo autoritativo

```text
Client intent → Authentication → Tenant/Membership → Authorization
 → Application Service → Sale Aggregate → Checkout Process Manager
 → ProductSalesPort + InventorySalesPort + PaymentProviderPort
 → transaction (Sale + event + outbox) → response/SDK
                                      ↘ worker → public UMI event sink
```

No hay dependencia directa con Next.js, Flutter o UMI. Product describe; Inventory mantiene ledger; Sales conserva snapshots y lifecycle.

## Límites del MVP

Efectivo, tarjeta externa, transferencia y combinaciones se pueden registrar; ningún proveedor procesa tarjetas. CFDI, caja, hardware, wallet UMI, promociones avanzadas y operación offline quedan explícitamente fuera.

## Errores estables

`SALE_NOT_FOUND`, `SALE_INVALID_STATE`, `SALE_VERSION_CONFLICT`, `IDEMPOTENCY_CONFLICT`, `VARIANT_NOT_FOUND`, `VARIANT_NOT_SELLABLE`, `PRICE_UNAVAILABLE`, `CURRENCY_MISMATCH`, `INVENTORY_UNAVAILABLE`, `INVENTORY_RESERVATION_FAILED`, `DISCOUNT_NOT_ALLOWED`, `DISCOUNT_LIMIT_EXCEEDED`, `PAYMENT_INSUFFICIENT`, `PAYMENT_EXCEEDS_TOTAL`, `PAYMENT_METHOD_DISABLED`, `CHECKOUT_RECALCULATION_REQUIRED`, `SALE_ALREADY_COMPLETED`, `SALE_ALREADY_CANCELLED`, `REFUND_NOT_ALLOWED`, `CROSS_TENANT_ACCESS_DENIED`, `FEATURE_DISABLED`.
