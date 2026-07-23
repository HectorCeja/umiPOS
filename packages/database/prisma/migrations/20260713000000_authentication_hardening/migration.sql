-- Prompt 4.1B: native authentication hardening. Existing interrupted sessions
-- are revoked because they have no refresh-generation evidence.

CREATE TYPE "SessionTrustLevel" AS ENUM ('UNTRUSTED', 'RECOGNIZED');
CREATE TYPE "RefreshTokenStatus" AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED', 'REUSED');

ALTER TABLE "sessions"
  ADD COLUMN "fingerprint_hash" CHAR(64),
  ADD COLUMN "location" VARCHAR(160),
  ADD COLUMN "trust_level" "SessionTrustLevel" NOT NULL DEFAULT 'UNTRUSTED';

UPDATE "sessions"
SET
  "fingerprint_hash" = repeat('0', 64),
  "status" = CASE WHEN "status" = 'ACTIVE' THEN 'REVOKED'::"SessionStatus" ELSE "status" END,
  "revoked_at" = CASE
    WHEN "status" = 'ACTIVE' OR "revoked_at" IS NULL THEN CURRENT_TIMESTAMP
    ELSE "revoked_at"
  END,
  "revoked_reason" = CASE WHEN "status" = 'ACTIVE' THEN 'security_upgrade' ELSE "revoked_reason" END;

ALTER TABLE "sessions"
  ALTER COLUMN "fingerprint_hash" SET NOT NULL,
  ADD CONSTRAINT "sessions_revocation_consistency" CHECK (
    ("status" = 'ACTIVE' AND "revoked_at" IS NULL) OR
    ("status" <> 'ACTIVE' AND "revoked_at" IS NOT NULL)
  );

CREATE TABLE "refresh_tokens" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "session_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "token_hash" CHAR(64) NOT NULL,
  "status" "RefreshTokenStatus" NOT NULL DEFAULT 'ACTIVE',
  "generation" INTEGER NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "rotated_at" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  "reuse_detected_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "refresh_tokens_hash_key" UNIQUE ("token_hash"),
  CONSTRAINT "refresh_tokens_session_generation_key" UNIQUE ("session_id", "generation"),
  CONSTRAINT "refresh_tokens_session_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE,
  CONSTRAINT "refresh_tokens_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "refresh_tokens_generation_nonnegative" CHECK ("generation" >= 0),
  CONSTRAINT "refresh_tokens_state_consistency" CHECK (
    ("status" = 'ACTIVE' AND "rotated_at" IS NULL AND "revoked_at" IS NULL AND "reuse_detected_at" IS NULL) OR
    ("status" = 'ROTATED' AND "rotated_at" IS NOT NULL AND "reuse_detected_at" IS NULL) OR
    ("status" = 'REVOKED' AND "revoked_at" IS NOT NULL) OR
    ("status" = 'REUSED' AND "reuse_detected_at" IS NOT NULL AND "revoked_at" IS NOT NULL)
  )
);
CREATE INDEX "refresh_tokens_user_status_expiry_idx" ON "refresh_tokens"("user_id", "status", "expires_at");
CREATE INDEX "refresh_tokens_session_status_idx" ON "refresh_tokens"("session_id", "status");

ALTER TABLE "identity_tokens"
  ADD COLUMN "revoked_at" TIMESTAMPTZ(6),
  ADD COLUMN "email_id" UUID,
  ADD CONSTRAINT "identity_tokens_email_fk" FOREIGN KEY ("email_id") REFERENCES "user_emails"("id") ON DELETE CASCADE,
  ADD CONSTRAINT "identity_tokens_terminal_state" CHECK (NOT ("used_at" IS NOT NULL AND "revoked_at" IS NOT NULL));

CREATE INDEX "identity_tokens_email_purpose_expiry_idx"
  ON "identity_tokens"("email_id", "purpose", "expires_at");

-- Security evidence is append-only for application roles.
REVOKE UPDATE, DELETE ON "security_events" FROM nexo_runtime;
GRANT INSERT, SELECT ON "security_events" TO nexo_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON "refresh_tokens" TO nexo_runtime;
GRANT SELECT ON "refresh_tokens" TO nexo_readonly;

COMMENT ON TABLE "refresh_tokens" IS 'Consumed refresh generations retained for replay detection; raw secrets never persist.';
COMMENT ON COLUMN "sessions"."fingerprint_hash" IS 'Pseudonymous device evidence only; never an authenticator or authorization source.';
COMMENT ON COLUMN "sessions"."location" IS 'Optional coarse evidence; no GeoIP provider is selected in local foundation.';
