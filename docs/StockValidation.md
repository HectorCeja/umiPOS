# Stock Validation

Validación en capas: DTO/contrato rechaza forma inválida; dominio puro aplica invariantes; Application Service selecciona permiso; repositorio revalida autoridad y balance dentro de la misma transacción; PostgreSQL aplica FK tenant-first, checks, unicidad idempotente, triggers inmutables y FORCE RLS.

Pruebas obligatorias cubren recepción, reserva/liberación, sobre-reserva, transferencia/in-transit, conteo correctivo, FIFO, promedio ponderado, referencia Product rechazada, tenants Alpha/Beta, default deny y publicación outbox. Errores esperados son 409/403/404 sin filtrar existencia cross-tenant.
