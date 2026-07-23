# ADR-0027: Reusable Identity Platform boundary

- Status: Accepted
- Date: 2026-07-12

## Context

Prompt 4.1A requires a durable identity foundation but explicitly excludes login, sessions, refresh, MFA and advanced authorization. An interrupted later-phase implementation had already placed those flows inside the NestJS API and canonical contract. Publishing them now would misrepresent their security maturity and couple the identity domain to HTTP, Redis, Prisma and NEXO business modules.

## Decision

Create `@nexo/identity` as the framework-independent source for User lifecycle, email identity, password credential metadata and capability configuration. It imports no NestJS, Prisma, HTTP, Redis or business module. PostgreSQL remains the persistence adapter through `@nexo/database`; API and SDK contracts describe the future User/Identity/Email surface but have no controllers in 4.1A.

`User` is global platform identity and `Membership` remains the only relation to an Organization. Email is a separate one-to-many entity with one primary address. Password is a replaceable authenticator record with algorithm/version/work factors and history storage; authentication behavior follows in 4.1B.

Existing UUIDv4 user identifiers remain unchanged. RFC 9562 UUIDv7 improves insertion locality, but exposes creation-time ordering and changing existing identity identifiers provides no current benefit. IDs are opaque references, never authorization secrets.

The interrupted authentication files are preserved for recovery, but `IdentityModule` is not registered and its login/session operations are removed from the OpenAPI 2.0 baseline. Re-enabling any flow requires the 4.1B threat model, contract and quality gate.

## Alternatives

- Managed external IdP now: strong operational option, but provider/region/residency and build-vs-buy remain unresolved; adopting one here would be arbitrary.
- Keep identity inside the API module: fewer packages, but violates reuse and framework-independent domain boundaries.
- Keep email columns only on User: simple today, but cannot safely represent primary, secondary and pending replacement addresses.
- Replace all UUIDs with UUIDv7: improves index locality but causes unnecessary migration and time disclosure.

## Consequences

The model grows additively and keeps legacy email columns as a documented compatibility projection until a later expand/migrate/contract cycle. Feature capabilities default off and cannot grant authorization. Authentication remains unavailable at runtime until 4.1B deliberately integrates an adapter.
