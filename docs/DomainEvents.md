# Domain Events

Eventos v1: `ProductCreated`, `ProductUpdated`, `ProductArchived`, `ProductRestored`, `VariantCreated`, `MediaAdded`, `CategoryUpdated`, `PriceUpdated`. Se escriben en la misma transacción que el aggregate y en un audit log append-only. El payload no contiene secretos ni objetos binarios.
