# Phase 0B — Business Rule Catalog

## Scope and authority

This catalog extracts business knowledge for reimplementation in UMI. It does not preserve NEXO
runtime authority or recommend copying implementation. The machine-readable source is
`phase-0b-business-rules.json`.

Security review uses OWASP Top 10:2025 and OWASP API Security Top 10:2023, plus tenant and branch
isolation, least privilege, device trust, immutable financial history, auditability, idempotency,
and abuse resistance.

## Rule index

| ID          | Rule                                        | Trigger                    | Expected behavior                                      | Forbidden behavior                               | Future UMI owner                |
| ----------- | ------------------------------------------- | -------------------------- | ------------------------------------------------------ | ------------------------------------------------ | ------------------------------- |
| BR-SALE-001 | Server-authoritative quote                  | Quote or commit            | Versioned server-derived commercial result             | Client-authored or silently stale totals         | `apps/umi-api` POS              |
| BR-SALE-002 | Immutable committed sale                    | Successful commit          | Freeze snapshots; compensate later                     | Edit or delete committed facts                   | `apps/umi-api` POS              |
| BR-SALE-003 | Optimistic checkout concurrency             | Concurrent mutation        | Reject stale version                                   | Last-write-wins financial mutation               | `apps/umi-api` POS              |
| BR-SALE-004 | Suspend and resume preserve identity        | Suspend or resume          | Preserve checkout/version/branch                       | Duplicate or cross-branch cart                   | `apps/umi-api` POS              |
| BR-SALE-005 | Cancellation before payment only            | Cancellation               | Reason, permission, release, audit                     | Cancel a completed sale                          | `apps/umi-api` POS              |
| BR-CMD-001  | Idempotent command replay                   | Mutation or retry          | Same fingerprint returns recorded result               | Duplicate effect                                 | `apps/umi-api` runtime          |
| BR-CMD-002  | Idempotency fingerprint conflict            | Key reused with new input  | Stable conflict; retain original                       | Overwrite original command                       | `apps/umi-api` runtime          |
| BR-PAY-001  | Unknown payment outcome is query-only       | Ambiguous provider result  | Query and reconcile original intent                    | Start a replacement charge                       | `apps/umi-api` payments         |
| BR-PAY-002  | Allocation cannot exceed balance            | Tender allocation          | Validate method/currency/amount/reference              | Count rejected or duplicate payment              | `apps/umi-api` payments         |
| BR-PAY-003  | Manual terminal data minimization           | SIM-terminal record        | Store only non-sensitive evidence                      | Store PAN/CVV/track/secrets                      | `apps/umi-api` payments         |
| BR-REF-001  | Refund bounded by original sale             | Refund preparation         | Derive remaining refundable value                      | Over-refund or foreign allocation                | `apps/umi-api` refunds          |
| BR-REF-002  | Post-payment refund requires approval       | Refund submission          | Fresh PIN, independent approval, audit                 | Broad/reused/self approval                       | `apps/umi-api` refunds          |
| BR-RCT-001  | Receipt is an immutable projection          | Commit/retrieve/reprint    | Same authoritative facts across adapters               | Mutate sale during reprint                       | `apps/umi-api` receipts         |
| BR-RCT-002  | Digital receipt ownership                   | Receipt access             | Account ownership or audited staff access              | Identifier-based disclosure                      | `apps/umi-api` receipts         |
| BR-CASH-001 | Online shift opening                        | Shift open                 | Atomically bind device/register/operator/branch/policy | Offline or foreign-session opening               | `apps/umi-api` POS cash         |
| BR-CASH-002 | Append-only cash ledger                     | Physical cash change       | Append typed, scoped, correlated entry                 | Rewrite balances/history                         | `apps/umi-api` POS cash         |
| BR-CASH-003 | Blind count before disclosure               | Enter counting             | Server-recomputed immutable count                      | Reveal expected cash first                       | `apps/umi-api` POS cash         |
| BR-CASH-004 | Deterministic reconciliation                | Count submitted            | Fold ledger and classify variance                      | Fabricate a match                                | `apps/umi-api` POS cash         |
| BR-CASH-005 | Close waits for authoritative sync          | Normal close               | Prove commands, count, reconciliation, approvals       | Close around pending effects                     | `apps/umi-api` POS cash         |
| BR-CASH-006 | Controlled force-close and reopen           | Exceptional manager action | Append evidence, reason, approval, alert               | Erase prior reconciliation                       | `apps/umi-api` POS cash         |
| BR-INV-001  | Immutable inventory movements               | Inventory operation        | Append movement and derive projection                  | Rewrite ledger/balance                           | `apps/umi-api` inventory        |
| BR-INV-002  | Reservation bounded by availability         | Checkout preparation       | Enforce availability or explicit advisory override     | Silent policy bypass                             | `apps/umi-api` inventory        |
| BR-INV-003  | Count posts only the difference             | Inventory count            | Preserve observed, projected, and delta                | Replace history with absolute value              | `apps/umi-api` inventory        |
| BR-INV-004  | Transfer has paired states                  | Dispatch/receive           | Correlated origin and destination movements            | Double-count in-transit stock                    | `apps/umi-api` inventory        |
| BR-CUST-001 | Verified customer attachment                | Customer attachment        | Resolve QR/verified phone safely                       | Infer identity or store phone offline            | `apps/umi-api` customers        |
| BR-LOY-001  | Loyalty authorize-commit-reverse            | Redemption                 | Reserve, commit with order, reverse on failure         | Offline or duplicate spend                       | `apps/umi-api` loyalty          |
| BR-AUTH-001 | Current authoritative authorization         | Protected operation        | Resolve membership/scope/permission/entitlement/device | Trust client headers or stale claims             | `apps/umi-api` access control   |
| BR-AUTH-002 | No last active owner removal                | Membership mutation        | Preserve one active owner atomically                   | Orphan business administration                   | `apps/umi-api` access control   |
| BR-APR-001  | Approval bound to exact consequence         | Policy threshold           | Short-lived, one-use, fingerprint-bound decision       | Reuse or broaden approval                        | `apps/umi-api` approval service |
| BR-OFF-001  | Offline capability allowlist                | Connectivity loss          | Permit only snapshot-approved low-risk operations      | Offline privileged or provider actions           | POS client and POS API          |
| BR-OFF-002  | Durable ordered command journal             | Mutation/reconnect         | Encrypt, order, replay, map IDs, expose conflicts      | Drop, reorder, duplicate, or reprice             | POS client and API runtime      |
| BR-KDS-001  | KDS consumes committed kitchen truth        | Checkout commit            | One versioned committed-order projection               | Draft or duplicate ticket                        | UMI API KDS projection          |
| BR-KDS-002  | Durable signed LAN delivery                 | Local KDS delivery         | mTLS, signed envelope, durable ACK, deduplication      | Unsigned or pre-persistence ACK                  | Contract and clients            |
| BR-KDS-003  | Exactly one kitchen fallback                | Missing ACK                | Keep sale, warn, print once, reconcile                 | Duplicate tickets or financial rollback          | `apps/umi-pos`                  |
| BR-REP-001  | Deterministic scoped reporting              | Report/Assistant read      | Scoped, time-zone-aware authoritative projection       | Cross-tenant or wall-clock-dependent aggregation | `apps/umi-api` reporting        |
| BR-AUD-001  | Consequential facts are explainably audited | Consequential action       | Structured redacted decision record                    | Secret-bearing or free-text-only audit           | `apps/umi-api` audit            |

## Exceptions and operational boundaries

- POS v1 inventory availability is advisory only when the persisted policy explicitly permits an
  acknowledged override. The override is visible and audited.
- Cash tender may exceed the due amount only to produce server-derived change.
- Anonymous checkout remains valid, but receives no loyalty effect or digital receipt.
- Force-close is not a normal-close bypass; it is an exceptional, separately permissioned state.
- Offline exposure must use configured limits or an explicitly recorded unlimited-risk acceptance.
- Out-of-scope v1 behavior remains: multicurrency, CFDI, delivery, tabs/coursing, scales, and
  serialized inventory.

## Security review conclusions

- Object IDs never establish access. Business, branch, membership, device, and resource state must
  be checked for every operation.
- Sensitive flows—enrollment, PIN attempts, refunds, approvals, receipt access, loyalty redemption,
  and cash movement—need rate limits and abuse telemetry in addition to authorization.
- External payment and customer services are untrusted inputs: validate schemas, bound resources,
  set timeouts, and preserve ambiguous outcomes.
- Exceptional conditions are explicit business states. They must not become generic success,
  silent retry, or history mutation.
- Umi Assistant may explain these rules and query permission-safe projections; it cannot become an
  alternate authorization, calculation, or mutation authority.

## Evidence

Primary repository evidence is listed per record in the JSON manifest. The authoritative target
architecture is `UMIPOS_FUSION_IMPLEMENTATION_PLAN.md`; NEXO code and schemas remain reference-only.
