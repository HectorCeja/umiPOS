# Cash Reconciliation

Expected amount is the exact ledger fold, including opening float, Sales/refunds, manual in/out, withdrawals, deposits, transfers and corrections. `variance = counted − expected`. Server-side policy classifies `MATCHED`, `WITHIN_TOLERANCE`, `OVER`, `SHORT`, `RECOUNT_REQUIRED` or `APPROVAL_REQUIRED`; approval/rejection is retained separately. Reconciliation never creates unexplained balance mutation.
