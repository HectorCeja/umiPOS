# Phase 0A — Invariant Catalog

## Context

- NEXO HEAD: `b6ef871de195484314b78c015ecfde9a5c8697f4`
- UMI HEAD: `d5f399c8528fa3dda752aa37281d1b7a2c174348`

The implementation does not survive unless a row states otherwise.

The invariant and its test vector can survive.

## Financial invariants

| ID     | Invariant                                                                    | NEXO evidence                   | Survival     | UMI module              | Contract or error        | Assistant relevance              |
| ------ | ---------------------------------------------------------------------------- | ------------------------------- | ------------ | ----------------------- | ------------------------ | -------------------------------- |
| FIN-01 | Store money as signed 64-bit minor units.                                    | `packages/sales/src/money.ts`   | KEEP vector  | POS checkout            | Money schema             | Explain exact totals             |
| FIN-02 | Store explicit currency with each amount.                                    | Sales and product types         | KEEP vector  | Catalog and checkout    | Currency field           | Prevent ambiguous answers        |
| FIN-03 | The server authors totals, tax, change, and business date.                   | Sales totals and plan           | REIMPLEMENT  | POS checkout            | Quote response           | Cite authoritative values        |
| FIN-04 | Tax is inclusive and policy-derived.                                         | Pricing documents               | REIMPLEMENT  | Catalog and checkout    | Tax snapshot             | Explain applied tax              |
| FIN-05 | Business date uses server time, branch zone, and cutoff.                     | Plan section 3.5                | REIMPLEMENT  | POS checkout and shifts | Business-date field      | Explain date attribution         |
| FIN-06 | Committed lines, prices, taxes, and receipt content are immutable snapshots. | `packages/sales/src/receipt.ts` | KEEP vectors | Orders and receipts     | Receipt schema           | Stable historical answers        |
| FIN-07 | Payments, refunds, inventory, cash, and audit facts are append-only.         | Cash and sales packages         | KEEP vectors | UMI ledgers             | Stable event types       | Explain history without mutation |
| FIN-08 | Corrections use voids or compensating facts.                                 | Refund and cash documents       | KEEP vectors | Refunds and ledgers     | Reason and source fields | Explain correction lineage       |
| FIN-09 | A cash checkout commits all financial effects atomically.                    | Plan section 3.5                | REIMPLEMENT  | POS transaction service | `shift_state_conflict`   | Never report partial success     |
| FIN-10 | External provider calls do not occur inside database locks.                  | Plan section 3.5                | REIMPLEMENT  | Payment adapter         | Payment intent state     | Explain pending outcomes         |

## Command invariants

| ID     | Invariant                                                      | NEXO evidence                       | Survival    | UMI module            | Contract or error         | Assistant relevance         |
| ------ | -------------------------------------------------------------- | ----------------------------------- | ----------- | --------------------- | ------------------------- | --------------------------- |
| CMD-01 | The same command and fingerprint returns the original result.  | `packages/sales/src/idempotency.ts` | KEEP vector | Runtime command store | Idempotency fields        | Explain replay result       |
| CMD-02 | The same command with different input returns conflict.        | Idempotency tests                   | KEEP vector | Runtime command store | `idempotency_conflict`    | Explain conflict safely     |
| CMD-03 | Unknown payment outcome is query-only.                         | Payment ambiguity plan              | KEEP vector | Payment intent        | `payment_outcome_unknown` | Never suggest a new charge  |
| CMD-04 | Persist a client command before network or tender interaction. | Flutter recovery code               | REIMPLEMENT | Umi POS journal       | `clientCommandId`         | Trace safe diagnostics      |
| CMD-05 | Replay commands in device order.                               | Offline plan                        | REIMPLEMENT | POS sync              | Sequence field            | Explain blocked replay      |
| CMD-06 | No command is silently lost or repriced.                       | Offline plan                        | REIMPLEMENT | POS sync              | Explicit conflict         | Surface every exception     |
| CMD-07 | Map provisional IDs to official IDs without duplication.       | Offline and KDS plan                | REIMPLEMENT | Sync and KDS          | Mapping response          | Explain identity transition |

## Cash and shift invariants

| ID     | Invariant                                                    | NEXO evidence                 | Survival      | UMI module     | Contract or error          | Assistant relevance               |
| ------ | ------------------------------------------------------------ | ----------------------------- | ------------- | -------------- | -------------------------- | --------------------------------- |
| CSH-01 | One device and register own one shift.                       | Cash session documents        | KEEP behavior | Physical cash  | Device and register fields | Scope shift answers               |
| CSH-02 | A shift starts online.                                       | Plan section 4.4              | REIMPLEMENT   | Physical cash  | `shift_not_open`           | Guide valid start                 |
| CSH-03 | A shift cannot close with unsynchronized commands.           | Plan section 3.5              | REIMPLEMENT   | Physical cash  | `shift_state_conflict`     | Explain close blocker             |
| CSH-04 | Expected cash equals opening float plus immutable movements. | `packages/cash/src/ledger.ts` | KEEP vector   | Cash ledger    | Reconciliation schema      | Explain variance                  |
| CSH-05 | Blind count occurs before expected cash disclosure.          | Cash count documents          | KEEP behavior | Physical cash  | Count state                | Do not reveal expected cash       |
| CSH-06 | Handoff and sensitive movements require manager approval.    | Cash approval documents       | KEEP behavior | Physical cash  | Approval token             | Require confirmation and approval |
| CSH-07 | Idempotency keys cannot be permanent shift identities.       | Plan audit defect 2           | REIMPLEMENT   | Shift commands | Per-command key            | Explain conflicts                 |

## Security invariants

| ID     | Invariant                                                                 | NEXO evidence                  | Survival             | UMI module       | Contract or error        | Assistant relevance                |
| ------ | ------------------------------------------------------------------------- | ------------------------------ | -------------------- | ---------------- | ------------------------ | ---------------------------------- |
| SEC-01 | Every financial command binds the device, operator, business, and branch. | Device and authorization tests | KEEP behavior        | Auth and POS     | Signed proof             | Mandatory tool scope               |
| SEC-02 | Device revocation fails the next online command closed.                   | Device requirements            | KEEP vector          | Device trust     | `device_revoked`         | Explain denial only                |
| SEC-03 | Branch mismatch fails closed.                                             | Branch tests                   | KEEP vector          | Device trust     | `device_branch_mismatch` | Never switch silently              |
| SEC-04 | Cross-business and cross-branch access fails at API and database layers.  | Database RLS tests             | KEEP scenario        | RLS and API      | Forbidden envelope       | Tool isolation gate                |
| SEC-05 | Fresh PIN and manager approval bind to the exact command.                 | Cash and refund rules          | KEEP behavior        | Approval service | Approval fields          | Consequential actions require both |
| SEC-06 | Clients have no Supabase credentials or direct table writes.              | Authoritative plan             | REIMPLEMENT boundary | All clients      | API-only                 | Prohibit raw SQL                   |
| SEC-07 | Logs redact PINs, phones, tokens, receipt access, and card data.          | Observability requirements     | ADAPT tests          | Logging          | Redaction policy         | Safe diagnostics                   |
| SEC-08 | RLS views use `security_invoker`.                                         | Plan section 3.6               | REIMPLEMENT          | Reporting        | Read model               | Safe analytics                     |

## Order, receipt, and KDS invariants

| ID     | Invariant                                                      | NEXO evidence        | Survival      | UMI module         | Contract or error      | Assistant relevance        |
| ------ | -------------------------------------------------------------- | -------------------- | ------------- | ------------------ | ---------------------- | -------------------------- |
| ORD-01 | Draft checkouts never appear in KDS.                           | Plan section 3.5     | REIMPLEMENT   | Checkout and KDS   | Commit state           | Report only committed work |
| ORD-02 | KDS sees committed orders only.                                | KDS plan             | KEEP behavior | KDS projection     | Order event            | Explain queue truth        |
| ORD-03 | Printer failure never rolls back a sale.                       | Printing boundary    | KEEP vector   | Receipt and client | Print status           | Guide reprint              |
| ORD-04 | Anonymous sales receive printed receipts only.                 | Product plan         | REIMPLEMENT   | Receipt access     | Ownership mode         | Protect customer data      |
| ORD-05 | Customers access only their receipts.                          | Receipt requirements | KEEP scenario | Receipt access     | Not found or forbidden | Safe lookup                |
| ORD-06 | A provisional KDS ticket becomes official without duplication. | LAN plan             | KEEP vector   | KDS projection     | `clientCommandId`      | Explain mapping            |
| ORD-07 | A missing KDS ACK produces one fallback ticket.                | LAN plan             | KEEP vector   | POS and KDS        | Delivery state         | Guide remediation          |

## Inventory invariants

| ID     | Invariant                                         | NEXO evidence       | Survival      | UMI module           | Contract or error | Assistant relevance    |
| ------ | ------------------------------------------------- | ------------------- | ------------- | -------------------- | ----------------- | ---------------------- |
| INV-01 | Movement history is immutable.                    | Inventory documents | KEEP behavior | Inventory ledger     | Movement type     | Explain stock lineage  |
| INV-02 | Balance is a deterministic projection.            | Inventory package   | REIMPLEMENT   | Inventory projection | Stock view        | Safe read model        |
| INV-03 | Availability can warn without blocking POS v1.    | Product plan        | REIMPLEMENT   | Catalog and checkout | Snapshot state    | Explain warning        |
| INV-04 | Negative stock is an explicit policy consequence. | Acceptance plan     | REIMPLEMENT   | Inventory policy     | Audit event       | Explain anomaly        |
| INV-05 | Counts and transfers remain branch-scoped.        | Inventory E2E       | KEEP scenario | Inventory            | Branch field      | Permission-aware tools |

## Client and offline invariants

| ID     | Invariant                                                  | NEXO evidence     | Survival       | UMI module         | Contract or error          | Assistant relevance      |
| ------ | ---------------------------------------------------------- | ----------------- | -------------- | ------------------ | -------------------------- | ------------------------ |
| CLI-01 | The local database is encrypted with a non-exportable key. | Plan section 4.4  | REIMPLEMENT    | Umi POS            | Release gate               | Guide recovery only      |
| CLI-02 | The POS uses generated immutable models.                   | Plan section 3.2  | REIMPLEMENT    | Contract pipeline  | Contract hash              | Explain version mismatch |
| CLI-03 | A release contains no placeholder URL or fake adapter.     | Plan verification | KEEP gate      | Umi POS CI         | Release manifest           | Diagnostic readiness     |
| CLI-04 | A shift snapshot pins policy and contract version.         | Offline plan      | REIMPLEMENT    | POS bootstrap      | Snapshot fields            | Explain offline limits   |
| CLI-05 | Offline redemption, refund, and close fail closed.         | Offline plan      | KEEP scenarios | POS client and API | `offline_command_rejected` | Never guide a bypass     |

## Extraction rule

Each vector needs:

- the original input
- the expected output
- the invariant identifier
- the target UMI test layer
- the stable error code
- the permission and device context
- the source license record
