# Cash Performance Budgets

## Prompt 11.5 certification status

No complete p50/p95/max matrix has been produced for every required Cash operation. Existing individual Playwright timings are diagnostic only and are not substituted for warmed multi-sample benchmarks. This gate remains yellow.

## Prompt 11.4 status

The complete operation matrix has not been measured in a warmed controlled run. Browser timings and isolated test durations are not substituted for p50/p95/max evidence. Performance therefore remains yellow.

Local warmed p95 objectives: active session 120 ms; open 250 ms; movement/Sales posting/count 180 ms; reconciliation 250 ms; close 350 ms; timeline 200 ms; summary 180 ms. Measure at least 200 samples against real local PostgreSQL after warm-up and record hardware/versions. Security, locking and correctness take precedence; no measurement is claimed until executed.

# Final measured matrix (2026-07-14)

Both clean cycles measured 34/34 required operations in warmed local Docker Compose on AMD Ryzen 5 3600 (12 logical CPUs, 16 GB RAM), PostgreSQL 18 and two workers. Stateful API operations use five samples; Sale posting uses four; each commercial refund and injected recovery path uses one full end-to-end sample. Full p50/p95/max/sample data is in `cycle-1/performance.json` and `cycle-2/performance.json`.

Normal outbox claim/publish p95 was 366 ms and 156 ms. Crash lease recovery, intentionally including container termination/start and lease takeover, was 6.252 s and 7.827 s and is tracked separately from the <1 s normal publication budget. API command/query p95 values remained within their category budgets; end-to-end partial/total/mixed refunds were 144–521 ms in cycle 1 and 248–287 ms in cycle 2. No security or consistency control was weakened.
