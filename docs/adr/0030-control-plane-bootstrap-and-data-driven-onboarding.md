# ADR-0030 — Control-plane bootstrap and data-driven onboarding

**Status:** accepted  
**Date:** 2026-07-13

## Context

Creating the first Organization is the only tenant operation executed before the User has a Membership. Templates must evolve without deploying application code, onboarding must be restartable, and every later administration write must retain the Prompt 5 authorization and RLS guarantees.

## Decision

1. A verified active global User may invoke one bootstrap Application Service. It generates the tenant UUID, establishes transaction-local RLS context and atomically creates Organization, primary Branch, OWNER Membership/assignment, onboarding draft and audit evidence.
2. Bootstrap authority ends after that transaction. Every tenant administration mutation requires the central Authorization Engine before entry and is revalidated from database authority inside the write transaction.
3. Business templates are versioned global data. Runtime receives read-only access; administrative seed/data migration owns initial definitions. Completion records the applied version and atomically applies settings/features.
4. Restart creates a fresh draft and never rolls back already applied production configuration. A later completion explicitly applies the selected version.
5. Invitation secrets are 256-bit opaque values; only HMAC digests persist. They are bound to Organization, normalized email, role and Branch scope, expire after 72 hours and are single-use/revocable/rotatable.
6. Control-plane evidence is tenant-owned and append-only to runtime.

## Alternatives

- A platform-wide service role for all bootstrap work was rejected: excessive standing authority and RLS bypass risk.
- Hardcoded TypeScript templates were rejected: every new business type would require deployment and violate the extensibility requirement.
- Rolling back configuration on onboarding restart was rejected: it could destroy intentional administrator changes.
- Storing raw invitation tokens or tenant authority in the token was rejected: database disclosure/replay risk and duplicate authority.

## Consequences

The exceptional pre-membership path remains small and testable. Template schema/version governance becomes mandatory. Email delivery failure leaves an auditable pending invitation that can be resent; it never creates Membership early. Future template administration needs its own platform-admin threat model and is not exposed by Prompt 6.
