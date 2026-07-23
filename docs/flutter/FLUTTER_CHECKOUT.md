# Checkout

The implemented online cash path is create sale → add items with expected version → server checkout → payment → complete. Every command has a stable idempotency key. A concurrent second submit is ignored.
