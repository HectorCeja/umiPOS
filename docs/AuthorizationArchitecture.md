# Authorization Architecture

**Status:** implemented — registry v2 / API contract 4.0.0  
**Boundary:** authorization only; no POS, catalog, inventory, cash or customer implementation

NEXO uses an embedded, first-party policy decision point in `@nexo/authorization` and a database-backed policy information point in the API. Authentication supplies only `userId`; every protected request resolves the active Membership, Organization, optional Branch, role assignments, grants and enabled product features from PostgreSQL inside a tenant-scoped transaction. JWT/session claims are never authorization authority.

```text
User
  ↓
Membership
  ↓
Organization
  ↓
Branch
  ↓
Authorization Context
  ↓
Permission Engine
  ↓
Policy
  ↓
Resource
```

The engine combines RBAC grants with ABAC constraints and returns an explainable allow/deny result. Default deny applies to unknown permissions, missing/inactive actors, cross-tenant resources, disabled features, invalid resource state, expired grants and scope mismatch. Future modules MUST call the engine before use-case execution and MUST load resource attributes from authoritative storage in the same transaction; the diagnostic evaluation endpoint never executes a business action.

## Alternatives evaluated

| Alternative            | Strength                                                      | Cost/risk now                                      | Result         |
| ---------------------- | ------------------------------------------------------------- | -------------------------------------------------- | -------------- |
| Embedded typed engine  | transactional consistency, low operational cost, domain types | NEXO owns policy evolution                         | selected       |
| OpenFGA/Zanzibar model | relationship scale and centralized tuples                     | new service, consistency and operations            | review trigger |
| Cedar                  | analyzable policy language and explicit entities              | adapter/policy lifecycle overhead                  | review trigger |
| Oso/Casbin             | mature policy/RBAC libraries                                  | extra DSL/dependency and divergent source of truth | deferred       |

ADR-0029 records the full decision. Re-evaluate when relationship graphs, customer-authored roles/policies, independent policy ownership or measured policy volume exceed the modular-monolith boundary.

## Official principles used

- OWASP: deny by default, validate on every request, prefer attributes for object decisions and test authorization logic.
- Zanzibar: separate relationship data from policy evaluation and return a deterministic decision.
- GitHub, Stripe and Shopify: stable named roles are useful defaults, while resource/scope restrictions remain explicit.

Sources: [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [OWASP ASVS 5](https://github.com/OWASP/ASVS/tree/v5.0.0), [Google Zanzibar](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/), [Cedar](https://docs.cedarpolicy.com/), [OpenFGA](https://openfga.dev/docs), [Oso](https://www.osohq.com/docs), [Casbin](https://casbin.org/docs/overview/).
