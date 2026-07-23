-- Prompt 5: additive authorization registry, scoped role assignments and
-- organization feature state. Registry rows are materialized by the
-- administrative seed; absence remains default-deny.

CREATE TYPE "AuthorizationScope" AS ENUM ('GLOBAL', 'ORGANIZATION', 'BRANCH', 'SELF', 'CUSTOM');

CREATE TABLE "authorization_role_definitions" (
  "key" VARCHAR(64) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" VARCHAR(500) NOT NULL,
  "system" BOOLEAN NOT NULL DEFAULT true,
  "registry_version" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "authorization_role_definitions_pkey" PRIMARY KEY ("key"),
  CONSTRAINT "authorization_role_registry_version_positive" CHECK ("registry_version" > 0)
);

CREATE TABLE "authorization_permission_definitions" (
  "key" VARCHAR(100) NOT NULL,
  "resource" VARCHAR(80) NOT NULL,
  "action" VARCHAR(80) NOT NULL,
  "access_kind" VARCHAR(16) NOT NULL,
  "feature_key" VARCHAR(64),
  "description" VARCHAR(500) NOT NULL,
  "registry_version" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "authorization_permission_definitions_pkey" PRIMARY KEY ("key"),
  CONSTRAINT "authorization_permission_key_format" CHECK ("key" ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$'),
  CONSTRAINT "authorization_permission_access_kind" CHECK ("access_kind" IN ('READ', 'WRITE', 'ADMIN')),
  CONSTRAINT "authorization_permission_registry_version_positive" CHECK ("registry_version" > 0)
);
CREATE INDEX "authorization_permission_resource_action_idx"
  ON "authorization_permission_definitions"("resource", "action");

CREATE TABLE "authorization_role_permissions" (
  "role_key" VARCHAR(64) NOT NULL,
  "permission_key" VARCHAR(100) NOT NULL,
  "scope" "AuthorizationScope" NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "authorization_role_permissions_pkey" PRIMARY KEY ("role_key", "permission_key"),
  CONSTRAINT "authorization_role_permissions_role_fk" FOREIGN KEY ("role_key")
    REFERENCES "authorization_role_definitions"("key") ON DELETE RESTRICT,
  CONSTRAINT "authorization_role_permissions_permission_fk" FOREIGN KEY ("permission_key")
    REFERENCES "authorization_permission_definitions"("key") ON DELETE RESTRICT
);
CREATE INDEX "authorization_role_permissions_permission_idx"
  ON "authorization_role_permissions"("permission_key");

CREATE TABLE "authorization_feature_definitions" (
  "key" VARCHAR(64) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "registry_version" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "authorization_feature_definitions_pkey" PRIMARY KEY ("key"),
  CONSTRAINT "authorization_feature_key_format" CHECK ("key" ~ '^[A-Z][A-Z0-9_]*$'),
  CONSTRAINT "authorization_feature_registry_version_positive" CHECK ("registry_version" > 0)
);

CREATE TABLE "membership_authorization_roles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "membership_id" UUID NOT NULL,
  "role_key" VARCHAR(64) NOT NULL,
  "scope" "AuthorizationScope" NOT NULL DEFAULT 'ORGANIZATION',
  "branch_id" UUID,
  "custom_scope" VARCHAR(160),
  "valid_from" TIMESTAMPTZ(6),
  "valid_until" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "membership_authorization_roles_pkey" PRIMARY KEY ("tenant_id", "id"),
  CONSTRAINT "membership_authorization_roles_assignment_key" UNIQUE ("tenant_id", "membership_id", "role_key"),
  CONSTRAINT "membership_authorization_roles_membership_fk" FOREIGN KEY ("tenant_id", "membership_id")
    REFERENCES "memberships"("tenant_id", "id") ON DELETE CASCADE,
  CONSTRAINT "membership_authorization_roles_branch_fk" FOREIGN KEY ("tenant_id", "branch_id")
    REFERENCES "branches"("tenant_id", "id") ON DELETE RESTRICT,
  CONSTRAINT "membership_authorization_roles_role_fk" FOREIGN KEY ("role_key")
    REFERENCES "authorization_role_definitions"("key") ON DELETE RESTRICT,
  CONSTRAINT "membership_authorization_roles_validity" CHECK ("valid_until" IS NULL OR "valid_from" IS NULL OR "valid_until" > "valid_from"),
  CONSTRAINT "membership_authorization_roles_scope_shape" CHECK (
    ("scope" = 'BRANCH' AND "branch_id" IS NOT NULL AND "custom_scope" IS NULL) OR
    ("scope" = 'CUSTOM' AND "branch_id" IS NULL AND "custom_scope" IS NOT NULL) OR
    ("scope" IN ('GLOBAL', 'ORGANIZATION', 'SELF') AND "branch_id" IS NULL AND "custom_scope" IS NULL)
  )
);
CREATE INDEX "membership_authorization_roles_tenant_membership_idx"
  ON "membership_authorization_roles"("tenant_id", "membership_id");
CREATE INDEX "membership_authorization_roles_tenant_branch_idx"
  ON "membership_authorization_roles"("tenant_id", "branch_id");

CREATE TABLE "organization_features" (
  "tenant_id" UUID NOT NULL,
  "feature_key" VARCHAR(64) NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "config" JSONB NOT NULL DEFAULT '{}',
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "organization_features_pkey" PRIMARY KEY ("tenant_id", "feature_key"),
  CONSTRAINT "organization_features_tenant_fk" FOREIGN KEY ("tenant_id")
    REFERENCES "organizations"("id") ON DELETE RESTRICT,
  CONSTRAINT "organization_features_feature_fk" FOREIGN KEY ("feature_key")
    REFERENCES "authorization_feature_definitions"("key") ON DELETE RESTRICT,
  CONSTRAINT "organization_features_config_object" CHECK (jsonb_typeof("config") = 'object'),
  CONSTRAINT "organization_features_version_positive" CHECK ("version" > 0)
);
CREATE INDEX "organization_features_tenant_enabled_idx"
  ON "organization_features"("tenant_id", "enabled");

ALTER TABLE "membership_authorization_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "membership_authorization_roles" FORCE ROW LEVEL SECURITY;
ALTER TABLE "organization_features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization_features" FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "membership_authorization_roles"
  AS RESTRICTIVE FOR ALL TO nexo_migration, nexo_runtime, nexo_readonly
  USING ("tenant_id" = app.current_tenant_id())
  WITH CHECK ("tenant_id" = app.current_tenant_id());
CREATE POLICY "tenant_isolation" ON "organization_features"
  AS RESTRICTIVE FOR ALL TO nexo_migration, nexo_runtime, nexo_readonly
  USING ("tenant_id" = app.current_tenant_id())
  WITH CHECK ("tenant_id" = app.current_tenant_id());
CREATE POLICY "migration_access" ON "membership_authorization_roles" FOR ALL TO nexo_migration USING (true) WITH CHECK (true);
CREATE POLICY "migration_access" ON "organization_features" FOR ALL TO nexo_migration USING (true) WITH CHECK (true);
CREATE POLICY "runtime_access" ON "membership_authorization_roles" FOR ALL TO nexo_runtime USING (true) WITH CHECK (true);
CREATE POLICY "runtime_access" ON "organization_features" FOR ALL TO nexo_runtime USING (true) WITH CHECK (true);
CREATE POLICY "readonly_access" ON "membership_authorization_roles" FOR SELECT TO nexo_readonly USING (true);
CREATE POLICY "readonly_access" ON "organization_features" FOR SELECT TO nexo_readonly USING (true);

GRANT SELECT ON "authorization_role_definitions", "authorization_permission_definitions",
  "authorization_role_permissions", "authorization_feature_definitions" TO nexo_runtime, nexo_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON "membership_authorization_roles", "organization_features" TO nexo_runtime;
GRANT SELECT ON "membership_authorization_roles", "organization_features" TO nexo_readonly;

COMMENT ON TABLE "authorization_permission_definitions" IS 'Versioned canonical permission registry materialized by the administrative seed.';
COMMENT ON TABLE "authorization_role_permissions" IS 'Database-authoritative RBAC grants; application code never checks role names.';
COMMENT ON TABLE "membership_authorization_roles" IS 'Tenant-owned scoped role assignments resolved from active Membership.';
COMMENT ON TABLE "organization_features" IS 'Product availability state; feature flags never grant authorization by themselves.';
