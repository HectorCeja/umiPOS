# Product Model

`Product` contiene identidad tenant, SKU opcional normalizado, nombres y descripciones, tipo, estado, categoría, marca, unidad, metadata, términos de búsqueda, versión, auditoría y soft delete. Cada producto crea una variante canónica `Default`; por ello todo consumidor puede usar `ProductVariant.id` de manera uniforme.

La clave `(tenant_id, normalized_sku)` evita duplicados por tenant. `version` implementa concurrencia optimista. No hay columnas de stock, costo promedio, venta ni disponibilidad.

La internacionalización se mantiene compatible mediante locale organizacional, texto UTF-8 y futura tabla de traducciones aditiva; la API actual devuelve el texto base del tenant.
