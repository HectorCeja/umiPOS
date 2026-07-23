# Authentication threat model

**Scope:** Prompt 4.1B login, logout, opaque sessions, refresh rotation, recovery, email verification, device recognition and security evidence. **Method:** STRIDE plus abuse cases. Authentication establishes a global `User`; it never selects or authorizes an Organization.

## Assets and trust boundaries

Restricted assets are password verifiers, session/refresh/CSRF secrets, recovery and verification tokens, rate-limit keys and mail links. Confidential assets are email, IP, user agent, device evidence and security events. Boundaries are browser–API, API–PostgreSQL, API–Redis, API–SMTP/Mailpit and verified principal–tenant resolution.

## Threat register

| ID    | Threat / vector                                              | Implemented mitigation and evidence                                                                                                                                               | OWASP Top 10:2025 | ASVS 5 area / Cheat Sheet                         |
| ----- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------- |
| AT-01 | Credential stuffing or password spraying across accounts/IPs | uniform failure, Argon2id dummy verification, atomic IP + account throttles, durable consecutive-failure state, generic 401, security events                                      | A07, A09          | Authentication; Authentication CS                 |
| AT-02 | Brute force against one account                              | 15-character minimum, compromised-password port, calibrated Argon2id, escalating throttle and temporary account lock without permanent attacker-induced denial                    | A04, A07          | Authentication, Cryptography; Password Storage CS |
| AT-03 | User enumeration through body, status, mail or timing        | same accepted recovery/verification response, canonical-email lookup, dummy password verification, no raw email in rate/log keys                                                  | A07               | Authentication; Forgot Password CS                |
| AT-04 | Timing side channel in secret comparison                     | fixed-cost password path and constant-time digest comparison; tokens are digested before lookup                                                                                   | A04, A07          | Cryptography, Authentication                      |
| AT-05 | Session fixation                                             | server creates a fresh CSPRNG session after authentication; no client session identifier is accepted; tokens rotate after refresh                                                 | A07               | Session Management; Session Management CS         |
| AT-06 | Session hijacking / token theft                              | opaque 256-bit secrets, only keyed digests at rest, `Secure`/`HttpOnly`/host-only cookies, absolute + idle expiry, revocation and audit                                           | A04, A07          | Session Management; Session Management CS         |
| AT-07 | Refresh replay or reuse after rotation                       | every refresh generation is retained as ROTATED/ACTIVE evidence; compare-and-swap consumption; reuse revokes the complete session/token family and emits `REFRESH_REUSE_DETECTED` | A07, A09          | Session Management, Token Authentication          |
| AT-08 | Concurrent refresh race                                      | serializable transaction, conditional ACTIVE→ROTATED update and unique token digests; loser is treated as reuse and closes the family                                             | A06, A07, A10     | Secure Coding, Session Management                 |
| AT-09 | CSRF on cookie-authenticated mutation                        | SameSite cookie, exact Origin allowlist when present, double-submit value whose keyed digest must equal the authenticated Session record; refresh binds CSRF before rotation      | A01, A07          | Session Management; CSRF Prevention CS            |
| AT-10 | XSS steals session                                           | auth and refresh cookies are HttpOnly; CSRF secret alone cannot authenticate; CSP remains a web release control; no token in localStorage or response body                        | A05, A07          | Frontend Security, Session Management             |
| AT-11 | Sliding session becomes immortal                             | activity extends only idle expiry and is capped by immutable absolute expiry; remember-me changes the absolute budget but never removes it                                        | A07               | Session Management; NIST SP 800-63B §5            |
| AT-12 | Password-reset token theft/replay                            | CSPRNG token, keyed digest only, purpose/user binding, 30-minute TTL, previous-token revocation, atomic one-time consume, all sessions revoked, no automatic login                | A04, A07          | Authentication; Forgot Password CS                |
| AT-13 | Email-verification token replay/wrong address                | token binds UserEmail + purpose, 24-hour TTL, prior token revocation and atomic consume; confirmation updates that address only                                                   | A07               | Authentication; Forgot Password principles        |
| AT-14 | Recovery bypasses account controls                           | only eligible lifecycle states receive mail, completion rechecks token and User, resets verifier and revokes sessions; recovery does not grant tenant membership                  | A01, A07          | Authentication, Authorization                     |
| AT-15 | MFA bypass                                                   | MFA feature remains disabled and no endpoint/claim can assert MFA; later enablement requires a separate ceremony threat model and phishing-resistant WebAuthn preference          | A07               | MFA; NIST SP 800-63B                              |
| AT-16 | Device spoofing / fingerprint tracking                       | fingerprint is pseudonymous evidence, not an authenticator; recognition never bypasses password/MFA; raw fingerprint is not logged; revocation closes its sessions                | A07, A09          | Session Management, Privacy                       |
| AT-17 | Remember-device weakens authentication                       | in 4.1B it records recognition only and cannot satisfy or suppress MFA; trust has bounded expiry and explicit revocation                                                          | A07               | Authentication, MFA                               |
| AT-18 | Administrative forced logout abused                          | application port requires an authenticated platform actor/reason; no public business-role endpoint is exposed in this phase; every action is audited                              | A01, A09          | Authorization, Logging                            |
| AT-19 | Security log tampering or secret leakage                     | runtime can append but not update/delete security events; metadata is allowlisted and excludes raw credentials/tokens/email; correlation uses opaque IDs                          | A02, A09          | Logging CS                                        |
| AT-20 | Redis failure bypasses abuse protection                      | authentication fails closed when the rate-limit store is unavailable; durable account failure counters remain PostgreSQL truth                                                    | A07, A10          | Authentication, Error Handling                    |

## Security acceptance evidence

Real PostgreSQL/Redis/Mailpit/HTTP tests must demonstrate rotation and reuse closure, session-bound CSRF, absolute/idle expiration, single-use reset and verification, session listing/revocation, uniform public recovery response and append-only events. Playwright exercises the deployed Compose API without mocked infrastructure. RLS A/B remains a separate mandatory regression because authentication is not tenant authorization.

Final evidence also suspends an account after token issuance: reset completion is denied with `403`, proving recovery cannot overwrite an intervening administrative lifecycle decision. A forward-only migration revokes all pre-hardening action tokens lacking an explicit email binding.

## Residual risk

- Password authentication is not phishing-resistant; WebAuthn/passkeys remain disabled until a later complete ceremony.
- IP and user-agent location are evidence, not identity; no GeoIP provider is selected, so location is nullable.
- A compromised API process can use live database capabilities. Workload/secret isolation, SAST/SCA, production KMS and independent pentest remain GA controls.
- Native authentication creates an ongoing security-maintenance obligation accepted in ADR-0028 and reviewed before GA or any federation requirement.

## Official references

- [OWASP Top 10:2025 A07 Authentication Failures](https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/)
- [OWASP ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0)
- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) and [Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html)
