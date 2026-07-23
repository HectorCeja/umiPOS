# Cash Administrative UI

Cash now renders inside the official global shell with Resumen, Sesión actual, Movimientos y cierre, and Aprobaciones. Empty monetary values are explanatory; lifecycle badges are es-MX; delivery-of-shift language replaces “handoff”; diagnostics remain collapsed.

## Prompt 11.5 certification status

The connected console test now releases its active session and passes in the complete current Cash group. The UI still lacks executed evidence for every existing administrative command and therefore does not meet the required 40-scenario functional certification. No new screen or capability was added.

`/cash` is an administrative and operational support console, not a sales terminal. It uses `@nexo/ui`, generated operation metadata and the public API with cookies, CSRF, command idempotency keys and optimistic versions. It can currently execute Register/Drawer create/update, session open/suspend/resume, movements, deposits, counting, reconciliation and timeline/summary queries; additional controls exist for transfer, approvals, close/reopen and handoff but do not yet have the complete browser evidence required by Prompt 11.4.

The UI displays authoritative amounts and variance; it performs no commercial or ledger calculation. HTTP 403 and 409 are translated without leaking cross-tenant facts. Next renders dynamically so the request CSP nonce reaches framework scripts.

Connected E2E evidence is `2/2`, including explicit absence of POS checkout actions. This is not the requested 40-flow gate.

# Final UI certification (2026-07-14)

The administrative Cash console is connected to generated SDK/backend operations for Registers, Drawers, sessions, movements, withdrawals, approvals, deposits, transfers, counts, reconciliation, close/force-close/reopen, handoff, timeline, summary, outbox, quarantine and local sink status. It sends idempotency/version data, renders backend conflicts and never calculates authoritative balances or variances. Cash Playwright passed 40/40; Storybook/UI passed 12/12 with axe critical/serious 0, keyboard, tablet, dark, reduced-motion and unchanged intentional baselines. It contains no checkout or operational web POS.
