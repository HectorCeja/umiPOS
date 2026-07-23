# ADR-0041 — Public cash events and client neutrality

**Status:** accepted · **Date:** 2026-07-14

## Decision

Internal events and public `nexo.cash.*` events are separate versioned contracts. Public payloads use an allowlist and never expose the ledger. `UmiCashIntegrationPort` is disabled/local-sink only until UMI publishes definitive contracts. OpenAPI commands/queries use integer minor-unit strings, idempotency keys and optimistic versions so web, Flutter and UMI can consume the same authority.

## Consequences

At-least-once delivery requires idempotent consumers. Hardware, banks, printers, Flutter and productive UMI remain adapters outside the domain. Offline cash mutation remains disallowed until an explicit synchronization/security design exists.
