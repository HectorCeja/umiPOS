# Flutter Sales Client Readiness

Flutter consumirá los mismos comandos/queries OpenAPI: create/get/list, líneas, calculate/prepare/confirm, payments, suspend/resume/cancel/refund/receipt. Dinero y cantidades son strings; estados/enums son cerrados; errores son machine-readable.

Offline futuro: UUIDv7 cliente, idempotency key estable por comando y cola ordenada. Tras timeout se repite la misma key y se consulta Sale. Conflicto de versión obliga re-fetch/rebase; complete, disponibilidad, pago externo, refund y folio siempre requieren conexión. Cache mínima: productos snapshot, policy version, venta draft y command log cifrado. No se asume cookie/browser; un perfil OAuth/device futuro podrá usar el mismo contrato.
