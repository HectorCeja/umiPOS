# ADR-020 — OpenAPI design-first with a foundation exception

**Status:** Replaced by ADR-0026 — 2026-07-12

Business APIs remain design-first per existing documentation. During foundation, Swagger decorators generate only technical metadata/health documentation to verify Nest wiring. Before the first business endpoint, CI must store/version the OpenAPI artifact and run breaking-change comparison; a contract-first generation/validation workflow will be selected with actual DTO needs. The exception cannot be used to introduce a business contract.
