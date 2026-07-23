# Cash Testing

## Prompt 11.5 certification evidence

The current real-service Cash group passes `20/20` when executed in the required order: seed, Redis cleanup, tenant-scoped Cash cleanup, then Playwright. The initial global attempt exposed fixture pollution and mutated seed credentials; it is retained as a failed certification attempt rather than hidden. Required final coverage remains `30/30` races, the complete refund negative matrix, `40/40` functional scenarios and two integral clean cycles.

## Prompt 11.4 executed subset

- Refund positives: `5/5`.
- PostgreSQL race subset: `6/6`.
- Sanitized quarantine API: `3/3`.
- Connected administrative console: `2/2`.
- API unit/contract: `15/15`.

An initial combined run passed `15/16` and exposed an open Refund fixture that blocked the later UI suite. Refund teardown now force-closes the fixture. The repeated combined run passed `16/16` from tenant-scoped cleanup and all three pending outboxes were zero afterward. Both full integral clean cycles remain pending.

Required layers: pure lifecycle/ledger/denomination/reconciliation tests; Application Service authorization; PostgreSQL integration for constraints, idempotency and races; RLS Alpha/Beta; immutable ledger privilege/trigger checks; outbox replay; OpenAPI/SDK contract; Playwright flows; Storybook/axe/visual checks for any UI. External UMI/hardware/bank adapters alone may be mocked. Evidence must state what actually ran.

# Final certification evidence (2026-07-14)

`pnpm cash:certify -- cycle-1` and `cycle-2` both passed from deleted Docker volumes. Each cycle applied 35 migrations, seeded, ran `pnpm check`, automated dual-worker recovery, refund negatives, 40 Cash Playwright tests, generic and Cash RLS, 12 UI/axe/keyboard/visual tests, 34 performance operations and zero-backlog assertions. `bash scripts/global-regression.sh` then passed all platform browser groups from a third clean database. Logs are retained under `artifacts/cash-certification/`.
