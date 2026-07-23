# ADR-0024: Explicit tenant context and resolution

- Status: Accepted
- Date: 2026-07-12

Pass immutable TenantContext explicitly through application and persistence calls. Resolve an untrusted route tenant only against a VerifiedPrincipal and ACTIVE Membership. Set PostgreSQL context transaction-locally with `set_config(..., true)`.

AsyncLocalStorage/globals hide a security dependency; a tenant header enables IDOR; session-level SET can leak through pools. They are rejected. Signatures become more verbose and jobs must carry an explicit envelope. Without a future authentication adapter, HTTP domain access fails closed.
