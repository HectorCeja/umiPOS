# Password domain

4.1A models password verifier data. Prompt 4.1B consumes it through the separate Authentication context to verify, change and reset passwords without coupling the pure domain to HTTP or persistence.

## Selected baseline

- Argon2id, algorithm version stored with each credential.
- minimum 15 Unicode characters for single-factor use; maximum 128 and support for paste/password managers.
- no composition rules and no periodic expiration by default.
- compromised/common-password blocklist will be an application port in 4.1B, not a small hardcoded production list.
- OWASP minimum work factor: 19 MiB memory, 2 passes, parallelism 1; deployment calibration may increase it.
- unique random salt per credential; optional pepper only from KMS/secret manager, never the database.

`PasswordCredential` stores hash, salt, algorithm/version, work factors, change instant, optional expiry and `mustChange`. `credentialNeedsRehash` identifies upgrades. On a future change/reset, the old record can be copied to `PasswordCredentialHistory` in the same transaction. History depth is configured as zero by default because NIST rejects arbitrary periodic changes; enabling reuse prevention needs a documented abuse case and retention limit.

Plaintext passwords, reversible encryption, fast hashes and home-grown cryptography are prohibited. Hash and history never cross the persistence/application port except through dedicated credential operations.
