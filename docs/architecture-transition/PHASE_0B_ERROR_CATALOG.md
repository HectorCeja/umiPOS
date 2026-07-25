# Phase 0B — Business Error Catalog

## Contract

Errors below are stable business meanings proposed for future UMI contracts. They are not framework
exceptions and do not imply preservation of NEXO routes or implementations. The complete operator
message, recovery guidance, audit requirement, and Assistant explanation are in
`phase-0b-error-catalog.json`.

| Error code                        | Business meaning                                 | Safe recovery                                   | Audit level |
| --------------------------------- | ------------------------------------------------ | ----------------------------------------------- | ----------- |
| `permission_denied`               | Effective permission/scope missing               | Use an authorized actor                         | Standard    |
| `cross_tenant_access_denied`      | Resource belongs to another business             | Return to authorized context                    | Security    |
| `cross_branch_access_denied`      | Actor/device lacks branch scope                  | Use assigned branch or managed reassignment     | Security    |
| `entitlement_inactive`            | Required capability is inactive                  | Owner reviews entitlement                       | Standard    |
| `device_revoked`                  | Device is no longer trusted                      | Audited replacement enrollment                  | Security    |
| `device_branch_mismatch`          | Device and active branch differ                  | Managed reassignment                            | Security    |
| `device_proof_invalid`            | Signed request proof is invalid                  | Clock/network diagnostics; rotate if approved   | Security    |
| `minimum_version_required`        | Client is below policy                           | Install certified release                       | Standard    |
| `operator_session_expired`        | Operator session is invalid                      | Fresh authentication                            | Standard    |
| `operator_locked`                 | PIN abuse control blocked authentication         | Wait or authorized recovery                     | Security    |
| `fresh_pin_required`              | Consequential action needs recent authentication | Complete trusted-device PIN ceremony            | Standard    |
| `manager_approval_required`       | Independent command-bound approval needed        | Eligible manager approves once                  | High        |
| `idempotency_conflict`            | Command ID reused with different input           | Query original; distinguish a genuinely new act | High        |
| `checkout_version_conflict`       | Checkout changed concurrently                    | Reload, review, explicitly resubmit             | Standard    |
| `catalog_snapshot_stale`          | Pinned catalog/policy is no longer acceptable    | Refresh and re-quote                            | Standard    |
| `currency_mismatch`               | Resource currencies differ                       | Correct context; never auto-convert             | High        |
| `insufficient_inventory`          | Availability fails current policy                | Adjust or authorized advisory override          | Standard    |
| `shift_not_open`                  | Active owned cash shift required                 | Open online on assigned device/register         | High        |
| `shift_state_conflict`            | Shift state/version forbids command              | Reload and follow allowed transition            | High        |
| `cash_mismatch`                   | Variance exceeds automatic tolerance             | Review, recount, reason, approval               | High        |
| `unsynchronized_commands_pending` | Shift has non-authoritative commands             | Sync and resolve; never discard                 | High        |
| `payment_outcome_unknown`         | Original charge outcome is ambiguous             | Query original intent only                      | Critical    |
| `refund_exceeds_remaining`        | Refund exceeds refundable remainder              | Reload history and reduce request               | High        |
| `receipt_access_denied`           | Receipt ownership/permission absent              | Authenticate correct owner/staff                | Security    |
| `offline_command_rejected`        | Offline capability or trust check failed         | Preserve evidence and reconnect                 | High        |
| `contract_version_unsupported`    | Client/server contract incompatible              | Safe update with journal preservation           | Standard    |
| `kds_transition_conflict`         | Kitchen action is stale or invalid               | Reload; create remediation if required          | Standard    |

## Error-envelope requirements

- Include stable code, safe localized message, redacted correlation ID, retry classification, and
  structured recovery category.
- Do not expose stack traces, SQL, provider payloads, foreign resource existence, permission
  internals, PIN thresholds, or secret-bearing identifiers.
- A retryable transport condition is not automatically a retryable business command.
- `payment_outcome_unknown`, idempotency conflict, version conflict, and offline rejection require
  query or reconciliation before mutation.
- Umi Assistant may translate the structured code into role-appropriate guidance. It cannot change
  the error, widen permission, fabricate success, or invoke a consequential recovery without the
  normal confirmation and approval contract.
