# Phase 0B — Business State Machines

## Reading contract

These state machines define behavior for future UMI implementation. State names are conceptual
unless already fixed by `packages/contract` in a later phase. Full transition metadata, rollback,
recovery, timeout behavior, and invariant checks live in `phase-0b-state-machines.json`.

## Checkout and sale

```mermaid
stateDiagram-v2
  [*] --> DRAFT
  DRAFT --> OPEN
  OPEN --> SUSPENDED
  SUSPENDED --> OPEN
  OPEN --> QUOTED
  QUOTED --> OPEN: requote
  QUOTED --> PAYMENT_PENDING
  PAYMENT_PENDING --> COMMITTED
  PAYMENT_PENDING --> FAILED
  FAILED --> OPEN: recover before commit
  OPEN --> CANCELLED
  SUSPENDED --> CANCELLED
  OPEN --> EXPIRED
  SUSPENDED --> EXPIRED
```

Commit is the irreversibility boundary. Before it, cancellation releases reservations and loyalty
authorization. After it, only refunds or compensating facts correct history.

## Payment intent

```mermaid
stateDiagram-v2
  [*] --> REQUESTED
  REQUESTED --> PENDING_TERMINAL
  REQUESTED --> CAPTURED: cash or confirmed manual terminal
  PENDING_TERMINAL --> AUTHORIZED
  PENDING_TERMINAL --> DECLINED
  PENDING_TERMINAL --> UNKNOWN
  AUTHORIZED --> CAPTURED
  AUTHORIZED --> VOIDED
  UNKNOWN --> AUTHORIZED: query outcome
  UNKNOWN --> CAPTURED: query outcome
  UNKNOWN --> DECLINED: query outcome
  CAPTURED --> PARTIALLY_REFUNDED
  CAPTURED --> REFUNDED
  PARTIALLY_REFUNDED --> REFUNDED
```

`UNKNOWN` permits query and reconciliation only. It never transitions to a new `REQUESTED` charge.

## Refund

```mermaid
stateDiagram-v2
  [*] --> DRAFT
  DRAFT --> PENDING_APPROVAL
  PENDING_APPROVAL --> APPROVED
  PENDING_APPROVAL --> REJECTED
  APPROVED --> PROCESSING
  PROCESSING --> COMPLETED
  PROCESSING --> OUTCOME_UNKNOWN
  PROCESSING --> FAILED
  OUTCOME_UNKNOWN --> COMPLETED: query and reconcile
  OUTCOME_UNKNOWN --> FAILED: authoritative rejection
```

The approved command fingerprint, refundable remainder, original allocations, and inventory
destination are fixed before processing.

## Physical cash shift

```mermaid
stateDiagram-v2
  [*] --> PENDING_OPEN
  PENDING_OPEN --> OPEN
  PENDING_OPEN --> CANCELLED
  OPEN --> SUSPENDED
  SUSPENDED --> OPEN
  OPEN --> COUNTING
  REOPENED --> COUNTING
  COUNTING --> RECONCILIATION_REQUIRED
  RECONCILIATION_REQUIRED --> PENDING_APPROVAL
  RECONCILIATION_REQUIRED --> CLOSED
  PENDING_APPROVAL --> CLOSED
  OPEN --> FORCE_CLOSED
  SUSPENDED --> FORCE_CLOSED
  COUNTING --> FORCE_CLOSED
  CLOSED --> REOPENED
  FORCE_CLOSED --> REOPENED
```

Normal close requires zero pending device commands, a count, reconciliation, and any required
approval. Force-close and reopen append exceptional evidence and never rewrite the ledger.

## Inventory reservation

```mermaid
stateDiagram-v2
  [*] --> REQUESTED
  REQUESTED --> ACTIVE
  REQUESTED --> REJECTED
  ACTIVE --> CONSUMED
  ACTIVE --> RELEASED
  ACTIVE --> EXPIRED
```

Consumption, release, and expiry are terminal. A later correction is a new inventory movement.

## Offline command

```mermaid
stateDiagram-v2
  [*] --> CREATED
  CREATED --> PERSISTED
  PERSISTED --> READY
  READY --> SENDING
  SENDING --> READY: transport retry
  SENDING --> ACKNOWLEDGED
  ACKNOWLEDGED --> APPLIED
  ACKNOWLEDGED --> CONFLICT
  ACKNOWLEDGED --> REJECTED
  CONFLICT --> RECONCILIATION_REQUIRED
  REJECTED --> RECONCILIATION_REQUIRED
```

Persistence precedes tender or network interaction. Conflicts are visible; no command is silently
deleted, repriced, reordered, or retried under a new identity.

## Device enrollment and trust

```mermaid
stateDiagram-v2
  [*] --> UNENROLLED
  UNENROLLED --> CHALLENGE_ISSUED
  CHALLENGE_ISSUED --> ENROLLED
  ENROLLED --> ACTIVE
  ACTIVE --> ROTATION_PENDING
  ROTATION_PENDING --> ACTIVE
  ROTATION_PENDING --> REVOKED
  ACTIVE --> REPLACED
  ACTIVE --> REVOKED
  ACTIVE --> BLOCKED_VERSION
  BLOCKED_VERSION --> ACTIVE: certified update
```

Revoked and replaced devices cannot reactivate. Recovery issues a new bounded challenge or rotates
to new non-exportable key material; shared secrets are never redisclosed.

## Operator session

```mermaid
stateDiagram-v2
  [*] --> LOCKED
  LOCKED --> AUTHENTICATING
  AUTHENTICATING --> ACTIVE
  AUTHENTICATING --> LOCKED
  ACTIVE --> REFRESHING
  REFRESHING --> ACTIVE
  REFRESHING --> EXPIRED
  ACTIVE --> EXPIRED
  ACTIVE --> REVOKED
  ACTIVE --> SIGNED_OUT
  EXPIRED --> AUTHENTICATING
  SIGNED_OUT --> AUTHENTICATING
```

Refresh during an active shift still needs device proof and current membership, branch, and
entitlement. Revocation fails the next online command closed.

## Kitchen order

```mermaid
stateDiagram-v2
  [*] --> COMMITTED
  COMMITTED --> ACCEPTED
  ACCEPTED --> PREPARING
  PREPARING --> READY
  READY --> COMPLETED
  COMMITTED --> REJECTED_PENDING_REMEDIATION
  ACCEPTED --> REJECTED_PENDING_REMEDIATION
```

Only committed orders enter KDS. Offline kitchen rejection creates a manager-remediation task; it
does not alter payment, cash, loyalty, or inventory.

## Cross-machine ordering

```mermaid
flowchart LR
  C[Checkout COMMITTED] --> P[Payment CAPTURED]
  C --> I[Reservation CONSUMED]
  C --> R[Receipt frozen]
  C --> K[KDS COMMITTED]
  C --> H[Cash entry appended]
  O[Offline command APPLIED] --> C
  F[Refund COMPLETED] --> I2[Return movement]
  F --> H2[Cash or provider compensation]
```

For cash checkout these effects are one authoritative commit. Asynchronous delivery may project or
notify, but must not infer a missing core financial effect.
