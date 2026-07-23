-- Tokens created before email/purpose hardening cannot prove which mailbox was
-- authorized. Revoke them forward-only; never infer or backfill security evidence.

UPDATE "identity_tokens"
SET "revoked_at" = CURRENT_TIMESTAMP
WHERE "email_id" IS NULL
  AND "used_at" IS NULL
  AND "revoked_at" IS NULL;

ALTER TABLE "identity_tokens"
  ADD CONSTRAINT "identity_tokens_email_binding" CHECK (
    "purpose" = 'EMAIL_CHANGE' OR "email_id" IS NOT NULL
  ) NOT VALID;

ALTER TABLE "identity_tokens" VALIDATE CONSTRAINT "identity_tokens_email_binding";
