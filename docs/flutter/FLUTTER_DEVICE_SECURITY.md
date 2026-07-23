# Flutter POS device security

The POS terminal identity is separate from the user-session `Device`. Enrollment uses a 32-byte random secret, stores only SHA-256 hashes, expires within 30 minutes, and consumes once. The returned credential is an opaque `credentialId.secret` value stored only through `PlatformSecureStore`.

Every terminal request is scoped by the organization route and then validated against the credential inside a tenant-local database transaction. Organization context is accepted only when the credential hash belongs to that tenant. Revocation disables every active credential and emits the allowlisted `DeviceRevoked` event without the free-form reason.

Production must fail closed when the platform secure vault is unavailable; plaintext fallback is prohibited.
