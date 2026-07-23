# ADR-021 — Vitest as the common unit/component runner

**Status:** Accepted — 2026-07-11

Use Vitest for TypeScript/ESM unit and component tests, Testing Library for semantic UI tests and V8 coverage. Jest is not installed because maintaining two equivalent runners adds configuration and cognitive cost. Real PostgreSQL integration, browser E2E, property and contract tools will be added when their first real target exists; Vitest does not replace those layers.
