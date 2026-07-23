# ADR-0028: Native password verifier and provider-neutral authentication boundary

- Status: Accepted
- Date: 2026-07-12

## Context

ADR-0027 requires a global provider-neutral User and leaves build-versus-buy open. Prompt 4.1B requires exact server-side opaque sessions, refresh reuse detection, session-bound CSRF, local Mailpit recovery and real Compose tests. NEXO Membership must remain the only tenant authority.

## Decision

Implement the first-party password verifier and session authority inside the Authentication module using `@nexo/identity` concepts and infrastructure ports. PostgreSQL is authoritative for sessions, refresh generations, recovery/verification tokens and security events; Redis provides fail-closed throttling only. Browser credentials are opaque CSPRNG cookies, never JWT/localStorage values. Store only keyed digests, rotate refresh and CSRF secrets, retain consumed refresh generations to detect replay and revoke the whole session family.

This does not activate OAuth, SSO, MFA, WebAuthn, passkeys, magic links or passwordless. Those remain adapter decisions. An external organization claim never replaces NEXO Membership resolution.

## Alternatives

Keycloak, Auth0, Clerk, Ory, FusionAuth and ZITADEL were compared in `IdentityProviderDecision.md`. Managed providers reduce verifier operations but introduce plan/residency/vendor availability and duplicate or conflict with NEXO's global User plus Membership. Self-hosted products add another production datastore/runtime and upgrade surface. A hybrid managed verifier now still leaves NEXO's required session semantics and creates dual identity truth.

## Consequences and review

NEXO accepts ownership of password/authentication security, abuse response and recovery correctness. It must maintain ASVS evidence, independent pentest before GA, secret/KMS controls and crypto/rate calibration. Reevaluate before enterprise federation, regulated residency/SLA, 10,000 active identities, material support burden or a provider offering clean global-User mapping and contractual portability.

Rollback is module unregistration plus schema preservation; no destructive down migration. A later IdP migration maps external subject to stable User ID through a new additive binding table.
