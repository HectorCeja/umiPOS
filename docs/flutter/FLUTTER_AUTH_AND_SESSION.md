# Authentication and session

V1 status: **PASS**. Real Flutter E2E covers login, secure cookie/CSRF persistence, restore in a new client, refresh, logout and runtime device revocation. Refresh is single-flight; credentials and cookies are redacted.

The API boundary maps the existing cookie/CSRF session contract and safe errors. Session states are typed. Secure persistence requires a platform adapter; only a memory test adapter exists, so production credential persistence remains blocked.
