# POS testing

Fixtures are isolated in `lib/testing` and selected only by `NEXO_TEST_HARNESS=true`. Unit tests cover money, idempotency, cart, offline policy, outbox, guards, checkout and redaction. Widget tests cover production blocking, catalog/cart, dialog, mobile and 200% text.
