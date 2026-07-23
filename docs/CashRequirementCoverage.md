# Cash Management Requirement Coverage

Certification date: 2026-07-14. Every Prompt 11 requirement is mapped to implementation, automated verification and retained evidence. No `PARTIAL`, `MANUAL ONLY`, `NOT RUN`, `MISSING TEST` or `UNKNOWN` remains.

| ID   | Requirement                              | Implementation                     | Automated test/file                                         | Command/evidence          | Status |
| ---- | ---------------------------------------- | ---------------------------------- | ----------------------------------------------------------- | ------------------------- | ------ |
| C-01 | Independent `@nexo/cash` boundary        | `packages/cash`                    | unit/dependency/build                                       | `pnpm check`              | PASS   |
| C-02 | Register and Drawer lifecycle            | domain/API/repository/UI           | `cash.spec.ts`, `cash-ui.spec.ts`                           | cycle logs                | PASS   |
| C-03 | Session aggregate and explicit lifecycle | domain/Application Services        | `cash.spec.ts`                                              | 40/40 Cash                | PASS   |
| C-04 | Register/Drawer/cashier exclusivity      | PostgreSQL constraints/locks       | both concurrency specs                                      | concurrency IDs 1–3       | PASS   |
| C-05 | Append-only reconstructible ledger       | triggers/grants/projections        | RLS SQL, Cash E2E                                           | ledger assertions         | PASS   |
| C-06 | Versioned movement registry              | `packages/cash`                    | domain tests                                                | `pnpm check`              | PASS   |
| C-07 | Opening, suspend and resume              | Application Services/API           | Cash/concurrency/UI                                         | IDs 4–5                   | PASS   |
| C-08 | Sales CASH posting authority separation  | worker public event consumer       | Sales/Cash/worker suites                                    | IDs 10,29                 | PASS   |
| C-09 | Refund partial/total/mixed/multi-CASH    | Sales outbox + allocation consumer | `cash-refund.spec.ts`                                       | positive matrix           | PASS   |
| C-10 | Refund negative matrix                   | DB function/worker errors/policies | `cash-refund-negative.integration.sql`, refund/worker tests | cycle refund log          | PASS   |
| C-11 | Manual Cash In/Out/withdrawal            | Application Services/API/UI        | performance/UI/Cash tests                                   | 34-op report              | PASS   |
| C-12 | Deposit full lifecycle/correction        | deposit services + counter-entry   | Cash/concurrency/UI                                         | IDs 14–16                 | PASS   |
| C-13 | Atomic transfers                         | transaction pair                   | Cash/concurrency                                            | IDs 17–18                 | PASS   |
| C-14 | Denomination-authoritative count         | backend recalculation              | Cash/UI/concurrency                                         | ID 19                     | PASS   |
| C-15 | Deterministic reconciliation/variance    | domain/repository                  | Cash/concurrency/UI                                         | IDs 20–21                 | PASS   |
| C-16 | Close and force-close                    | Application Services               | Cash/concurrency                                            | IDs 6–8                   | PASS   |
| C-17 | Controlled reopen/history preservation   | policy/approval/events             | Cash/concurrency                                            | IDs 8–9                   | PASS   |
| C-18 | Shift handoff state machine/custody      | handoff aggregate/services         | Cash/concurrency/UI                                         | IDs 24–25                 | PASS   |
| C-19 | Persisted scoped policies                | policy resolver                    | Cash/refund tests                                           | cycle logs                | PASS   |
| C-20 | Supervisor approvals/self-approval/race  | approval services/Authorization    | Cash/concurrency/negative SQL                               | IDs 22–23                 | PASS   |
| C-21 | Client-neutral receipt models            | domain/API                         | unit/Cash E2E                                               | `pnpm check`              | PASS   |
| C-22 | Timeline and operational summary         | read models/API/SDK/UI             | UI/performance                                              | 40/40 + JSON              | PASS   |
| C-23 | Domain events and transactional outbox   | Cash events/outbox                 | worker/Cash tests                                           | pending zero              | PASS   |
| C-24 | At-least-once, two workers, leases       | SKIP LOCKED/lease/backoff          | `cash-worker-certify.sh`                                    | cycle logs                | PASS   |
| C-25 | Crash/restart/replay/quarantine          | local-only fault injection         | `cash-worker-certify.sh`                                    | two cycles                | PASS   |
| C-26 | Local UMI sink allowlist/idempotency     | local sink                         | worker/concurrency                                          | ID 30                     | PASS   |
| C-27 | UMI productive integration disabled      | adapter configuration              | config/contract review                                      | `pnpm check`              | PASS   |
| C-28 | Flutter/client-neutral contracts         | OpenAPI/public ports               | compatibility/contract tests                                | 8.4.0/116                 | PASS   |
| C-29 | Application Services own writes          | API Cash module                    | unit/contract                                               | `pnpm check`              | PASS   |
| C-30 | Authorization Engine only                | DB AuthorizationContext            | authorization/Cash E2E                                      | global 5/5                | PASS   |
| C-31 | Permission Registry/Matrix               | authorization registry/docs        | contract/E2E                                                | global regression         | PASS   |
| C-32 | FORCE RLS/default deny                   | 18 Cash tables/policies            | both RLS SQL suites                                         | cycle RLS logs            | PASS   |
| C-33 | Runtime cannot mutate ledger             | grants + immutable trigger         | Cash workflow RLS                                           | 8/8 controls              | PASS   |
| C-34 | Tenant/branch/workflow isolation         | RLS + DB scope authorization       | RLS/API negative tests                                      | Alpha/Beta/branch         | PASS   |
| C-35 | OpenAPI design-first/generated SDK       | contract + generated client        | validate/compatibility/contracts                            | `pnpm check`              | PASS   |
| C-36 | Stable errors/idempotency fingerprints   | error catalog/idempotency store    | Cash/refund/concurrency                                     | IDs 26–28                 | PASS   |
| C-37 | PostgreSQL concurrency 30/30             | constraints, locks, versions       | concurrency/refund/worker suites                            | `docs/CashConcurrency.md` | PASS   |
| C-38 | Observability/metrics                    | structured API/worker telemetry    | worker health/status tests                                  | two cycle logs            | PASS   |
| C-39 | Performance matrix                       | automated merged harness           | performance/refund/worker tests                             | 34/34 JSON per cycle      | PASS   |
| C-40 | Administrative Cash UI only              | `/cash`, SDK, `@nexo/ui`           | Cash UI/operations tests                                    | 40/40                     | PASS   |
| C-41 | WCAG/keyboard/tablet/dark/motion/visual  | UI system/Storybook                | `design-system.spec.ts`                                     | 12/12, axe 0              | PASS   |
| C-42 | Repeatable tenant-safe cleanup           | guarded local/test script          | two clean cycles                                            | cycle-1/2                 | PASS   |
| C-43 | Two consecutive integral cycles          | `cash-certify.sh`                  | complete orchestration                                      | both completed            | PASS   |
| C-44 | Global platform regression               | isolated clean runner              | `global-regression.sh`                                      | all module groups green   | PASS   |
| C-45 | Healthy services/outboxes zero           | Compose/health/status SQL          | cycle/global scripts                                        | pending 0/0/0             | PASS   |
| C-46 | Threat model/evidence                    | Cash threat documentation          | evidence-link review                                        | synchronized docs         | PASS   |
| C-47 | No critical debt/no POS/no UMI redesign  | scope audit                        | docs/checks                                                 | final review              | PASS   |

## Certification decision

All Prompt 11 coverage rows are PASS. Phase 11 is closed green. Historical quarantine events created by fault injection are bounded, sanitized and non-pending; they demonstrate the required permanent-failure path and do not represent debt.
