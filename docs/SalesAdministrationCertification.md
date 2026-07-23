# Sales Administration automated certification

The reproducible command is `pnpm sales-admin:certify`. It rejects non-local/test environments, recreates Docker data, migrates and seeds, runs the repository gate, Sales fixtures, the explicit 44-case browser matrix, accessibility, the 27 visual baselines without updating them, UI/Storybook, performance, RLS, global regression, service health and zero-outbox evidence.

Evidence is written to `artifacts/sales-administration-certification/`. Initial baselines were intentionally created on 2026-07-14 from deterministic intercepted read models, frozen time, Chromium 1228/Linux, disabled animation and official viewports; the subsequent run did not update snapshots.

Automated certification and owner acceptance are distinct. A green automated result must never be described as owner approval.
