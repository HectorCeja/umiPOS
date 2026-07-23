# Flutter Payment Attempts

Payment creation and outcome lookup use stable operation-scoped idempotency keys. A timeout enters `unknownOutcome`; automatic rebilling is prohibited. Recovery accepts only an authoritative attempt or sale response.

The cash request now matches OpenAPI 8.9.0 (`method`, `amountMinor`, optional `tenderedMinor`). External and mixed tender orchestration are not implemented in Flutter and remain blocking gaps.
