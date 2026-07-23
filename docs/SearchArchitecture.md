# Search Architecture

`ProductSearchPort` desacopla casos de uso del índice. El adaptador inicial consulta PostgreSQL por nombre, SKU, barcode y términos, limitado y tenant-scoped. No se incorpora Elasticsearch, Meilisearch ni Typesense. Los eventos del outbox permiten crear después un projector idempotente sin modificar Product.
