# Phase 0A — Retirement Order

## Context

- NEXO HEAD: `b6ef871de195484314b78c015ecfde9a5c8697f4`
- UMI HEAD: `d5f399c8528fa3dda752aa37281d1b7a2c174348`

NEXO cannot become production authority again.

Retirement must preserve useful evidence.

## Dependency order

### 1. Freeze provenance

Keep:

- `origin/transition/nexo-rc-baseline`
- the transition branch
- lockfiles
- source checksums
- license inventory
- repository provenance

Do not rewrite the baseline.

### 2. Extract manifests and invariants

Extract:

- asset inventory
- financial vectors
- command vectors
- RLS scenarios
- cash state rules
- receipt rules
- offline rules
- device threat cases

Do this before source deletion.

### 3. Finish UMI Gate 1

Complete:

- build-v3 convergence
- ordered Supabase migrations
- role and grant repair
- security gate
- staging rehearsal
- backup and restore

Do not merge POS database work before this gate.

### 4. Prepare UMI contract and modules

Create:

- POS entitlement enforcement
- device trust
- operator sessions
- POS contract emitter
- stable errors
- command and idempotency store
- migration plan for new POS facts

NEXO remains reference-only during this step.

### 5. Port reviewed Flutter assets

Port only:

- approved design components
- accessibility utilities
- reviewed hardware interfaces
- test vectors
- goldens after UMI rebranding

Replace:

- API maps
- security state
- local database
- offline state machine
- NEXO names and routes

### 6. Achieve parity gates

Require:

- 100 sequential sales
- atomic cash checkout
- payment ambiguity safety
- shift and inventory parity
- receipt ownership
- KDS committed-order behavior
- offline replay
- cross-scope denial

### 7. Delete replaced NEXO implementation

Delete only after replacement:

- API
- worker
- dashboard
- Prisma schema and migrations
- identity and authorization
- domain persistence
- standalone infrastructure
- SDK and OpenAPI source

Deletion occurs in a later phase.

Phase 0A deletes nothing.

### 8. Retain a tombstone archive

Keep:

- archival tag
- tombstone README
- source checksums
- license record
- invariant catalog
- test extraction map
- historical design references

Mark contradictory documents as superseded.

### 9. Verify no production dependency

Verify:

- no NEXO database
- no NEXO API
- no NEXO worker
- no NEXO secret
- no dual-write
- no reconciliation bridge
- no client Supabase credential
- no NEXO package in UMI release output

## Asset-specific gates

| NEXO asset        | Cannot retire until                   | Can archive now                  |
| ----------------- | ------------------------------------- | -------------------------------- |
| Flutter UI        | Umi POS parity                        | Source screenshots and inventory |
| Money vectors     | They pass in UMI                      | Yes                              |
| Prisma schema     | UMI invariant extraction completes    | Checksums only                   |
| NEXO API          | UMI POS API parity                    | Endpoint inventory               |
| Dashboard         | UMI POS management parity             | Visual references                |
| Worker            | UMI side effects and diagnostics pass | Failure taxonomy                 |
| Cash package      | UMI physical cash parity              | Requirement documents            |
| Inventory package | UMI ledger parity                     | State vocabulary                 |
| OpenAPI and SDK   | UMI contract and clients pass         | Compatibility baseline           |
| Visual snapshots  | UMI design review completes           | Yes                              |
| CI workflows      | UMI gates exist                       | Yes                              |

## Immediate archive candidates

These assets can become reference-only now:

- evidence videos
- historical certification reports
- old screenshots
- obsolete UI acceptance notes
- Docker reproduction notes
- legacy CI recovery reports

Do not delete them during Phase 0A.

## Never-production list

The following assets can never become production authority:

- NEXO API
- NEXO database
- NEXO migrations
- NEXO identity
- NEXO RBAC
- NEXO worker
- NEXO outbox
- NEXO dashboard
- NEXO storage services
- fake UMI sinks
- device outboxes without a UMI consumer
- a federated NEXO-UMI bridge
