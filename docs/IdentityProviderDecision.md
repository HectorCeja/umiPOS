# Identity provider decision

Prompt 4.1B selects a native first-party verifier for password authentication and server-side sessions, behind the stable Identity ports. This is not a decision to implement OAuth/OIDC, SSO, MFA or WebAuthn ourselves: those remain replaceable adapters and disabled capabilities.

## Comparison at the 2026-07-12 decision date

| Alternative | Cost / operation                                                                                                                           | Multi-tenant fit for NEXO                                                                                                               | Security and maintenance                                                                                         | Lock-in / conclusion                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Native      | no provider fee; uses current API/PostgreSQL/Redis/Mailpit; highest engineering duty                                                       | exact fit: one global User may join many NEXO Organizations while Membership stays authoritative                                        | full control of opaque session/reuse/CSRF evidence, but NEXO owns patching, abuse controls, recovery and pentest | lowest data-model lock-in; **selected for first-party password flow**            |
| Keycloak 26 | open source/self-hosted; adds JVM service, upgrades, HA and on-call surface                                                                | Organizations support B2B within a realm, but its realm/org administration and claims would duplicate NEXO Membership                   | mature protocols and broad features; day-two security/upgrade burden remains ours                                | moderate model/operational coupling; reconsider for self-hosted federation suite |
| Auth0       | managed; published free tier has 5 Organizations, Essentials USD 35/month has 10 at 500 MAU; larger B2B features/limits are plan-sensitive | strong B2B Organizations, but organization limits and provider roles would duplicate the canonical tenant model                         | low verifier operations, strong managed controls; residency/contract and external availability required          | high API/pricing dependency; candidate when enterprise SSO/SLA justifies it      |
| Clerk       | managed; 50k MRU free, Pro USD 25/month; enhanced B2B USD 100/month and metered organizations                                              | polished B2B UI, but its Organization/member/permission/billing model overlaps NEXO substantially                                       | fast integration, MFA/passkeys and device management; provider-specific UI/session semantics                     | high product-model and UI lock-in; rejected for core NEXO domain                 |
| Ory         | open source components or managed; published Production USD 70/month and Growth/B2B about USD 9,350/year                                   | flexible/headless, but B2B multi-tenancy sits in a higher managed tier and needs substantial integration composition                    | strong primitives; more components and integration responsibility than a turnkey IdP                             | moderate protocol lock-in, high integration complexity; no current advantage     |
| FusionAuth  | Community is free/unlimited; paid features/support vary; self-hosted or managed                                                            | its Tenant is a separate user namespace and may duplicate the same email/password per tenant, conflicting with global User + Membership | mature auth and per-tenant configuration; adds a dedicated operational product and license gates for features    | moderate/high model coupling; semantic mismatch is decisive                      |
| ZITADEL     | Cloud Free includes unlimited Organizations/100 DAU; Pro USD 100/month; self-host Enterprise is commercial                                 | excellent organization-first B2B model, but users live in org pools and policies/administration would overlap NEXO                      | standards-based, passkeys and event-sourced audit; adds a second identity control plane                          | good future candidate, but migration/control-plane complexity is unjustified now |

## Decision rationale

NEXO already has a global User, canonical email identities, password verifier metadata, Membership-based cross-organization access and a requirement for exact server-side opaque-session behavior. Delegating only credential verification now would still require NEXO to retain its session, tenant and audit model, while delegating the whole model would create dual sources of truth or require a disruptive migration. The required local/offline development stack must also work without a cloud provider.

The native choice is bounded:

1. `@nexo/identity` remains provider-neutral.
2. Password hashing uses the platform Argon2id primitive; NEXO invents no cryptography.
3. Tokens are opaque CSPRNG values; only keyed digests persist.
4. NEXO Membership, never an IdP organization claim, authorizes tenants.
5. OAuth/OIDC, SSO, WebAuthn/passkeys and MFA remain off until their own adapter, threat model, migration and tests exist.
6. A provider evaluation is reopened before enterprise federation, regulated residency/SLA, 10,000 active identities, or when authentication security/on-call work exceeds one engineer-month per quarter.

## Consequences

Positive: exact domain fit, real offline local tests, no per-organization vendor ceiling, stable IDs and full revocation evidence. Negative: NEXO owns anti-abuse calibration, dependency/crypto upgrades, deliverability, incident response and independent security testing. Production KMS/secret management, compromised-password corpus and external pentest remain release gates, not reasons to weaken local controls.

## Official product sources

- [Keycloak Organizations](https://www.keycloak.org/docs/latest/server_admin/index.html#_managing_organizations)
- [Auth0 Organizations](https://auth0.com/docs/manage-users/organizations/organizations-overview) and [pricing](https://auth0.com/pricing)
- [Clerk Organizations](https://clerk.com/organizations) and [pricing](https://clerk.com/pricing)
- [Ory pricing](https://www.ory.sh/pricing/)
- [FusionAuth tenants](https://fusionauth.io/docs/get-started/core-concepts/tenants) and [pricing](https://fusionauth.io/pricing)
- [ZITADEL Organizations](https://zitadel.com/docs/guides/manage/console/organizations-overview) and [pricing](https://zitadel.com/pricing)
