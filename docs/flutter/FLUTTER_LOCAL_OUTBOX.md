# Local outbox

`LocalOutbox` provides ordered, dependency-aware, idempotency-key deduplicated operations. It is currently restricted to non-financial drafts. Entries are acknowledged only explicitly; financial use requires a durable database and server protocol.
