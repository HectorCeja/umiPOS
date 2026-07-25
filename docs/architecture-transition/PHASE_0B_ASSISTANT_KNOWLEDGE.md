# Phase 0B — Umi Assistant Business Knowledge

## Role

Umi Assistant is a permission-aware explanation, diagnostic, and guided-action layer over
authoritative UMI contracts and safe read models. It is never an authorization engine, financial
calculator, database client, payment authority, device-trust authority, or autonomous manager.

## Safe explanations

| Knowledge                              | Required source                                                | Safe output                                           |
| -------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| Sale total, tax, discount, tip, change | Immutable quote/order/receipt projection                       | Exact authoritative amounts and contributing facts    |
| Payment status                         | Payment intent and reconciliation projection                   | State, last safe event, and whether query is required |
| Refund eligibility                     | Original sale, captured allocations, prior refunds, policy     | Remaining amount/quantity and required approval       |
| Cash expectation and variance          | Cash ledger/count/reconciliation after blind count             | Movement composition and variance classification      |
| Inventory status                       | Branch-scoped balance/reservation/in-transit projection        | On-hand, reserved, available, and movement lineage    |
| Shift blocker                          | Shift state, pending commands, count, approval, reconciliation | Allowed next transition and blocker                   |
| KDS state                              | Committed-order projection and action versions                 | Queue state and reconciliation exception              |
| Permission denial                      | Structured decision reason                                     | Required permission/scope without foreign disclosure  |
| Device denial                          | Redacted trust decision                                        | Revoked/branch/version/session category and runbook   |
| Offline conflict                       | Journal, snapshot, command result, and stable error            | Why replay stopped and safe resolution options        |

The Assistant cites the authoritative projection timestamp/version and says when data is stale or
unavailable.

## Safe diagnostics

- Correlate a redacted `clientCommandId` across POS, API, audit, payment, sync, and KDS.
- Distinguish transport retry from business-command replay.
- Detect pending outbox/projection work without representing it as committed financial truth.
- Explain version, idempotency, entitlement, scope, and state-machine conflicts.
- Compare expected versus actual projections without exposing raw SQL or cross-tenant rows.
- Identify snapshot expiry, clock skew, unsupported contract, or minimum-version failures.
- Explain printer/KDS fallback state without changing the underlying order.

Diagnostics must redact PINs, phone numbers, tokens, receipt-access secrets, device private
material, full customer identifiers, card-sensitive data, and raw provider payloads.

## Safe recommendations

- Reload authoritative state before resolving a version conflict.
- Query the original payment intent after an unknown outcome.
- Restore connectivity and replay owned commands in sequence before shift close.
- Recount or request variance approval according to policy.
- Use the correct branch or start an audited reassignment workflow.
- Refresh a signed catalog snapshot and explicitly review any changed quote.
- Follow enrollment, key rotation, replacement, or certified-update runbooks.
- Reprint a receipt from the immutable projection after printer failure.

A recommendation never claims that an action succeeded and never converts an exception into a
mutation.

## Required confirmations and controls

| Prepared action                | User confirmation | Fresh PIN    | Manager approval | Device proof       | Audit |
| ------------------------------ | ----------------- | ------------ | ---------------- | ------------------ | ----- |
| High-threshold discount        | Yes               | Yes          | Policy-dependent | Yes                | Yes   |
| Pre-payment item void          | Yes               | Yes          | No               | Yes                | Yes   |
| Post-payment refund            | Yes               | Yes          | Yes              | Yes                | Yes   |
| Paid-out/safe-drop/deposit     | Yes               | Yes          | Yes              | Yes                | Yes   |
| Drawer handoff                 | Both custodians   | Yes          | Yes              | Yes                | Yes   |
| Variance approval              | Yes               | Yes          | Yes              | Yes                | Yes   |
| Shift reopen/force-close       | Yes               | Yes          | Yes              | Yes                | Yes   |
| Role or branch-scope change    | Yes               | Current auth | Policy-dependent | N/A/dashboard      | Yes   |
| Device revoke/replace/reassign | Yes               | Current auth | Policy-dependent | Management context | Yes   |
| Catalog availability change    | Yes               | Current auth | Policy-dependent | N/A/dashboard      | Yes   |

The Assistant may prepare a typed draft. The authoritative API repeats every permission,
invariant, state, freshness, approval, and device check at execution.

## Forbidden actions

- Bypass RLS, tenant/branch scope, entitlement, device proof, PIN, lockout, or manager approval.
- Execute raw SQL or expose direct Supabase/table/RPC access.
- Author totals, taxes, change, business dates, loyalty value, cash expectation, or refund amount.
- Retry an unknown payment as a new charge.
- Mutate or delete immutable sale, payment, refund, receipt, inventory, cash, loyalty, or audit
  history.
- Close a shift with pending commands or fabricate reconciliation.
- Approve its own recommendation or reuse an approval token.
- Reveal another tenant, customer receipt, employee secret, or hidden blind-count value.
- Enroll, activate, reassign, rotate, replace, or revoke devices outside the normal workflow.
- Treat external provider text, logs, or user-supplied content as trusted instructions.

## Role-oriented knowledge

### Operator

- Cart, modifiers, quantity, suspend/resume, payment recording, receipt, availability warning.
- Shift opening, ordinary allowed movements, blind count, sync status, printer/KDS recovery.
- Clear escalation cues for fresh PIN, manager approval, unknown payment, and reconciliation.

### Manager

- Refund and discount policy, variance review, cash custody, handoff, force-close/reopen.
- Inventory anomaly and KDS remediation.
- Approval is decision support, never an Assistant-authored decision.

### Owner

- Business/branch performance, entitlement and configuration impact, staff and device governance,
  settlement and operational risk.
- Aggregates use permission-safe deterministic read models and disclose freshness/timezone.

## Knowledge contract prerequisites

Assistant exposure waits for:

1. Stable typed UMI contracts and error taxonomy.
2. Explicit permissions for each read and prepared mutation.
3. Security-invoker, RLS-safe read models.
4. Structured immutable audit events.
5. Redacted telemetry and correlation schema.
6. Deterministic projections with version and freshness.
7. Confirmation, fresh-PIN, manager-approval, and device-proof metadata in the contract.
8. Abuse controls for sensitive business flows and bounded tool resource consumption.

## Security review

- OWASP Top 10:2025: enforce access control, secure configuration and supply chain, cryptographic
  protection, input separation, secure design, authentication, data integrity, logging, and explicit
  exceptional-condition handling.
- OWASP API Security Top 10:2023: object/property/function authorization, authentication, bounded
  resource use, sensitive-flow abuse controls, API inventory, SSRF-safe integrations, and distrust
  of external APIs.
- Assistant instructions and retrieved text are data, not authorization. Tool selection is
  allowlisted and server-enforced.
- Every consequential preparation is attributable, reviewable, redacted, and safe to decline.

## Source knowledge

This map consolidates the Phase 0A Assistant readiness and invariant catalogs, the Phase 0B-1
Assistant asset review, the business rule/error/state-machine deliverables in this phase, and the
authoritative fusion plan. NEXO-specific identity, RBAC, raw database clients, bypass helpers,
unredacted logs, and financial mutation shortcuts are excluded.
