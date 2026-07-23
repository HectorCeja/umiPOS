# ADR-0031: Product/Variant como límite maestro y pricing/outbox separados

- Estado: Aceptada
- Fecha: 2026-07-13

## Decisión

Adoptar Product descriptivo con una variante canónica siempre presente. Pricing, media, barcodes y categorías son entidades del bounded context; Inventory, POS, Purchasing y Appointments sólo referencian IDs y no agregan estado al aggregate. Eventos se registran mediante transactional outbox. Opciones usan un mapa abierto con clave canónica. PostgreSQL es el buscador inicial detrás de un puerto.

## Alternativas

Producto sin variante simplifica casos simples pero obliga a bifurcar consumidores. Un único campo price bloquea monedas/listas/contextos. Integrar un buscador externo ahora agrega operación sin evidencia. Eventos emitidos después del commit pierden atomicidad.

## Consecuencias

Inventario podrá registrar stock por variante sin migrar Product. La variante Default tiene costo de una fila. El dispatcher usa un rol DB dedicado limitado a `SELECT/UPDATE product_outbox`; no se debilita RLS ni se concede acceso a aggregates.
