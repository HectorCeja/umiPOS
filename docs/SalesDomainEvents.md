# Sales Domain Events

Eventos internos v1: SaleCreated/Opened, SaleItemAdded/Updated/Removed, SaleSuspended/Resumed, CheckoutPrepared, PaymentRecorded, SaleCompleted/Cancelled/PartiallyRefunded/Refunded, ReceiptGenerated, InventoryReservationRequested/Released.

Envelope: eventId/type/version/time, tenant/organization/branch, aggregate/version, correlation/causation, actor/source y payload mínimo. Sale+outbox se confirman en una transacción. Worker entrega at-least-once; consumidor deduplica eventId.
