# Sales Concurrency

Cada comando exige versión (`If-Match`). UPDATE crítico condiciona `tenant_id,id,version`; cero filas significa `SALE_VERSION_CONFLICT`. Folio se asigna con row lock/UPSERT atómico y nunca se reutiliza. Unicidad de pago/idempotencia/outbox impide dobles efectos incluso entre terminales. Las pruebas deben ejecutar conexiones PostgreSQL reales concurrentes.
