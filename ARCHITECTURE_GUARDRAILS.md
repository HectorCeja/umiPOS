# NEXO Architecture Guardrails

## Sales Administration

The web dashboard may search, support, refund, cancel eligible open sales and render receipts, but must not expose a general checkout terminal. It presents authoritative Sales/Inventory/Cash projections and cannot mutate either ledger.

**Status:** mandatory  
**Effective:** 2026-07-11  
**Authority:** this file operationalizes `/docs`; accepted ADRs prevail over examples.

**Phase 3 amendment:** ADR-0023 through ADR-0026 are mandatory. `organizations.id` is the tenant root and sole exception to a separate `tenant_id`; dependent tables require tenant-safe compound keys, tenant-first indexes, `ENABLE RLS` and `FORCE RLS`. Database roles and secrets are separated. TenantContext is explicit and immutable; globals, AsyncLocalStorage and client-supplied tenant identity are forbidden. Tenant DB work uses transaction-local context and never replaces membership authorization. `packages/contracts/openapi/openapi.json` is canonical; decorator-generated domain contracts are forbidden.

**Phase 3 validation record:** isolation fixtures MUST use a namespace reserved for ephemeral RLS tests and MUST finish with rollback. Seed/persona identifiers are not reusable as integration-test identifiers. A green RLS gate requires execution against the Compose PostgreSQL with the runtime-equivalent role; schema inspection alone is insufficient.

**Phase 4.1A amendment:** ADR-0027 is mandatory. `@nexo/identity` owns framework-independent User, email and password lifecycle concepts and MUST NOT import an app, NestJS, Prisma, Redis, HTTP or a business module. User is global; business access exists only through Membership. Feature capabilities default off and never authorize. Login/session/MFA sources MUST NOT be registered until a later phase supplies its contract, threat model and tests.

**Phase 4.1B amendment:** ADR-0028 is mandatory. Authentication establishes a global principal only and never tenant/business authority. Session secrets are opaque, independently generated and stored only as keyed digests; refresh tokens retain immutable generations and reuse revokes the family. Cookie mutations require CSRF bound to server-side Session plus exact Origin/CORS controls. Runtime security events are append-only. Recovery tokens are purpose/email-bound, expiring, revocable and single-use. The quarantined `modules/identity` authentication implementation MUST remain unregistered.

**Phase 5 amendment:** ADR-0029 is mandatory. Every protected use case MUST resolve an explicit immutable AuthorizationContext from the authenticated User and current PostgreSQL Membership/role/grant/feature state. Tokens, client headers and UI state are never authority. All authorization uses `@nexo/authorization`; role-name conditionals, duplicate registries and module-local permission logic are forbidden. RBAC grants are always restricted by ABAC, feature state, scope and RLS. Resource attributes used for enforcement MUST be loaded authoritatively in the use-case transaction. `CUSTOM` scope and platform-global assignments remain default-deny until a later ADR.

Every later prompt, PR and generated change MUST read this file and [DECISION_LOG.md](DECISION_LOG.md) before modifying the repository.

## Repository boundaries

1. Deployables live only in `apps/`: `web`, `api`, `worker`. A new deployable requires an ADR with ownership, SLO, threat boundary and operational cost.
2. Reusable capabilities live in `packages/` and MUST have one cohesive responsibility, public exports and no dependency on an app. Generic `utils`, `common`, shared mutable ORM entities and dumping-ground packages are forbidden.
3. Business modules will live under `apps/api/src/modules/<module>/` with `domain → application → infrastructure/interface` dependency direction. Domain code MUST NOT import NestJS, Prisma, Redis, HTTP or vendor SDKs.
4. A module MUST NOT query another module's tables or import its infrastructure. It uses an application port or versioned event. Cycles fail CI.
5. The worker invokes the same application use cases as the API; it MUST NOT bypass authorization, tenant context or invariants.

## Data and tenancy

1. PostgreSQL is the system of record. Redis, object storage, browser storage and projections are never the sole record of financial or security state.
2. Every tenant-owned table MUST contain non-null `tenant_id`; uniqueness, foreign keys and useful indexes include the tenant boundary. Organization is the tenant; Branch is an authorization scope.
3. Tenant context comes from verified identity plus active membership, never from a trusted client header. Repository methods require it explicitly.
4. Application filtering AND PostgreSQL RLS default-deny are mandatory. The runtime role MUST NOT own tables or have `BYPASSRLS`. Tenant tables require negative A/B tenant tests using the production-equivalent role.
5. Prisma provides typed access and migration orchestration; raw SQL in Prisma migrations is mandatory where Prisma cannot express RLS, roles, composite constraints, exclusion constraints, partial/specialized indexes or database comments. Schema drift is forbidden.
6. Migrations are forward-only and expand/migrate/contract. A destructive or locking migration requires measured impact, backup and rollback/compensation plan.
7. Completed commercial records are immutable or corrected by compensating events. Money never uses binary floating point; instants are UTC and business date/time zone are explicit.
8. The verified bootstrap transaction is the only tenant write before Membership exists; it atomically creates Organization, primary Branch, OWNER assignment and onboarding state.
9. Protected Control Plane writes re-resolve database authorization inside the same transaction that mutates state. A controller/service preflight alone is insufficient.
10. Business templates are versioned global data and runtime read-only. Restarting onboarding never deletes or silently rolls back applied tenant configuration.
11. Invitation secrets are opaque, digested at rest, tenant/email/role/scope-bound, expiring and single-use. Digests/raw tokens never cross API, logs or events.
12. Control-plane audit evidence is append-only to runtime.

## API, events and integration

1. REST JSON + versioned OpenAPI is the external synchronous contract. Business endpoints are design-first; foundation-only technical endpoints may use Swagger decorators until the contract compatibility gate is added (ADR-020).
2. Errors follow RFC 9457, external writes support scoped idempotency and mutable collections use cursor pagination.
3. An outbox is written in the same transaction as business state. Delivery is at least once; consumers provide one business effect through deduplication/idempotency.
4. Vendor SDKs remain behind ports. Timeouts, retry eligibility, circuit breaking, credential isolation and observable failure are explicit.
5. No public API/webhook, payment processing or CFDI is introduced without the roadmap gate and a security/legal ADR.

## Security and privacy

1. OWASP ASVS 5.0.0 L2 is the minimum application baseline; selected L3 controls protect platform administration, support, tenant isolation, secrets and recovery.
2. Server-side default-deny authorization applies to every operation and object. Hiding UI is never authorization.
   Permission decisions MUST use the central engine and an explainable stable reason; a role name alone never grants an action.
3. Secrets are validated at startup, stored outside Git and never have production defaults. `.env` is local only; CI/production use short-lived identity or a secret manager.
4. Logs, traces, metrics, URLs and analytics MUST NOT contain credentials, tokens, PAN/CVV or unapproved PII. Logging is structured and correlated; request bodies are not logged by default.
5. New persisted data requires classification, purpose, retention, access and deletion behavior. Real production data is forbidden in tests and staging.
6. Dependencies are exact and lockfile-frozen. New dependencies require documented need, maintenance, license, security and native/platform alternative review.
7. Email verification proves mailbox control only. Password verifier/history material is restricted and may never cross public contracts, logs or analytics.
8. Authentication cookies MUST be host-only, HttpOnly for credentials, Secure outside local and SameSite-restricted. Secrets and CSRF rotate together; Web Storage MUST NOT hold session credentials.
9. Account enumeration resistance, real abuse limiting and durable security events are mandatory. Failure of Redis rate limiting fails closed for authentication.
10. `rememberDevice` is recognition metadata, never MFA bypass. MFA/OAuth/SSO/passkeys remain disabled until complete ceremonies, recovery, contracts and E2E exist.

## Frontend and accessibility

1. The web app uses Next.js App Router. Tenant-specific dynamic responses MUST NOT be publicly cached. Server authorization is repeated for every protected fetch/action.
2. UI primitives belong in `@nexo/ui`; semantic tokens and accessible native HTML precede custom widgets. WCAG 2.2 AA and the `RA` requirements are release gates.
3. Text, number, money, plural, time zone and dates are localizable. Mexico defaults MUST NOT become domain constants.
4. Offline capability is explicit and limited. Pending is not confirmed; no last-write-wins for money, stock, cash or authorization.

## Quality and delivery

1. Node 24 LTS, pnpm 10, ESM and strict TypeScript are the baseline. `any`, ignored promises, console logging and warnings in main are forbidden without a reviewed, expiring exception.
2. Every change passes formatting, lint, typecheck, risk-based tests and build. Financial, authorization and tenancy invariants require automated tests with real PostgreSQL where applicable.
3. Build once and promote the same signed digest. Feature flags separate deploy from release and require owner/expiry. Application rollback remains compatible with schema N/N-1.
4. Health endpoints separate liveness from readiness. Readiness tests required dependencies; liveness MUST NOT restart healthy processes because a dependency is down.
5. OpenTelemetry is the vendor-neutral telemetry boundary. High-cardinality tenant/user IDs are forbidden as metric labels.
6. Documentation and ADRs change in the same PR as behavior. A replaced decision is preserved and linked.

## Change test

Before merging, answer: Which requirement/ADR authorizes this? Which module owns it? What data and tenant boundary changes? How does it fail, retry and roll back? Which tests prove invariants and accessibility? Which telemetry detects failure? If any answer is unknown, the change is not ready.

## Product Platform guardrails

1. Product describes what can be sold; it never owns stock, movements, reservations, sales or appointment availability.
2. Downstream modules reference `ProductVariant.id`; the canonical Default variant removes product/variant branching.
3. Prices are decimal contextual records, never binary floats or a lone `price` column.
4. Domain events and outbox rows commit atomically. Consumers are idempotent and version-aware.
5. Catalog media uses private tenant-prefixed object keys, short presigned uploads, object verification and meaningful alt text.
6. Search implementations depend on `ProductSearchPort`; an external engine cannot leak into domain/application APIs.

# Prompt 8 inventory guardrails

- Product Platform never owns stock, reservations, movements or cost; Inventory references only `ProductVariant.id`.
- Inventory quantity truth is the immutable ledger. Snapshots, availability and balances are rebuildable projections.
- Every inventory write is idempotent, tenant-scoped, authorized inside its transaction and emits its event/outbox atomically.
- Availability dimensions remain explicit; `onHand` must never be treated as `available`.
- Cost layers and valuation remain outside Product and cannot mutate quantities. LIFO is disabled.
- Controllers/UI never use Prisma and future POS/Purchasing call Inventory Application Services rather than tables.

# Prompt 9 sales guardrails

- `@nexo/sales` is headless and framework-free; UI, Flutter, UMI, Prisma and vendor SDKs cannot enter its domain.
- Server checkout/totals/tax/discount/payment state is authoritative. Clients submit intent, never trusted totals.
- Sales reads Product and coordinates Inventory exclusively through public ports; no cross-module table access.
- Money uses explicit decimal/minor-unit representations, deterministic rounding and immutable commercial snapshots.
- Critical writes require tenant and authorization revalidation inside the transaction, scoped idempotency and optimistic locking.
- Completed sales and audit evidence are not deleted or rewritten; correction uses cancellation/refund/compensating records.
- Payment adapters never persist PAN/CVV. UMI receives only versioned, allowlisted integration projections through a replaceable port.

# Prompt 10 experience guardrails

- `@nexo/ui` is the single web component source; applications may compose it but must not fork primitives.
- Components are presentation/interaction only: no totals, inventory, authorization or tenant authority in UI.
- Semantic tokens replace raw visual values; light/dark, density, reduced-motion and forced-colors remain one contract.
- WCAG 2.2 AA, visible focus, keyboard/touch equivalence and targets of at least 44×44 CSS px are release gates.
- Responsive/adaptive decisions use available content constraints and input capability, never user-agent device assumptions.
- Hidden UI never substitutes backend authorization; forbidden states do not reveal cross-tenant information.
- Visual baselines change only through reviewed, explained updates; snapshots never hide regressions.
- Flutter preserves behavior and semantics with native widgets. UMI integration is not selected before its contracts exist.

# Prompt 11 Cash Management guardrails

- `@nexo/cash` is the only authority for physical tender; Sales owns sales/payment allocation and never writes cash tables.
- The ledger is append-only and authoritative. Expected balances/read models are disposable projections; corrections are counter-entries.
- Money is integer minor units. Direction and behavior come only from the versioned Movement Registry.
- Critical writes resolve Membership/Authorization from PostgreSQL, recheck inside the transaction, use RLS, idempotency and version/locks.
- Register, Drawer and CashSession are distinct; active custody/exclusivity is database-enforced.
- Counts are server-recalculated. Reconciliation, forced close and reopen preserve all historical evidence.
- UI, Flutter and UMI consume public contracts and never calculate expected cash or variance.
- Public UMI events use allowlists and never publish a full ledger. Offline mutation/hardware/banking require later ADRs.
