# POS diagnostics

V1 status: **PASS** for the minimum restricted panel: app/build/platform, device/session/context/cash/backend, unresolved payment count, SQLite, printer and sanitized last error, with safe retry/logout actions.

Diagnostics are restricted and sanitized by policy. Approved fields are build/platform, redacted context IDs, connectivity, pending count, quality mode and safe errors. No credential or authorization header may be exported.
