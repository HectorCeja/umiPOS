# ADR-0040 — Reconciliation, close and custody

**Status:** accepted · **Date:** 2026-07-14

## Decision

Expected cash is derived deterministically from ledger direction and movement type. Counts are server-recalculated from configured denominations. Variance thresholds come from persisted Organization/Branch/Register policy. Normal close requires count/reconciliation; forced close and controlled reopen are exceptional, separately authorized transitions that preserve all prior evidence.

Shift handoff defaults to close-and-open because custody and variance have an unambiguous owner. In-session custody transfer remains future-restricted until dual-control workflow is proven. Blind count is the default. Approvals are resources with expiry, approver database context and optimistic versioning—not client booleans.

## Consequences

History is never rewritten. Reopen only permits corrective movements and requires reason/approval. Pending cash integration events block normal close by default. Policy may relax thresholds but cannot bypass authorization or tenant/Branch constraints.
