# ADR-0025: PostgreSQL roles and RLS default-deny

- Status: Accepted
- Date: 2026-07-12

Separate migration, runtime, read-only and maintenance roles; none is superuser or BYPASSRLS. Tenant tables use ENABLE and FORCE RLS with restrictive tenant equality and explicit permissive role policies. Runtime never owns tables.

Application filters alone cannot contain a missed predicate and a single owner credential bypasses RLS. Deployments need separate secrets; integration tests connect as runtime. RLS remains defense-in-depth because runtime may set the custom GUC.
