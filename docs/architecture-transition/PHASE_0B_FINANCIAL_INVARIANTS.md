# Phase 0B — Financial Invariants

## Authority

These invariants survive as requirements and test vectors. NEXO implementations do not survive.
UMI API and Supabase PostgreSQL become the sole financial authority.

| ID     | Rationale                    | Invariant                                                                                        | Failure consequence                       | Validation strategy                                        | Future module            |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------- | ------------------------ |
| FI-001 | Exact arithmetic             | Store signed 64-bit minor units with explicit ISO currency.                                      | Rounding drift or ambiguous value         | Boundary/property vectors; overflow and currency tests     | Contract and money types |
| FI-002 | Single calculation authority | Clients never author totals, tax, change, business date, or loyalty value.                       | Tampering and divergent records           | Recompute server-side; reject mismatched fingerprints      | POS checkout             |
| FI-003 | Deterministic rounding       | Apply one documented rounding order and mode to integer results.                                 | Receipts and settlements disagree         | Golden vectors for lines, discounts, tax, split tender     | Pricing and checkout     |
| FI-004 | Inclusive tax truth          | Tax derives from product, branch, tax category, and pinned policy.                               | Wrong customer charge or reporting        | Quote/commit parity and historical policy vectors          | Pricing and tax          |
| FI-005 | Business-date truth          | Server time, branch timezone, and cutoff determine business date.                                | Shift/report period misstatement          | Boundary clocks around DST and cutoff                      | Checkout and shifts      |
| FI-006 | Immutable sale snapshot      | Committed lines, modifiers, price, tax, discount, tip, and actors freeze.                        | Historical repricing                      | Mutation-negative tests and receipt hash stability         | Orders and receipts      |
| FI-007 | Append-only ledgers          | Payments, refunds, loyalty, inventory, cash, and audit facts append only.                        | Audit loss and silent financial rewriting | Database constraints, permission tests, ledger replay      | Tenant ledgers           |
| FI-008 | Compensating correction      | Corrections use void/refund/return/adjustment facts, never deletion.                             | Broken lineage                            | Original-plus-compensation reconciliation                  | Refunds and ledgers      |
| FI-009 | Command idempotency          | Same command/fingerprint returns the original result.                                            | Duplicate charge, order, or movement      | Response-loss tests at every commit boundary               | Runtime command store    |
| FI-010 | Fingerprint conflict         | Same command identity with different input is rejected.                                          | Key hijack or ambiguous ownership         | Canonical fingerprint conflict vectors                     | Runtime command store    |
| FI-011 | Payment ambiguity            | Unknown payment outcome is query-only.                                                           | Double charge                             | Timeout/response-loss/provider-query scenarios             | Payments                 |
| FI-012 | Lock boundary                | External provider calls never occur while database locks are held.                               | Deadlock, long lock, ambiguous rollback   | Architecture tests, transaction tracing, failure injection | Payments                 |
| FI-013 | Atomic cash checkout         | Order, allocations, cash, inventory, loyalty, receipt, KDS, audit, and result commit atomically. | Cross-ledger divergence                   | Failure injection before/after every write boundary        | POS transaction service  |
| FI-014 | Refund ceiling               | Cumulative refund never exceeds captured refundable amount or quantity.                          | Financial loss                            | Partial/full/repeated/concurrent refund vectors            | Refunds                  |
| FI-015 | Allocation conservation      | Tender allocations minus refunds equal authoritative paid value.                                 | Settlement mismatch                       | Mixed-tender and sequential refund reconciliation          | Payments                 |
| FI-016 | Cash expectation             | Expected cash equals opening float plus immutable cash movements.                                | Unexplained drawer variance               | Ledger-fold property tests and source reconciliation       | Physical cash            |
| FI-017 | Blind count                  | Count is submitted before expected cash or variance disclosure.                                  | Count bias and fraud opportunity          | Authorization/UI/API negative tests                        | Physical cash            |
| FI-018 | Close synchronization        | Shift close requires all prior owned commands and cash effects synchronized.                     | Stranded sale/cash posting                | Worker-offline and replay-before-close scenarios           | Shifts and sync          |
| FI-019 | Folio uniqueness             | Official order/receipt identifiers are atomic, unique, and never reused.                         | Duplicate legal/operational identity      | Real concurrent allocation tests                           | Orders and receipts      |
| FI-020 | Receipt integrity            | Receipt content is a versioned immutable projection with integrity hash.                         | Undetectable representation tampering     | Stable snapshot/hash and reprint parity tests              | Receipts                 |
| FI-021 | Inventory conservation       | Counts post deltas; transfers pair origin/in-transit/destination movements.                      | Stock creation or double counting         | Ledger conservation and concurrent transfer tests          | Inventory                |
| FI-022 | Approval specificity         | Fresh PIN and manager approval bind to one exact command and expire.                             | Privilege replay                          | Wrong-command, expired, self-approval, race tests          | Approval service         |
| FI-023 | Manual terminal uncertainty  | Manual terminal payment remains `unverified` until provider reconciliation.                      | False settlement certainty                | Import/reconciliation and duplicate-reference tests        | Payments                 |
| FI-024 | Offline snapshot integrity   | Offline sale retains pinned price, tax, policy, contract, and exposure.                          | Silent repricing or uncontrolled risk     | Signed snapshot tamper/expiry/replay vectors               | POS sync                 |

## Mandatory reconciliation equation

For every committed sale:

```text
authoritative total
= captured tender allocations
- explicit change

remaining refundable
= captured refundable allocations
- completed refund allocations

expected cash
= opening float
+ cash sales
- cash change
- cash refunds
+ manual in
- manual out
- withdrawals
- deposits
+/- transfers and compensating corrections
```

Every term is an immutable, scoped fact. Projection caches may be rebuilt from those facts.

## Security and Assistant boundary

- Tenant, branch, device, operator, resource version, and permission are part of each consequential
  financial decision.
- Rate limiting is supplemental; it never replaces idempotency, authorization, or invariants.
- Logs and Assistant outputs redact PINs, phone numbers, device key material, tokens,
  receipt-access data, and card-sensitive data.
- Umi Assistant may explain authoritative values and prepare a command for confirmation. It may not
  calculate the official total, approve itself, retry an unknown payment as a new charge, or alter
  immutable history.

## Evidence

`docs/architecture-transition/PHASE_0A_INVARIANT_CATALOG.md`,
`docs/SalesIdempotency.md`, `docs/ReceiptModel.md`, `docs/CashCounting.md`,
`docs/CashReconciliation.md`, `docs/InventoryEngine.md`, and the authoritative fusion plan.
