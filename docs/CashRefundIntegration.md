# Cash Refund Integration

## Prompt 11.5 certification status

Partial, total, mixed and multiple-CASH-allocation positive flows pass against Sales outbox, two running workers and Cash ledger. The negative cases required by Prompt 11.5 are not yet exhaustive, so refund certification remains yellow despite the positive `5/5` evidence.

## Prompt 11.4 evidence

Migration `20260714153000_cash_refund_allocation_distribution` distributes each authoritative approved refund deterministically over captured CASH allocations, bounded by remaining allocation capacity. Each ledger source is `refundId:paymentAllocationId`, so sequential or concurrent delivery can produce at most one posting per CASH allocation. CARD_EXTERNAL allocations are not posted by Cash.

Executed positives are partial, total, mixed and multiple CASH allocations (`5/5`). The required negative matrix and automated dual-worker failure paths are not complete; this gate remains yellow despite the positive coverage.

Cash accepts only an already-approved authoritative refund intent/allocation from Sales. It validates policy, authorization, active session, currency and available expected cash, then appends one `CASH_REFUND` keyed by refund allocation. It cannot approve commercial refunds and does not process card reversals.

# Final refund certification (2026-07-14)

The real Sales outbox → two-worker Cash consumer → authoritative CASH allocation → append-only ledger → Cash outbox → local UMI sink path passed partial, total, mixed, multi-line/multi-CASH allocation and sequential/concurrent replay. `cash-refund-negative.integration.sql`, API negatives and worker quarantine cover wrong tenant/organization/branch/currency, unknown refund/sale/allocation, non-CASH allocation, duplicate/applied refund, excessive amount, invalid session state, disabled policy, absent/rejected/expired/self approval, out-of-order/invalid-version events, transient retry and permanent quarantine. Card allocations are ignored and never reversed by Cash.
