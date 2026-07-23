# Product Feature Flags

Authorization product features are `POS`, `INVENTORY`, `APPOINTMENTS`, `KITCHEN`, `LOYALTY`, `REPORTS`, `MARKETPLACE` and `ECOMMERCE`. They are availability prerequisites, never permission grants. Evaluation is `feature enabled AND permission granted AND ABAC satisfied`.

Definitions are global and versioned; `organization_features` is tenant-owned, forced-RLS and default-deny. Seed enables only explicit official-persona fixtures. Missing rows and disabled flags evaluate false. Identity feature capabilities remain a separate configuration boundary and cannot authorize product access.

Prompt 6 expone administración autorizada y optimistic-locked, e inicializa flags desde plantillas versionadas. Every production flag requires owner, rollout/rollback plan and expiry/review date. Branch overrides are not implemented; introducing them requires precedence rules and an ADR.
