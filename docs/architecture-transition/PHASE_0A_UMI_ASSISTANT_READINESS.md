# Phase 0A — Umi Assistant Readiness

## Scope

This phase does not implement Umi Assistant.

It defines the safety inputs for future architecture.

## Existing destination evidence

UMI already contains:

- conversation tool schemas
- tool-loop safety logic
- branch resolution
- product search
- cart and checkout tools
- trace services
- queue and dead-letter infrastructure

Relevant paths include:

- `apps/umi-api/src/modules/conversations/tools`
- `apps/umi-api/src/modules/conversations/security.service.ts`
- `apps/umi-api/src/shared/logging`
- `apps/umi-api/src/jobs`

This infrastructure is partial.

It does not yet prove POS-safe tools.

## Read tools

| Capability             | UMI module            | Permission                | Confirmation | Device                 | Audit       | Safe output            |
| ---------------------- | --------------------- | ------------------------- | ------------ | ---------------------- | ----------- | ---------------------- |
| Sales summary          | Reports               | Financial read            | No           | No                     | Query trace | Aggregated minor units |
| Inventory status       | Inventory             | Inventory read            | No           | Branch scope           | Query trace | Deterministic balance  |
| Shift status           | Physical cash         | Cash read                 | No           | POS scope for operator | Query trace | State and blockers     |
| Payment status         | Payments              | Payment read              | No           | Optional               | Query trace | Redacted state         |
| Receipt lookup         | Receipts              | Receipt read or ownership | No           | Optional               | Query trace | Redacted receipt       |
| KDS queue status       | KDS                   | Kitchen read              | No           | KDS branch scope       | Query trace | Projection state       |
| Anomaly explanation    | Reports and telemetry | Diagnostic read           | No           | Context-dependent      | Required    | Evidence references    |
| Business performance   | Reports               | Management read           | No           | No                     | Required    | Aggregates             |
| System health          | Health and jobs       | Operations                | No           | No                     | Required    | Redacted health        |
| Diagnostic correlation | Logging               | Operations                | No           | No                     | Required    | Redacted command trace |

## Guided actions

Guided actions explain a workflow.

They do not execute the workflow.

| Capability                    | Required source            | Permission                 |
| ----------------------------- | -------------------------- | -------------------------- |
| Refund guidance               | Refund contract and policy | Refund read                |
| Permission explanation        | Permission registry        | Own or managed staff scope |
| Shift reconciliation guidance | Shift state machine        | Cash management            |
| Device enrollment guidance    | Device contract            | Device management          |
| Offline recovery guidance     | Sync conflict model        | POS operator               |
| KDS remediation guidance      | KDS projection and runbook | Kitchen operations         |

## Consequential actions

| Action                      | Permission      | Human confirmation | Fresh PIN    | Manager approval            | Device                   | Audit    |
| --------------------------- | --------------- | ------------------ | ------------ | --------------------------- | ------------------------ | -------- |
| Create promotion            | Catalog manage  | Required           | Policy-based | Policy-based                | No                       | Required |
| Change availability         | Catalog manage  | Required           | No           | No                          | Branch context           | Required |
| Invite employee             | Staff manage    | Required           | Yes          | Role policy                 | No                       | Required |
| Change role                 | Role manage     | Required           | Yes          | Required for high privilege | No                       | Required |
| Open configuration workflow | Settings manage | Required           | Policy-based | Policy-based                | No                       | Required |
| Prepare refund              | Refund prepare  | Required           | Yes          | Required                    | POS or dashboard context | Required |
| Prepare cash adjustment     | Cash adjust     | Required           | Yes          | Required                    | Enrolled POS             | Required |
| Prepare branch change       | Branch manage   | Required           | Yes          | Policy-based                | No                       | Required |

The assistant prepares these actions.

The authoritative service validates and executes them.

## Prohibited direct actions

Umi Assistant must not:

- bypass manager approval
- authorize or capture a payment
- retry an unknown payment as a new charge
- expose PINs, tokens, phone numbers, or card data
- bypass RLS
- execute raw SQL
- alter immutable history
- close a shift without required controls
- change a device branch silently
- use worker access as request authorization

## Required contract fields

Each future tool contract needs:

- stable name and version
- tenant and branch scope
- required permission
- read or mutation classification
- confirmation requirement
- fresh PIN requirement
- manager approval requirement
- device requirement
- idempotency requirement
- stable error codes
- audit event type
- redaction policy
- structured result

## Readiness by NEXO asset

| NEXO asset              | Readiness value                  | Decision                         |
| ----------------------- | -------------------------------- | -------------------------------- |
| Contract schemas        | Useful after UMI rewrite         | RETIRE source, extract semantics |
| Authorization tests     | High safety value                | Rewrite                          |
| Domain events           | Useful vocabulary                | Adapt                            |
| Observability           | Useful correlation and redaction | Adapt                            |
| Operational exceptions  | Useful runbook input             | Archive and curate               |
| Reports tests           | Useful deterministic metrics     | Rewrite                          |
| Cash state rules        | Critical approval boundaries     | Reimplement                      |
| Payment ambiguity rules | Critical prohibition             | Keep vector                      |
| Flutter help patterns   | Useful client surface            | Adapt                            |
| NEXO identity           | Unsafe duplicate authority       | Retire                           |

## Readiness gaps

Before implementation, UMI needs:

- final permission vocabulary
- stable POS errors
- deterministic POS read models
- complete audit events
- redacted correlation across clients and services
- manager approval tokens
- device-bound action context
- contract schemas for tool inputs and outputs
- evaluation cases for denial and confirmation
