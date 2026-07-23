# ADR-0029: Embedded database-backed authorization engine

- Status: Accepted
- Date: 2026-07-13

## Context

NEXO needs one authorization boundary that combines authenticated User,
Membership, Organization, Branch, tenant context, RBAC grants, ABAC attributes,
scopes and product feature availability. PostgreSQL is already the source of
truth and enforces tenant isolation with forced RLS. Introducing another policy
service now would create a consistency and availability boundary before NEXO has
resource-sharing or global relationship-graph requirements.

OWASP requires deny-by-default, least privilege, server-side object checks on
every request and tests of the complete policy. Zanzibar and OpenFGA demonstrate
a durable object-relation model at very high scale. Cedar provides typed,
schema-validatable policies and explicit determining policies. Oso and Casbin
provide flexible embedded/cloud policy runtimes. GitHub, Stripe and Shopify show
the practical value of granular permissions, independently scoped roles and
separation of sensitive/destructive actions.

## Decision

Implement a first-party, framework-independent `@nexo/authorization` package.
It owns the versioned permission/feature/role deployment registry and a pure
`AuthorizationEngine.can(actor, action, resource, context)` decision function.
It does not import NestJS, Prisma, HTTP, Redis or a business module.

At runtime PostgreSQL is authoritative for active Membership, assigned roles,
role-permission grants and organization feature state. The registry is
materialized idempotently by the administrative seed; an absent or unknown
definition denies access. The API resolves one immutable AuthorizationContext
inside a transaction-local tenant context. JWT or client claims never supply
roles, permissions, tenant, branch, ownership or resource state.

RBAC supplies candidate grants. ABAC then intersects tenant, selected/allowed
branch, User/Membership/Organization state, feature availability, resource
ownership/status and assignment validity. Every allowed decision identifies the
role and effective scope that granted it. `CUSTOM` scope is reserved but denies
until a versioned evaluator exists.

## Alternatives

- OpenFGA/Zanzibar-style service: excellent for ReBAC, sharing graphs and very
  large distributed deployments; rejected now because NEXO has a hierarchy of
  Organization → Branch, requires transactional Membership truth and has no
  cross-resource relationship graph.
- Cedar: strongest future candidate for schema-validated declarative policies;
  rejected now because adopting its runtime/service adds a second policy
  language and integration boundary before policies justify it.
- Oso: productive RBAC/ABAC and data filtering, but its library/cloud choices add
  DSL or vendor coupling without removing NEXO's tenant/RLS resolver.
- Casbin: broad model and language support, but its generic matcher/policy model,
  optional superuser behavior and adapter consistency add more surface than the
  current typed model needs.
- hard-coded role checks: rejected because they scatter policy, prevent role
  evolution and cannot explain the exact grant/scope.

## Consequences and review triggers

NEXO owns policy correctness, schema evolution and decision observability. The
engine remains replaceable through its typed request/decision boundary. Revisit
Cedar or OpenFGA when custom tenant roles are released, resource sharing or deep
hierarchies appear, authorization becomes cross-service, policy change volume
requires delegated administration, or measured decision load/latency exceeds
the modular-monolith design.

Rollback unregisters the API module and preserves additive tables. Registry
versions and migrations are forward-only; permissions are never silently
renamed or reused with different semantics.
