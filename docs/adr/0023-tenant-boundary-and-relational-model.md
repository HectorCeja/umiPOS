# ADR-0023: Tenant boundary and relational model

- Status: Accepted
- Date: 2026-07-12

Organization is the tenant root and its UUID is the tenant identifier. Every dependent table stores `tenant_id`; compound keys and foreign keys prevent cross-tenant references. JSON is limited to extensible, non-relational settings.

Database-per-tenant offers stronger isolation but excessive initial operational cost; schema-per-tenant complicates migrations and pooling; shared tables without compound constraints depend only on application code. Shared schema with constraints and RLS is selected.

Organization is a documented exception to the literal `tenant_id` column guardrail because `id` is the boundary. Every new tenant table requires RLS, tenant-first indexes and real isolation tests.
