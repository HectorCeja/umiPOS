# Authorization Context

`AuthorizationContext` is an explicit immutable request snapshot containing TenantContext, active Membership, Organization status, optional selected Branch, effective roles, effective grants/scopes and enabled product features. It is resolved from the authenticated `userId` plus route Organization/Branch through PostgreSQL, never global state, AsyncLocalStorage, a client tenant header or token claims.

Resolution occurs in a transaction with transaction-local RLS tenant context. The repository verifies active User, Organization and Membership; validates branch access; loads role assignments, database grants and feature rows; then freezes the snapshot. Absence or mismatch returns `403` without revealing whether the foreign tenant exists.

The lifecycle is: authenticate global User → resolve tenant Membership → establish RLS context → build authorization snapshot → evaluate platform/use-case permission → load and act on authorized resource within the tenant transaction. Workers must construct the same explicit context and use the same engine.
