# Payment recovery

V1 status: **PASS**. The stable lookup key is persisted before payment; response loss and restart recover the authoritative attempt/sale/receipt without recharging or duplicating cash/outbox effects.

Timeout and backend-unavailable outcomes become `paymentUnknown`; retry is prohibited. The app may query the sale state, but OpenAPI has no payment-intent status endpoint, so unresolved outcomes require manual review. A payment is never inferred approved or declined.
