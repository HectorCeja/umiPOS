# Operational Exceptions

El centro reúne ventas fallidas/pendientes y outbox con error mediante un read model sanitizado. Expone módulo, código, recurso, correlation ID, attempts y timestamps; oculta payload completo, stack, secretos y PII. Replay manual permanece future-restricted.
