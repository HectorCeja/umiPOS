# Invitations

Flow: authorized inviter → email through SMTP/Mailpit → authenticated recipient → token/email validation → Membership + role + Branch scopes in one transaction.

Invitation tokens contain 256 random bits. Only HMAC-SHA-256 digests persist; API/log/event responses never expose digest or normalized email. A token is bound to tenant, normalized primary session email, role and Branch scope, expires after 72 hours, can be revoked, and resend rotates the token and expiry. Acceptance is single-use and rechecks active User/email and RLS tenant candidate.

The email link uses configured `APP_BASE_URL`, not `Host`. Production requires HTTPS, a `Referrer-Policy: no-referrer` acceptance page, delivery monitoring and provider configuration. Mail failure does not create Membership; resend is the recovery path. Events record create/resend/revoke/accept without email or secret.
