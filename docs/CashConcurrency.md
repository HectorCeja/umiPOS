# Cash Concurrency

## Prompt 11.5 certification status

Six explicit real-PostgreSQL scenarios currently pass. They cover opening exclusivity, suspend/version conflict, approval approve/reject, deposit handover/cancel, handoff accept/reject and cleanup without ledger rewriting. This is not the required 30/30 matrix; the concurrency gate remains yellow.

## Prompt 11.4 evidence

The current real PostgreSQL subset covers competing Register/Drawer open, suspend conflict, approval decision race, deposit handover/cancel race, handoff accept/reject and fixture release (`6/6`). Transactions use row locks, optimistic versions and idempotency uniqueness; outbox workers use `FOR UPDATE SKIP LOCKED` leases. This is explicitly not the required 30/30 matrix.

Partial unique indexes prevent incompatible active Register/Drawer/cashier sessions. Critical mutations lock the session row and compare optimistic version. Transfer locks sessions in stable ID order. Approval uses one conditional version/status update. Database race tests must prove one winner for open, close, posting and approval.

# Final PostgreSQL concurrency certification (2026-07-14)

All 30 required races are mapped and executed against real PostgreSQL. IDs 1–9 and 14–28 run through `cash-concurrency.spec.ts` and `cash-concurrency-certification.spec.ts`; sale/refund posting races 10–13 run through Sales completion, concurrent refund replay and worker posting assertions; IDs 29–30 run through two real worker containers and the unique local UMI delivery constraint. Transactions use PostgreSQL `READ COMMITTED`, row/aggregate locks, unique partial constraints, optimistic versions and idempotency fingerprints. Every winner is unique, losers return stable conflict/replay outcomes, ledger pairs remain balanced and outboxes do not duplicate.

Evidence command: `pnpm cash:certify -- cycle-{1,2}`. Both final cycles report Cash Playwright `40/40`; the explicit concurrency files contribute 22 dedicated browser races and the remaining eight are integration races in Sales/refund/worker/sink suites. No scenario is manual-only.
