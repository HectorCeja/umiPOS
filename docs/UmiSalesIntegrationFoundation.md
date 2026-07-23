# UMI Sales Integration Foundation

UMI orquesta; NEXO expone capacidades. Contratos públicos preliminares v1: `nexo.sale.completed`, `.cancelled`, `.refunded`, `.item_returned`, `nexo.product.sold`, `nexo.receipt.generated`. Un mapper whitelist incluye IDs, folio, moneda/totales, items vendidos y correlation; excluye entidades internas y PII innecesaria.

`UmiSalesIntegrationPort` usa sink local/deshabilitado. Estados pending/published/failed y retry se derivan de outbox; DLQ/reconciliación son future-ready. Wallet y estructura exacta UMI siguen bloqueados por documentación externa.
