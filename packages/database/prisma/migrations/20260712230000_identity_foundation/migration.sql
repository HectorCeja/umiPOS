-- Prompt 4.1A: additive identity-domain foundation. Authentication/session
-- behavior is intentionally not introduced or altered by this migration.

ALTER TYPE "IdentityStatus" ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION' BEFORE 'ACTIVE';
ALTER TYPE "IdentityStatus" ADD VALUE IF NOT EXISTS 'LOCKED' AFTER 'ACTIVE';
ALTER TYPE "IdentityStatus" ADD VALUE IF NOT EXISTS 'DELETED' AFTER 'DISABLED';
ALTER TYPE "IdentityStatus" ADD VALUE IF NOT EXISTS 'EXPIRED' AFTER 'DELETED';
CREATE TYPE "EmailIdentityStatus" AS ENUM ('PENDING', 'VERIFIED', 'REVOKED');

ALTER TABLE "users"
  ADD COLUMN "given_name" VARCHAR(100),
  ADD COLUMN "family_name" VARCHAR(100),
  ADD COLUMN "avatar_url" VARCHAR(2048),
  ADD COLUMN "regional_format" VARCHAR(35),
  ADD COLUMN "status_reason" VARCHAR(500),
  ADD COLUMN "status_changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "last_accessed_at" TIMESTAMPTZ(6),
  ADD COLUMN "deleted_at" TIMESTAMPTZ(6),
  ADD COLUMN "preferences" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "feature_overrides" JSONB NOT NULL DEFAULT '{}';

UPDATE "users"
SET
  "given_name" = COALESCE(NULLIF(split_part("display_name", ' ', 1), ''), "display_name"),
  "family_name" = COALESCE(NULLIF(substr("display_name", length(split_part("display_name", ' ', 1)) + 2), ''), '-'),
  "regional_format" = "locale";

ALTER TABLE "users"
  ALTER COLUMN "given_name" SET NOT NULL,
  ALTER COLUMN "family_name" SET NOT NULL,
  ALTER COLUMN "regional_format" SET NOT NULL,
  ALTER COLUMN "locale" DROP DEFAULT,
  ALTER COLUMN "time_zone" DROP DEFAULT,
  ALTER COLUMN "status" SET DEFAULT 'PENDING_VERIFICATION';

ALTER TABLE "users"
  ADD CONSTRAINT "users_preferences_object" CHECK (jsonb_typeof("preferences") = 'object'),
  ADD CONSTRAINT "users_metadata_object" CHECK (jsonb_typeof("metadata") = 'object'),
  ADD CONSTRAINT "users_feature_overrides_object" CHECK (jsonb_typeof("feature_overrides") = 'object'),
  ADD CONSTRAINT "users_deleted_state_consistency" CHECK (
    ("status" = 'DELETED' AND "deleted_at" IS NOT NULL) OR
    ("status" <> 'DELETED' AND "deleted_at" IS NULL)
  ),
  ADD CONSTRAINT "users_locked_state_has_expiry" CHECK (
    "status" <> 'LOCKED' OR "locked_until" IS NOT NULL
  );

CREATE TABLE "user_emails" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "address" VARCHAR(320) NOT NULL,
  "normalized_address" VARCHAR(320) NOT NULL,
  "status" "EmailIdentityStatus" NOT NULL DEFAULT 'PENDING',
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "verified_at" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_emails_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_emails_normalized_address_key" UNIQUE ("normalized_address"),
  CONSTRAINT "user_emails_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "user_emails_verification_consistency" CHECK (
    ("status" = 'VERIFIED' AND "verified_at" IS NOT NULL AND "revoked_at" IS NULL) OR
    ("status" = 'PENDING' AND "verified_at" IS NULL AND "revoked_at" IS NULL) OR
    ("status" = 'REVOKED' AND "revoked_at" IS NOT NULL)
  )
);
CREATE UNIQUE INDEX "user_emails_one_primary_per_user" ON "user_emails"("user_id") WHERE "is_primary";
CREATE INDEX "user_emails_user_status_idx" ON "user_emails"("user_id", "status");

INSERT INTO "user_emails" (
  "user_id", "address", "normalized_address", "status", "is_primary", "verified_at"
)
SELECT
  "id", "email", "normalized_email",
  CASE WHEN "email_verified_at" IS NULL THEN 'PENDING'::"EmailIdentityStatus" ELSE 'VERIFIED'::"EmailIdentityStatus" END,
  true, "email_verified_at"
FROM "users";

ALTER TABLE "password_credentials"
  ADD COLUMN "algorithm_version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "must_change" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "expires_at" TIMESTAMPTZ(6),
  ADD CONSTRAINT "password_credentials_algorithm_version_positive" CHECK ("algorithm_version" > 0);

CREATE TABLE "password_credential_history" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "hash" VARCHAR(256) NOT NULL,
  "salt" VARCHAR(64) NOT NULL,
  "algorithm" VARCHAR(32) NOT NULL,
  "algorithm_version" INTEGER NOT NULL,
  "memory_kib" INTEGER NOT NULL,
  "passes" INTEGER NOT NULL,
  "parallelism" INTEGER NOT NULL,
  "changed_at" TIMESTAMPTZ(6) NOT NULL,
  "retired_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reason" VARCHAR(50) NOT NULL,
  CONSTRAINT "password_credential_history_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "password_credential_history_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "password_credential_history_work_factor" CHECK (
    "algorithm_version" > 0 AND "memory_kib" >= 19456 AND "passes" >= 2 AND "parallelism" >= 1
  )
);
CREATE INDEX "password_credential_history_user_retired_idx"
  ON "password_credential_history"("user_id", "retired_at");

GRANT SELECT, INSERT, UPDATE, DELETE ON "user_emails", "password_credential_history" TO nexo_runtime;
GRANT SELECT ON "user_emails" TO nexo_readonly;

COMMENT ON TABLE "user_emails" IS 'Global email identities; verification proves mailbox control, not real-world identity.';
COMMENT ON TABLE "password_credential_history" IS 'Retired password verifier material used only for configured reuse prevention.';
COMMENT ON COLUMN "users"."email" IS 'Legacy compatibility projection; user_emails is the canonical email identity model.';
COMMENT ON COLUMN "users"."feature_overrides" IS 'Versioned future rollout overrides; never an authorization source.';
