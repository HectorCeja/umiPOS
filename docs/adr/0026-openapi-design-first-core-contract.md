# ADR-0026: OpenAPI design-first core contract

- Status: Accepted
- Date: 2026-07-12

OpenAPI 3.1.1 JSON under `@nexo/contracts` is canonical. Swagger UI serves it directly. Validation and a breaking-change gate run in CI.

Nest code-first decorators violate the established guardrail once domain contracts exist and risk drift. ADR-0020's temporary exception ends. Contract changes precede controllers; breaking changes require explicit versioning and an ADR.
