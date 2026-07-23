# Payment outcome recovery

The authoritative backend supports lookup by canonical attempt ID and by the original stable idempotency key. Timeout and connection-reset recovery queries this contract and never creates a replacement attempt. Responses contain canonical IDs, amount, currency, status, last-check time, safe reference, and retry guidance.

`unknown`, `pending`, and `processing` return `QUERY_ONLY_DO_NOT_RECREATE`. Terminal outcomes return `TERMINAL`. Provider callback processing and external-provider reconciliation remain open Part 4B blockers.
