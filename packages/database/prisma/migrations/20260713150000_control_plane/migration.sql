-- Prompt 6: data-driven control plane, restartable onboarding, invitations and
-- append-only administrative evidence. All organization-owned rows use forced RLS.

CREATE TYPE "OnboardingStatus" AS ENUM ('DRAFT', 'COMPLETED');
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');
CREATE TYPE "BusinessTemplateStatus" AS ENUM ('ACTIVE', 'RETIRED');

ALTER TABLE "organizations"
  ADD COLUMN "legal_tax_id" VARCHAR(32),
  ADD COLUMN "address" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "date_format" VARCHAR(32) NOT NULL DEFAULT 'DD/MM/YYYY',
  ADD COLUMN "time_format" VARCHAR(8) NOT NULL DEFAULT '24h',
  ADD COLUMN "money_format" VARCHAR(32) NOT NULL DEFAULT 'symbol-before',
  ADD COLUMN "regional_settings" JSONB NOT NULL DEFAULT '{}',
  ADD CONSTRAINT "organizations_address_object" CHECK (jsonb_typeof("address") = 'object'),
  ADD CONSTRAINT "organizations_regional_settings_object" CHECK (jsonb_typeof("regional_settings") = 'object'),
  ADD CONSTRAINT "organizations_time_format" CHECK ("time_format" IN ('12h', '24h'));

CREATE TABLE "business_templates" (
  "key" VARCHAR(64) PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "business_type" VARCHAR(64) NOT NULL,
  "description" VARCHAR(500) NOT NULL,
  "status" "BusinessTemplateStatus" NOT NULL DEFAULT 'ACTIVE',
  "version" INTEGER NOT NULL,
  "features" JSONB NOT NULL,
  "initial_settings" JSONB NOT NULL,
  "category_suggestions" JSONB NOT NULL,
  "suggested_permissions" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "business_templates_version_positive" CHECK ("version" > 0),
  CONSTRAINT "business_templates_features_array" CHECK (jsonb_typeof("features") = 'array'),
  CONSTRAINT "business_templates_settings_object" CHECK (jsonb_typeof("initial_settings") = 'object'),
  CONSTRAINT "business_templates_categories_array" CHECK (jsonb_typeof("category_suggestions") = 'array'),
  CONSTRAINT "business_templates_permissions_object" CHECK (jsonb_typeof("suggested_permissions") = 'object')
);
CREATE INDEX "business_templates_business_type_status_idx" ON "business_templates"("business_type", "status");

CREATE TABLE "organization_onboarding" (
  "tenant_id" UUID PRIMARY KEY REFERENCES "organizations"("id") ON DELETE RESTRICT,
  "status" "OnboardingStatus" NOT NULL DEFAULT 'DRAFT',
  "current_step" INTEGER NOT NULL DEFAULT 1,
  "business_type" VARCHAR(64),
  "template_key" VARCHAR(64) REFERENCES "business_templates"("key") ON DELETE RESTRICT,
  "template_version" INTEGER,
  "answers" JSONB NOT NULL DEFAULT '{}',
  "version" INTEGER NOT NULL DEFAULT 1,
  "completed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "organization_onboarding_step" CHECK ("current_step" BETWEEN 1 AND 6),
  CONSTRAINT "organization_onboarding_version" CHECK ("version" > 0),
  CONSTRAINT "organization_onboarding_answers_object" CHECK (jsonb_typeof("answers") = 'object'),
  CONSTRAINT "organization_onboarding_completion" CHECK (("status" = 'COMPLETED') = ("completed_at" IS NOT NULL))
);
CREATE INDEX "organization_onboarding_tenant_status_idx" ON "organization_onboarding"("tenant_id", "status");

CREATE TABLE "organization_invitations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE RESTRICT,
  "email" VARCHAR(320) NOT NULL,
  "normalized_email" VARCHAR(320) NOT NULL,
  "token_hash" CHAR(64) NOT NULL UNIQUE,
  "role_key" VARCHAR(64) NOT NULL REFERENCES "authorization_role_definitions"("key") ON DELETE RESTRICT,
  "access_scope" "MembershipAccessScope" NOT NULL,
  "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "accepted_at" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  "invited_by_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "accepted_by_user_id" UUID REFERENCES "users"("id") ON DELETE RESTRICT,
  "resend_count" INTEGER NOT NULL DEFAULT 0,
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("tenant_id", "id"),
  CONSTRAINT "organization_invitations_version" CHECK ("version" > 0),
  CONSTRAINT "organization_invitations_resends" CHECK ("resend_count" >= 0),
  CONSTRAINT "organization_invitations_lifecycle" CHECK (
    ("status" = 'ACCEPTED' AND "accepted_at" IS NOT NULL AND "accepted_by_user_id" IS NOT NULL AND "revoked_at" IS NULL) OR
    ("status" = 'REVOKED' AND "revoked_at" IS NOT NULL AND "accepted_at" IS NULL) OR
    ("status" IN ('PENDING', 'EXPIRED') AND "accepted_at" IS NULL AND "revoked_at" IS NULL)
  )
);
CREATE INDEX "organization_invitations_tenant_email_status_idx" ON "organization_invitations"("tenant_id", "normalized_email", "status");
CREATE INDEX "organization_invitations_tenant_expiry_idx" ON "organization_invitations"("tenant_id", "expires_at");

CREATE TABLE "organization_invitation_branches" (
  "tenant_id" UUID NOT NULL,
  "invitation_id" UUID NOT NULL,
  "branch_id" UUID NOT NULL,
  PRIMARY KEY ("tenant_id", "invitation_id", "branch_id"),
  FOREIGN KEY ("tenant_id", "invitation_id") REFERENCES "organization_invitations"("tenant_id", "id") ON DELETE CASCADE,
  FOREIGN KEY ("tenant_id", "branch_id") REFERENCES "branches"("tenant_id", "id") ON DELETE RESTRICT
);
CREATE INDEX "organization_invitation_branches_tenant_branch_idx" ON "organization_invitation_branches"("tenant_id", "branch_id");

CREATE TABLE "control_plane_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE RESTRICT,
  "actor_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "type" VARCHAR(100) NOT NULL,
  "target_type" VARCHAR(64) NOT NULL,
  "target_id" VARCHAR(100) NOT NULL,
  "outcome" VARCHAR(32) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("tenant_id", "id"),
  CONSTRAINT "control_plane_events_metadata_object" CHECK (jsonb_typeof("metadata") = 'object')
);
CREATE INDEX "control_plane_events_tenant_created_idx" ON "control_plane_events"("tenant_id", "created_at");
CREATE INDEX "control_plane_events_tenant_type_created_idx" ON "control_plane_events"("tenant_id", "type", "created_at");

ALTER TABLE "organization_onboarding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_onboarding" FORCE ROW LEVEL SECURITY;
ALTER TABLE "organization_invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_invitations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "organization_invitation_branches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_invitation_branches" FORCE ROW LEVEL SECURITY;
ALTER TABLE "control_plane_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "control_plane_events" FORCE ROW LEVEL SECURITY;

DO $$ DECLARE table_name text; BEGIN
  FOREACH table_name IN ARRAY ARRAY['organization_onboarding','organization_invitations','organization_invitation_branches','control_plane_events'] LOOP
    EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL TO nexo_migration, nexo_runtime, nexo_readonly USING (tenant_id = app.current_tenant_id()) WITH CHECK (tenant_id = app.current_tenant_id())', table_name);
    EXECUTE format('CREATE POLICY migration_access ON %I FOR ALL TO nexo_migration USING (true) WITH CHECK (true)', table_name);
    EXECUTE format('CREATE POLICY runtime_access ON %I FOR ALL TO nexo_runtime USING (true) WITH CHECK (true)', table_name);
    EXECUTE format('CREATE POLICY readonly_access ON %I FOR SELECT TO nexo_readonly USING (true)', table_name);
  END LOOP;
END $$;

GRANT SELECT ON "business_templates" TO nexo_runtime, nexo_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON "organization_onboarding", "organization_invitations", "organization_invitation_branches" TO nexo_runtime;
GRANT SELECT, INSERT ON "control_plane_events" TO nexo_runtime;
GRANT SELECT ON "organization_onboarding", "organization_invitations", "organization_invitation_branches", "control_plane_events" TO nexo_readonly;

COMMENT ON TABLE "business_templates" IS 'Versioned data-driven onboarding templates; runtime is read-only.';
COMMENT ON TABLE "organization_onboarding" IS 'Restartable tenant onboarding state and applied template version.';
COMMENT ON TABLE "organization_invitations" IS 'Single-use, tenant-bound member invitations; only keyed token digests persist.';
COMMENT ON TABLE "control_plane_events" IS 'Append-only organization administration evidence.';
