# Identity Platform Foundation

Identity is a global platform capability, independent of POS and tenant-owned business data. It answers who a platform account is and which authenticators/contact identities are bound to it. It does not assign business authority: `Membership` connects `User.id` to an Organization and Branch scope.

## Aggregate boundary

- `User`: lifecycle root, profile and regional preferences.
- `UserEmail`: one or more mailbox identities, exactly one primary while an account is usable.
- `PasswordCredential`: current password verifier metadata; no plaintext and no login behavior.
- `PasswordCredentialHistory`: retired verifier material for an explicitly configured future reuse policy.
- identity capabilities: centrally configured readiness for OAuth, SSO, passkeys/WebAuthn, magic links and passwordless.

Prompt 4.1B implementa sessions, devices, login, refresh y recovery en el contexto separado `modules/authentication`. MFA ceremonies siguen fuera. Los sources interrumpidos dentro de `modules/identity` permanecen sin registrar; el dominio puro continúa sin depender de la implementación de autenticación.

## Invariants

1. User identity is global and contains no organization, role, branch or customer/POS data.
2. `DELETED` is terminal and requires `deletedAt`; deletion is logical.
3. A normalized email address identifies at most one User.
4. A User has at most one primary email; pending and secondary addresses are separate records.
5. Verification proves control of a mailbox, not civil or real-world identity.
6. Feature flags cannot grant permission or bypass lifecycle rules.
7. Credential hashes, salts and history are restricted security data and never appear in API, logs or analytics.

The reusable domain implementation is `packages/identity`; Prisma is only its current persistence adapter.
