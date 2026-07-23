# User model

`User` is the unique global subscriber account. It is not tenant-owned and therefore does not use tenant RLS. Access to it still requires server-side authorization and data minimization.

| Field                                       | Meaning / rule                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `id`                                        | immutable RFC 9562 UUID; current generation remains random UUIDv4      |
| `status`                                    | lifecycle state from `UserLifecycle.md`                                |
| `givenName`, `familyName`                   | profile names, separate from display formatting                        |
| `displayName`                               | user-controlled presentation name; never an identity proof             |
| `avatarUrl`                                 | optional future reference; file handling is not implemented            |
| `locale`, `timeZone`, `regionalFormat`      | required BCP 47/IANA/configured formatting values                      |
| `createdAt`, `updatedAt`, `statusChangedAt` | UTC audit instants                                                     |
| `lastAccessedAt`                            | nullable activity instant; successful authentication updates it        |
| `deletedAt`                                 | required only for terminal soft deletion                               |
| `preferences`                               | versioned, user-facing non-security preferences                        |
| `metadata`                                  | restricted platform metadata; schema/owner required before adding keys |
| `featureOverrides`                          | future rollout overrides; never authorization or entitlement           |

Email is intentionally not part of the canonical User aggregate value: `UserEmail` owns email lifecycle. Legacy `users.email`, `normalized_email` and `email_verified_at` remain temporarily for migration compatibility and must not gain new consumers.

## Data governance

Names, emails, locale, time zone and access timestamps are confidential personal data. Password verifier material is restricted. Metadata must be allowlisted, bounded and assigned purpose/retention before use. Soft deletion blocks normal processing immediately; later retention/offboarding policy decides irreversible erasure or pseudonymization.
