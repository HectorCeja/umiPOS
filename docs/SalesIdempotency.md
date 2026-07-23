# Sales Idempotency

Clave requerida para create/add/prepare/payment/complete/suspend/resume/cancel/refund/receipt. PostgreSQL almacena `(tenant,operation,key)`, fingerprint canónico SHA-256, respuesta, recurso y expiración. Mismo fingerprint reproduce sin efectos; distinto retorna 409 `IDEMPOTENCY_CONFLICT`. TTL inicial: 24 h para edición, 30 días para pago/finalización/refund; los registros históricos permanecen protegidos por constraints propios.
