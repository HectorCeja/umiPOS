# Cash Quarantine

## Prompt 11.5 certification status

The sanitized tenant-scoped query passed `3/3`, including cross-tenant and missing-permission denial. Manual replay remains intentionally unavailable. Quarantine itself is operational, while the broader worker recovery certification remains incomplete.

The administrative query is tenant-scoped, Branch-filtered and permission protected. It returns only event identity/type/version, allowed aggregate identity, correlation, attempts/timestamps, sanitized error code/message, status, replay eligibility and source module. Payloads, stack traces, secrets and unnecessary PII are excluded.

Prompt 11.4 API evidence is `3/3`: authorized sanitized projection, cross-tenant denial and denial without `integrations.quarantine.read`. Manual replay/resolve remain future-restricted.
