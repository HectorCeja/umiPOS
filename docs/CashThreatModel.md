# Cash Threat Model

## Prompt 11.5 evidence status

Current evidence covers ledger immutability, baseline tenant isolation, approval decision races, deposit transition races, handoff accept/reject races, sanitized quarantine and refund replay. Residual uncertified controls correspond directly to the missing refund-negative matrix, remaining PostgreSQL races, automated worker crash recovery, workflow-specific RLS and retry-amplification performance evidence.

| Threat                          | Vector                                   | Controls                                                                       | Verification                                               |
| ------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| False/duplicate movement        | replay or forged event                   | source uniqueness, fingerprint/idempotency, allowlisted Sales port             | replay/concurrency tests                                   |
| Amount/count tampering          | client totals/denominations              | integer money, registry direction, server denomination fold                    | domain/property tests                                      |
| Cross-tenant/Branch IDOR        | guessed IDs                              | DB Membership context, central engine, transactional recheck, FORCE RLS        | Alpha/Beta SQL tests                                       |
| Ledger erasure                  | runtime update/delete                    | privilege revocation plus immutable triggers                                   | privilege assertion                                        |
| Fraudulent withdrawal/refund    | elevated action                          | explicit permission, policy threshold, approval resource, audit                | authorization tests                                        |
| Hidden variance                 | force close/reopen                       | preserved reconciliation, reason, security event, exceptional permission       | lifecycle tests                                            |
| Race/double open/close          | concurrent terminals                     | partial unique indexes, row lock, optimistic version                           | PostgreSQL race tests                                      |
| Collusion/shared device         | credential/custody sharing               | named custody, blind count, no silent handoff, security logs                   | residual operational risk                                  |
| Mixed refund tampering          | card allocation presented as cash        | Sales-authoritative captured allocations; deterministic CASH-only distribution | refund positive matrix `5/5`; negatives pending            |
| Invalid approval reference      | arbitrary UUID supplied to deposit       | approval status/action/resource/expiry binding and persisted deciding actor    | API unit/type gate; dedicated E2E pending                  |
| Worker double claim/lease theft | concurrent workers or crashed claimant   | `SKIP LOCKED`, bounded lease, attempts/backoff, idempotent consumer            | two real workers plus manual recovery; full matrix pending |
| Quarantine disclosure           | operational endpoint leaks payload/error | permission, tenant/Branch filtering, allowlisted sanitized projection          | quarantine API `3/3`                                       |
| CSP bypass or unusable shell    | blocked hydration or relaxed scripts     | request nonce, strict-dynamic and dynamic server rendering                     | connected UI `2/2`                                         |
| Projection inflation            | opening float represented twice          | expected starts at zero; append-only opening entry is the source               | connected UI expected-amount assertion                     |

Mapped controls: OWASP Top 10 2025 Broken Access Control/Security Logging, ASVS V8/V15/V16, Transaction Authorization and Logging Cheat Sheets. Residual risks include compromised POS hardware, offline conflicts, collusion and absent SIEM/pentest.

# Final certification controls (2026-07-14)

Executed evidence now covers duplicate/mixed refund tampering, approval race and self-approval, reopen/deposit/handoff races, double worker claim, lease theft/recovery, replay, retry amplification, sanitized quarantine, cleanup misuse, cross-tenant/cross-branch access, UI permission bypass and ledger mutation. Controls map to the refund negative SQL, 30 concurrency scenarios, dual-worker script, two RLS suites, 40 Cash browser tests and global regression. Residual crash-recovery latency is operational, bounded and observable; no critical security debt remains.
