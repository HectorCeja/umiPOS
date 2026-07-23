# Cash Movement Types

Registry version 1 defines `OPENING_FLOAT`, `CASH_SALE`, `CASH_REFUND`, `CASH_IN`, `CASH_OUT`, `WITHDRAWAL`, `DEPOSIT`, `TRANSFER_OUT`, `TRANSFER_IN`, `PAID_OUT`, `CHANGE_IN`, `CHANGE_OUT`, `COUNT_ADJUSTMENT`, `CORRECTION`, `CLOSING_TRANSFER`, `REOPENING_ADJUSTMENT` and restricted `UNKNOWN_RECONCILIATION`. The registry owns direction, expected-balance effect, reason/approval/receipt/external-reference requirements and automatic/closed-session eligibility; callers do not use ad-hoc semantics.
