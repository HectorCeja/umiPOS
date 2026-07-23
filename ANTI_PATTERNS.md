# NEXO Anti-Patterns

## Dashboard as accidental POS

Do not optimize Sales Administration for continuous cashier checkout, bypass Cash sessions, calculate totals in React or infer authorization from hidden buttons. Manual administrative sale remains disabled by default.

## Authorization prohibitions (Prompt 5)

- `if (role === "admin")`, decorators that infer access from role names, or permission checks embedded in business modules.
- JWT/session claims, tenant headers, route IDs or UI visibility treated as authority.
- Duplicating permission/role/feature definitions outside `@nexo/authorization`.
- Calling the diagnostic evaluation endpoint as enforcement or trusting client-supplied owner/state attributes.
- Granting `CUSTOM`/`GLOBAL` semantics before an accepted ADR and negative tests.
- Feature flags used as permission grants, or authorization performed without RLS tenant context.

**Status:** mandatory. These patterns are rejected unless an accepted ADR explicitly replaces the rule.

## Tenant and authorization

- Trusting `X-Tenant-ID`, route parameters, request bodies or unverified token claims as tenant authority.
- Reading tenant context from globals, process variables, singleton mutable state or AsyncLocalStorage. Context is an explicit immutable argument.
- Querying a tenant-owned table outside a transaction that first sets a transaction-local PostgreSQL tenant context.
- Using the migration/owner connection for application requests, tests intended to prove RLS, support access or workers.
- Giving runtime roles `SUPERUSER`, `BYPASSRLS`, object ownership, `CREATEROLE`, `CREATEDB` or broad schema creation privileges.
- Disabling RLS, omitting `FORCE ROW LEVEL SECURITY`, or creating a tenant table without a policy and negative A/B tests.
- Treating a hidden UI element, UUID opacity, role name or `tenant_id` filter alone as authorization.
- Returning a different response that reveals whether a cross-tenant object exists.
- Encoding every authorization decision in RBAC. Resource, tenant, branch, membership state and other attributes remain part of policy evaluation.

## Domain and persistence

- Importing NestJS, Prisma, HTTP, Redis or vendor SDKs into domain code.
- Sharing mutable Prisma models/entities across modules or reading another module's private tables.
- Generic `utils`/`common` packages, repositories without a bounded responsibility, or abstractions created before a second real use.
- JSON blobs as an escape hatch for core invariants. Versioned JSON is allowed only for deliberately flexible settings with validation and ownership.
- Putting organization, branch, role or POS/customer data on the global User record instead of Membership/business modules.
- Treating email verification as real-world identity proof, mutating a verified address in place, or allowing multiple primary emails.
- Using feature flags as authorization, entitlement or evidence that an authenticator is implemented.
- Registering login, session, refresh, recovery or MFA routes before their phase-specific threat model and contract gate.
- Re-registering or copying the quarantined Identity authentication module instead of using the reviewed Authentication context.
- Hard-coding Mexico, MXN, `es-MX`, tax rates or a time zone into domain rules.
- Destructive history edits, floating-point money, local timestamps as canonical instants or cascading tenant deletes without a retention decision.
- Hardcoded business-template branches/switch statements or implicit creation of Catalog rows from category suggestions.
- Resetting onboarding by deleting tenant state or reverting administrator configuration.
- Creating Membership before invitation tenant/email/token/role/scope validation completes atomically.
- Returning invitation digests, normalized emails or raw tokens through API/logs/events.
- Authorizing a Control Plane write only before opening its persistence transaction.

## API and delivery

- Implementing an endpoint before its versioned OpenAPI contract and compatibility gate.
- Maintaining decorators/DTOs and OpenAPI as independent sources of truth.
- Adding an endpoint not present in the canonical contract, including “temporary” debug/admin routes.
- Rebuilding an artifact between environments, mutable image tags for releases, unpinned dependencies or secrets in CI logs.
- Mocking PostgreSQL to claim RLS, role, policy, constraint or migration coverage.
- Marking Docker/CI/external integrations green when only YAML or unit tests ran.

## Security and observability

- Logging request bodies, tokens, credentials, raw tenant/user identifiers as metric labels or unrestricted PII.
- Catching an exception and returning success, retrying non-idempotent work blindly or allowing an ambiguous write outcome.
- Production defaults for secrets, permissive CORS, public tenant caches or Swagger exposure without an environment policy.
- JWT/client claims as tenant authority; raw session/action tokens in storage/logs; refresh overwrite without generation history.
- Comparing only CSRF cookie/header without binding the digest to Session, or exempting cookie mutations from CSRF.
- Treating device fingerprint/remember-device as an authenticator or MFA bypass.
- Returning account-existence differences from login, reset or verification; running authentication open when Redis abuse control fails.
- Allowing runtime to update/delete security events or exposing administrative revocation without a verified platform authority and reason.

## Sales Platform

- Calculating authoritative totals, tax, discounts, change or completion state in a client.
- Querying Product/Inventory tables or mutating the Inventory ledger/reservations from Sales.
- Using floating point for money, mutable live catalog references as sale history, or deleting completed sales.
- Processing a critical command without scoped idempotency, request fingerprint, transactional authorization and version check.
- Treating role names as discount/refund authority or allowing a feature flag to grant permission.
- Storing PAN/CVV, embedding a payment provider SDK in the domain, or publishing internal aggregates to UMI.

## Product Experience and Design System

- Reimplementing primitives in applications instead of `@nexo/ui`, or putting business calculations in components.
- Raw colors/spacing, `transition: all`, color-only status or motion-only meaning when semantic tokens exist.
- Device detection by user-agent, portrait locks, desktop tables squeezed into mobile or hover-only controls.
- Icon-only critical actions, destructive shortcuts without confirmation, invisible offline/retry/idempotency states.
- Treating hidden controls as authorization or explaining denials with cross-tenant/resource details.
- Updating screenshots wholesale to make CI green, or claiming accessibility from axe alone without keyboard/manual coverage.
- Selecting iframe/microfrontend/shared UMI shell or forcing Flutter to mimic HTML without definitive contracts/evidence.

## Cash Management

- Storing a mutable drawer balance as truth, updating/deleting ledger entries, or “fixing” variance by overwriting history.
- Letting Sales/UI write cash tables, recalculate Sales allocations, or open an implicit session for an orphan event.
- Taking Membership, approval, amount direction, expected balance or variance from client claims/booleans/calculation.
- Using negative amounts, floats, magic movement strings or non-idempotent Sales/refund posting.
- Silent cashier handoff, routine force-close, reopen that erases reconciliation, or self-approval contrary to policy.
- Publishing the ledger/PII to UMI or enabling offline cash mutation without a synchronization and threat-model ADR.
