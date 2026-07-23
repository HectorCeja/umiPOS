# Product Engine

`@nexo/product` es un paquete TypeScript puro sin NestJS, Prisma, HTTP ni MinIO. Contiene tipos, invariantes de estado, dinero, SKU, códigos GS1, tipos habilitados, claves deterministas de opciones y el puerto de búsqueda.

Tipos modelados: `PHYSICAL`, `SERVICE`, `BUNDLE`, `KIT`, `COMPOSITE`, `DIGITAL`, `GIFT_CARD`, `SUBSCRIPTION` y `CUSTOM`. Subscription queda deshabilitado. Bundle/Kit/Composite se resolverán mediante composición versionada antes de Inventario; no se finge stock agregado.

Flujo de escritura: controlador → servicio de aplicación → autorización → transacción tenant → autorización transaccional → aggregate/price/media → audit event + outbox → commit.
