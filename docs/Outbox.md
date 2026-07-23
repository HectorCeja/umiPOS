# Transactional Outbox

`product_outbox` se inserta atómicamente con cada cambio. Entrega semántica: al menos una vez; consumidores deben deduplicar por `id` y `schema_version`. `published_at`, `attempts` y `last_error` soportan reintentos. RLS protege filas por tenant y Runtime no dispone de DELETE.

El dispatcher usa el rol PostgreSQL `nexo_worker`, sin `BYPASSRLS`, con `SELECT/UPDATE` exclusivamente sobre outbox y políticas dedicadas. Publica envelopes estructurados con semántica at-least-once y marca el evento; no puede leer Products, Identity ni tablas tenant.
