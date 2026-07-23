# Product Platform

## Alcance

Catálogo es la fuente descriptiva de productos comercializables. No conoce existencias, movimientos, compras, ventas, caja ni disponibilidad de agenda. Los módulos futuros referencian `ProductVariant.id`; nunca agregan stock al catálogo.

## Evidencia estudiada

- Shopify separa Product de variantes y representa opciones, SKU, barcode y media en la variante. Su límite comercial de variantes no se adopta como invariante de NEXO.
- Stripe separa Product (qué se vende) de Price (cómo y por cuánto se cobra). NEXO conserva ese límite.
- Square distingue item, variation, options y modifiers y versiona objetos de catálogo. NEXO adopta variante vendible y concurrencia optimista, no sus límites de plataforma.
- Medusa separa Product, Pricing e Inventory mediante módulos y enlaces. Esto respalda que Catálogo no posea stock.
- Saleor y Vendure confirman product type, atributos/opciones, variantes y colecciones/categorías como conceptos distintos.
- GS1 exige GTIN numérico con longitud y dígito de control válidos; se valida en dominio antes de persistir.
- UBL permite que Item describa bienes o servicios, múltiples identificadores, clasificaciones, unidades y precio/base quantity.

## Riesgos

JSONB para valores de opciones permite cardinalidad abierta, pero exige una proyección futura para analítica intensiva. El precio base no es un motor de promociones. `SUBSCRIPTION` está modelado y rechazado hasta definir billing. El adaptador de búsqueda PostgreSQL es deliberadamente básico.

Véanse [ProductEngine.md](ProductEngine.md), [ProductModel.md](ProductModel.md), [DomainEvents.md](DomainEvents.md) y ADR-0031.
