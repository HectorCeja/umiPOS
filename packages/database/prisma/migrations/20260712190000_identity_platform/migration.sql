CREATE TYPE "IdentityStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');
CREATE TYPE "MfaStatus" AS ENUM ('NOT_ENROLLED', 'ENROLLED', 'REQUIRED');
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');
CREATE TYPE "IdentityTokenPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(320) NOT NULL,
  "normalized_email" VARCHAR(320) NOT NULL,
  "display_name" VARCHAR(160) NOT NULL,
  "locale" VARCHAR(35) NOT NULL DEFAULT 'es-MX',
  "time_zone" VARCHAR(63) NOT NULL DEFAULT 'America/Mexico_City',
  "status" "IdentityStatus" NOT NULL DEFAULT 'ACTIVE',
  "email_verified_at" TIMESTAMPTZ(6),
  "password_changed_at" TIMESTAMPTZ(6),
  "mfa_status" "MfaStatus" NOT NULL DEFAULT 'NOT_ENROLLED',
  "failed_login_count" INTEGER NOT NULL DEFAULT 0,
  "first_failed_login_at" TIMESTAMPTZ(6),
  "locked_until" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_email_key" UNIQUE ("email"),
  CONSTRAINT "users_normalized_email_key" UNIQUE ("normalized_email"),
  CONSTRAINT "users_failed_login_count_nonnegative" CHECK ("failed_login_count" >= 0)
);
CREATE INDEX "users_status_idx" ON "users"("status");

CREATE TABLE "password_credentials" (
  "user_id" UUID NOT NULL,
  "hash" VARCHAR(256) NOT NULL,
  "salt" VARCHAR(64) NOT NULL,
  "algorithm" VARCHAR(32) NOT NULL DEFAULT 'argon2id-v1',
  "memory_kib" INTEGER NOT NULL DEFAULT 19456,
  "passes" INTEGER NOT NULL DEFAULT 2,
  "parallelism" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_credentials_pkey" PRIMARY KEY ("user_id"),
  CONSTRAINT "password_credentials_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "password_credentials_work_factor" CHECK ("memory_kib" >= 19456 AND "passes" >= 2 AND "parallelism" >= 1)
);

CREATE TABLE "devices" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "fingerprint" VARCHAR(128) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "first_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "trusted_until" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  CONSTRAINT "devices_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "devices_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "devices_user_fingerprint_key" UNIQUE ("user_id", "fingerprint")
);
CREATE INDEX "devices_user_revoked_idx" ON "devices"("user_id", "revoked_at");

CREATE TABLE "sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "device_id" UUID,
  "access_token_hash" CHAR(64) NOT NULL,
  "refresh_token_hash" CHAR(64) NOT NULL,
  "csrf_token_hash" CHAR(64) NOT NULL,
  "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "ip_address" VARCHAR(64) NOT NULL,
  "user_agent" VARCHAR(512) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "idle_expires_at" TIMESTAMPTZ(6) NOT NULL,
  "absolute_expires_at" TIMESTAMPTZ(6) NOT NULL,
  "revoked_at" TIMESTAMPTZ(6),
  "revoked_reason" VARCHAR(100),
  "rotation_counter" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sessions_access_token_hash_key" UNIQUE ("access_token_hash"),
  CONSTRAINT "sessions_refresh_token_hash_key" UNIQUE ("refresh_token_hash"),
  CONSTRAINT "sessions_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "sessions_device_fk" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL,
  CONSTRAINT "sessions_rotation_nonnegative" CHECK ("rotation_counter" >= 0),
  CONSTRAINT "sessions_expiry_order" CHECK ("idle_expires_at" <= "absolute_expires_at")
);
CREATE INDEX "sessions_user_status_expiry_idx" ON "sessions"("user_id", "status", "absolute_expires_at");
CREATE INDEX "sessions_device_status_idx" ON "sessions"("device_id", "status");

CREATE TABLE "identity_tokens" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "purpose" "IdentityTokenPurpose" NOT NULL,
  "token_hash" CHAR(64) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "used_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "identity_tokens_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "identity_tokens_hash_key" UNIQUE ("token_hash"),
  CONSTRAINT "identity_tokens_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "identity_tokens_user_purpose_expiry_idx" ON "identity_tokens"("user_id", "purpose", "expires_at");

CREATE TABLE "security_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID,
  "type" VARCHAR(100) NOT NULL,
  "outcome" VARCHAR(32) NOT NULL,
  "ip_address" VARCHAR(64) NOT NULL,
  "user_agent" VARCHAR(512) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "security_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "security_events_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL,
  CONSTRAINT "security_events_metadata_object" CHECK (jsonb_typeof("metadata") = 'object')
);
CREATE INDEX "security_events_user_created_idx" ON "security_events"("user_id", "created_at");
CREATE INDEX "security_events_type_created_idx" ON "security_events"("type", "created_at");

GRANT SELECT, INSERT, UPDATE, DELETE ON
  "users", "password_credentials", "devices", "sessions", "identity_tokens", "security_events"
TO nexo_runtime;
GRANT SELECT ON "users", "devices", "sessions", "security_events" TO nexo_readonly;

COMMENT ON TABLE "users" IS 'Global identity records, independent of tenant membership.';
COMMENT ON TABLE "sessions" IS 'Server-side opaque sessions; only token digests are persisted.';
COMMENT ON TABLE "identity_tokens" IS 'Single-use, purpose-bound email verification and recovery token digests.';
COMMENT ON TABLE "security_events" IS 'Append-oriented security evidence without secrets or raw credentials.';

-- Seed/control-plane migrations remain subject to explicit tenant context.
DROP POLICY "tenant_isolation" ON "organizations";
DROP POLICY "tenant_isolation" ON "branches";
DROP POLICY "tenant_isolation" ON "memberships";
DROP POLICY "tenant_isolation" ON "membership_branch_scopes";
CREATE POLICY "tenant_isolation" ON "organizations" AS RESTRICTIVE FOR ALL TO nexo_migration, nexo_runtime, nexo_readonly
  USING ("id" = app.current_tenant_id()) WITH CHECK ("id" = app.current_tenant_id());
CREATE POLICY "tenant_isolation" ON "branches" AS RESTRICTIVE FOR ALL TO nexo_migration, nexo_runtime, nexo_readonly
  USING ("tenant_id" = app.current_tenant_id()) WITH CHECK ("tenant_id" = app.current_tenant_id());
CREATE POLICY "tenant_isolation" ON "memberships" AS RESTRICTIVE FOR ALL TO nexo_migration, nexo_runtime, nexo_readonly
  USING ("tenant_id" = app.current_tenant_id()) WITH CHECK ("tenant_id" = app.current_tenant_id());
CREATE POLICY "tenant_isolation" ON "membership_branch_scopes" AS RESTRICTIVE FOR ALL TO nexo_migration, nexo_runtime, nexo_readonly
  USING ("tenant_id" = app.current_tenant_id()) WITH CHECK ("tenant_id" = app.current_tenant_id());
CREATE POLICY "migration_access" ON "organizations" FOR ALL TO nexo_migration USING (true) WITH CHECK (true);
CREATE POLICY "migration_access" ON "branches" FOR ALL TO nexo_migration USING (true) WITH CHECK (true);
CREATE POLICY "migration_access" ON "memberships" FOR ALL TO nexo_migration USING (true) WITH CHECK (true);
CREATE POLICY "migration_access" ON "membership_branch_scopes" FOR ALL TO nexo_migration USING (true) WITH CHECK (true);
