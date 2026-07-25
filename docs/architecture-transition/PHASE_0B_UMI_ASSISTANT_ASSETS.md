# Phase 0B — Umi Assistant Assets

## Approved knowledge classes

| Asset class          | Candidate examples                          | Future use                          | Safety boundary                                   |
| -------------------- | ------------------------------------------- | ----------------------------------- | ------------------------------------------------- |
| Financial invariants | Money, idempotency, receipt, refund vectors | Explain totals and replay results   | Never calculate authoritative totals client-side. |
| Cash rules           | Ledger and policy vectors                   | Explain shift state and variance    | Adjustments require approval.                     |
| Inventory rules      | Inventory test vectors                      | Explain balance and anomalies       | Scope by business and branch.                     |
| Device trust         | Device scenario and enrollment note         | Guide enrollment and explain denial | Never bypass device proof.                        |
| Failure scenarios    | Concurrency and resilience scenarios        | Diagnostics and runbooks            | Do not turn failures into mutation shortcuts.     |
| Telemetry            | Correlation source and freshness script     | Redacted trace explanations         | Exclude credentials and personal data.            |
| Operational notes    | Exceptions and client readiness notes       | Guided help                         | Curate against UMI facts first.                   |

## Read tools supported later

- sales and receipt status
- inventory state
- shift state
- payment outcome status
- KDS queue status
- redacted command correlation
- configuration and readiness explanations

## Guided actions supported later

- explain refund requirements
- explain cash reconciliation
- guide device enrollment
- guide offline recovery
- guide KDS remediation

## Consequential-action preparation only

Candidate rules can inform preparation for:

- refund
- cash adjustment
- branch configuration
- catalog availability change

The authoritative UMI service must still require permission, confirmation, fresh PIN, manager approval, device context, and an audit event.

## Rejected assets

Do not transfer for Assistant use:

- raw SQL helpers
- direct database clients
- privileged bypass mechanisms
- NEXO identity or RBAC authority
- direct financial mutation shortcuts
- unredacted logs
- NEXO credentials and configuration

## Condition

Assistant use begins only after UMI owns the typed contract, permission model, safe read model, error taxonomy, audit model, and redaction policy.
