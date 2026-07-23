# Permission Engine

`AuthorizationEngine.can(actor, permission, resource, context)` is the only policy API. It is pure, synchronous, framework-independent and has no database/network dependency. Its inputs are immutable snapshots; its output includes `allowed`, stable `reason`, registry version and, on allow, the assignment, role and effective scope that granted access.

Evaluation order is security-significant: known permission → active User/Membership → active Organization → tenant match → feature availability → resource state → active time window → matching grant → scope/branch/self attributes. The first denial is returned. `CUSTOM` is reserved and default-denied until a future ADR defines its semantics.

Controllers do not inspect roles. The API service resolves state, calls the engine for access to platform resources, and returns a generic `403` externally. Future modules must provide server-loaded `tenantId`, `branchId`, owner and state. Client-provided attributes may be used only by the non-mutating diagnostic endpoint.

Forbidden patterns: `if (role === "admin")`, duplicated permission strings outside the registry/contracts/tests, UI-only checks, trusting a token claim, or querying a resource after the decision in a different authorization snapshot.
