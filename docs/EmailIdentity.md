# Email Identity

Email is a contact identifier and proof-of-control channel, not proof of a legal identity. `UserEmail` supports multiple addresses without overloading User.

## Model and states

- `PENDING`: address recorded but mailbox control not proven.
- `VERIFIED`: proof completed; `verifiedAt` is required.
- `REVOKED`: address no longer usable; `revokedAt` is required.

Each row stores presentation address and a normalized lookup address. Normalization is trim + Unicode NFKC + locale-independent lowercase; the original presentation value is retained. A future internationalized-email review is required before accepting non-ASCII local parts.

Only one address may be primary per User. A future change-email flow creates a pending row, verifies it, atomically promotes it and demotes/revokes the old primary; it never mutates a verified address in place. Secondary notification addresses remain possible.

## Future verification requirements

The flow must use a CSPRNG value, store only its digest, bind it to user/address/purpose, expire within 24 hours, consume it once, rate-limit requests and avoid account enumeration. Confirmation proves mailbox access only. NIST requires email confirmation codes to expire within 24 hours and become invalid on use.
