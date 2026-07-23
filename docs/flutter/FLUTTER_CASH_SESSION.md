# Cash session

V1 status: **PASS**. Flutter executes active-state lookup, open, authoritative summary, count, reconcile and close. Close now rejects captured cash-sale events pending financial posting, eliminating the outbox/close race.

OpenAPI publishes cash-register/session operations. The current slice enforces an open cash session before checkout. Full opening, reconciliation and closing UI is deferred pending production enrollment/session bootstrap; no client balance is declared authoritative.
