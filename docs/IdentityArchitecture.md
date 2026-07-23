# Identity architecture

## Dependency direction

```text
@nexo/identity (pure domain)
        ↑
application ports / future use cases
        ↑
NestJS HTTP, Prisma/PostgreSQL, mail, external IdP/WebAuthn adapters
```

The domain imports no NEXO business module or framework. `User.id` is the `principalId` consumed by Membership resolution. POS, inventory, clients, agenda, cash and products may depend only on a verified principal/TenantContext, never on credential tables.

## Build versus buy

A canonical NEXO User and email model is required regardless of provider. ADR-0028 selecciona verificador nativo y sesiones opacas tras comparar siete alternativas; OAuth/OIDC futuros serán adaptadores y nunca reemplazarán el User estable. La decisión se reevalúa ante federación empresarial, residencia/regulación, escala o carga de soporte medidas.

## WebAuthn and passkeys readiness

WebAuthn Level 3 defines RP-scoped public-key credentials; discoverable credentials are passkeys. 4.1A reserves independently controlled `webauthn` and `passkeys` capabilities but stores no credentials and runs no ceremonies. The future adapter must bind credentials to User, enforce RP ID/origin, challenge freshness, signature counters where meaningful, attestation policy and recovery. Passkeys are preferred phishing-resistant authenticators, not a boolean MFA shortcut.

## Official sources

- [OWASP ASVS 5.0](https://github.com/OWASP/ASVS/tree/v5.0.0)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST SP 800-63-4](https://pages.nist.gov/800-63-4/)
- [RFC 9562 UUID](https://www.rfc-editor.org/rfc/rfc9562.html)
- [W3C WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/)

These sources justify the domain constraints; they do not imply NIST conformance or identity proofing.
