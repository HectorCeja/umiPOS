# ADR-019 — Prisma 7 with first-class SQL migrations

**Status:** Accepted — 2026-07-11

Prompt 2 mandates Prisma while ADR-003/004 require PostgreSQL constraints and RLS. Prisma supplies generated typed access, migration ordering and developer tooling. Migration SQL remains authoritative and may include hand-reviewed RLS, roles, grants, exclusion/composite constraints and specialized indexes that Prisma schema cannot express. Alternatives—Prisma-only schema (insufficient security), query builder/raw SQL only (conflicts with mandate), dual migration tools (drift risk)—were rejected. Integration tests and drift detection are required when tenant tables arrive.
