# Cash–Sales Integration

`SaleCompleted` cash allocations are allowlisted into `PostCashSale`: validate tenant/Organization/Branch/currency, resolve an authorized active session, append one `CASH_SALE` keyed by PaymentAllocation ID, and emit `CashSalePosted`. Re-delivery returns the existing entry. Missing/invalid sessions are observable retry/quarantine conditions; Cash neither invents a session nor mutates Sales.
