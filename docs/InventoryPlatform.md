# Inventory Platform

Inventory es responsable de cantidades, reservas, ubicaciones, transferencias, conteos, disponibilidad y valoración. Product sigue siendo descriptivo y la única referencia permitida es `ProductVariant.id`. El módulo puro `@nexo/inventory` contiene invariantes; NestJS orquesta casos de uso y Prisma persiste bajo TenantContext, autorización transaccional y FORCE RLS.

Flujo de escritura: contrato OpenAPI → controller → Application Service → autorización DB → transacción tenant → movimiento inmutable + proyección de costo/snapshot + evento/outbox. El worker publica envelopes al menos una vez; consumidores futuros deduplican por ID.

Fuentes oficiales: [GS1 Global Traceability Standard](https://ref.gs1.org/standards/gts/), [Microsoft inventory transactions](https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-transactions), [Oracle reservations](https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/24c/famml/overview-of-reservations.html) y [Odoo inventory valuation](https://www.odoo.com/documentation/19.0/applications/inventory_and_mrp/inventory/product_management/inventory_valuation/inventory_valuation_config.html).
