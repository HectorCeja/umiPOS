# Cash Idempotency

Critical commands use `(tenant, operation, key)` with canonical request fingerprint, stored response/status and expiry. Same key plus same fingerprint safely replays; a different payload returns `IDEMPOTENCY_CONFLICT`. Source uniqueness additionally protects Sales/refund posting. Keys contain no secrets and clients retain them across ambiguous timeouts.
