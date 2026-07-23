# Cash Session Lifecycle

Explicit states: `PENDING_OPEN`, `OPEN`, `SUSPENDED`, `COUNTING`, `RECONCILIATION_REQUIRED`, `PENDING_APPROVAL`, `CLOSED`, `FORCE_CLOSED`, `REOPENED`, `CANCELLED`. The domain transition table rejects implicit transitions. Ordinary movements are limited to `OPEN`/authorized `REOPENED`; count freezes ordinary posting; normal close requires count and reconciliation. Force-close and reopen are separately permissioned and audited.
