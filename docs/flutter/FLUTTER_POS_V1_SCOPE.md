# NEXO POS Flutter V1 Scope

Frozen: 2026-07-16. Authority: product roadmap acceptance criteria, domain module catalog, security/payment requirements and the owner's Part 4E constraints.

| Capability                             | Classification            | Rationale                                                              | Current implementation                | Action                                 |
| -------------------------------------- | ------------------------- | ---------------------------------------------------------------------- | ------------------------------------- | -------------------------------------- |
| Enrollment/revocation                  | REQUIRED FOR V1           | Secure operational terminal                                            | Productive real-service flow          | CERTIFIED                              |
| Login/restore/refresh/logout           | REQUIRED FOR V1           | Identity is MVP MOD-01                                                 | Productive restore/refresh flow       | CERTIFIED                              |
| Organization/branch/device context     | REQUIRED FOR V1           | CA-007 and tenant isolation                                            | Backend-validated context             | CERTIFIED                              |
| Effective permissions                  | REQUIRED FOR V1           | CA-006/031                                                             | Contextual backend evaluation         | CERTIFIED                              |
| Cash open/active/count/close           | REQUIRED FOR V1           | CA-001/004; MOD-11                                                     | Complete authoritative lifecycle      | CERTIFIED                              |
| Catalog/search/barcode/cart            | REQUIRED FOR V1           | CA-001/002; MOD-06/09                                                  | Productive catalog and scanner        | CERTIFIED                              |
| Cash sale/idempotent completion        | REQUIRED FOR V1           | Vertical sale and CA-010                                               | Exact financial E2E                   | CERTIFIED                              |
| Payment unknown recovery               | REQUIRED FOR V1           | Financial safety                                                       | Persisted authoritative recovery      | CERTIFIED                              |
| Receipt/render/reprint test adapter    | REQUIRED FOR V1           | MOD-14; CA-002                                                         | Canonical receipt/audited reprint     | CERTIFIED                              |
| Minimal diagnostics/log redaction      | REQUIRED FOR V1           | Operability/security                                                   | Restricted sanitized diagnostics      | CERTIFIED                              |
| Avatar CSP/persistence                 | REQUIRED FOR V1           | Explicit owner defect; CA-033                                          | Private read/render/session lifecycle | CERTIFIED                              |
| Real RLS/cross-tenant V1               | REQUIRED FOR V1           | CA-031                                                                 | Executed with real runtime roles      | CERTIFIED                              |
| External payment registration          | REQUIRED FOR V1           | MVP records external tender (`06-seguridad-y-privacidad`)              | Explicit non-sensitive confirmation   | CERTIFIED                              |
| Mixed tender UI                        | DEFERRED POST-V1          | No explicit product acceptance criterion requires Flutter mixed tender | Backend-ready, no Flutter UI          | Backlog                                |
| Refund administration                  | WEB ADMIN ONLY            | Approved Sales Administration owns request/approval UI                 | Implemented Web Admin                 | POS shows resulting receipt/state only |
| Advanced cancellation                  | WEB ADMIN ONLY            | Administrative command surface                                         | Web Admin/domain                      | Local cart cancel remains V1           |
| Financial offline                      | DISABLED BY DESIGN        | Explicit V1 safety decision in Part 4E                                 | Fail-closed                           | Preserve drafts/cache only             |
| Hardware-specific printing             | DEFERRED POST-V1          | No contracted hardware                                                 | No adapter                            | Keep test adapter V1                   |
| Remote OTel collector from Flutter     | DEFERRED POST-V1          | External infrastructure is not required for local observability        | Backend OTel exists                   | Structured sanitized events V1         |
| Windows/macOS build execution on Linux | INFRASTRUCTURE LIMITATION | Runner mismatch                                                        | Workflows required                    | Do not claim executed                  |
| Analytics/user administration in POS   | NOT IN SCOPE              | Web Admin responsibility                                               | Not present                           | None                                   |

Only rows marked **REQUIRED FOR V1** block Part 5.
