# ADR-0053 — Flutter POS safety boundaries

Status: accepted for Part 4. The canonical app is `apps/nexo_pos`; visual primitives remain owned by `packages/nexo_flutter_design`. State is explicit and disposable; routing is a deterministic bootstrap policy; network calls use the published OpenAPI boundary; money uses integer minor units; idempotency keys are stable per cart operation.

Secrets require a platform secure-store adapter. `MemorySecureStore` is test-only. Local persistence is limited to non-financial drafts and cached catalog until a durable encrypted database and server reconciliation contract exist. Enrollment, offline financial operations, and unknown provider-payment retries fail closed because the backend has no certified contracts for them. Printing is a boundary, not part of sale finalization. Telemetry and diagnostics must pass through redaction.

Consequences: Part 4 is technically usable as a contract-backed online cash-sale slice and a visual harness, but cannot be certified as a production POS. The remaining contracts must be supplied by backend work before Part 5 certification.
