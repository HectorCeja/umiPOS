-- Core tenant foundation. This migration assumes roles were provisioned by
-- infra/postgres/bootstrap/roles.sql. The migration role owns objects; runtime
-- and read-only roles never do.

CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION nexo_migration;
REVOKE ALL ON SCHEMA app FROM PUBLIC;
GRANT USAGE ON SCHEMA app TO nexo_runtime, nexo_readonly;

CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'OFFBOARDING');
CREATE TYPE "BranchStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED');
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'SUPERVISOR', 'CASHIER', 'EMPLOYEE', 'ACCOUNTANT');
CREATE TYPE "MembershipAccessScope" AS ENUM ('ALL_BRANCHES', 'RESTRICTED');

CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "country_code" CHAR(2) NOT NULL,
    "default_locale" VARCHAR(35) NOT NULL,
    "default_currency" CHAR(3) NOT NULL,
    "time_zone" VARCHAR(63) NOT NULL,
    "branding" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "organizations_slug_key" UNIQUE ("slug"),
    CONSTRAINT "organizations_slug_format" CHECK ("slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT "organizations_country_code_format" CHECK ("country_code" ~ '^[A-Z]{2}$'),
    CONSTRAINT "organizations_currency_format" CHECK ("default_currency" ~ '^[A-Z]{3}$'),
    CONSTRAINT "organizations_branding_object" CHECK (jsonb_typeof("branding") = 'object'),
    CONSTRAINT "organizations_settings_object" CHECK (jsonb_typeof("settings") = 'object'),
    CONSTRAINT "organizations_version_positive" CHECK ("version" > 0)
);

CREATE TABLE "branches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "status" "BranchStatus" NOT NULL DEFAULT 'ACTIVE',
    "time_zone" VARCHAR(63),
    "locale" VARCHAR(35),
    "currency" CHAR(3),
    "business_hours" JSONB NOT NULL DEFAULT '{}',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "branches_pkey" PRIMARY KEY ("tenant_id", "id"),
    CONSTRAINT "branches_tenant_id_code_key" UNIQUE ("tenant_id", "code"),
    CONSTRAINT "branches_tenant_fk" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT,
    CONSTRAINT "branches_code_format" CHECK ("code" ~ '^[A-Z0-9][A-Z0-9_-]{0,49}$'),
    CONSTRAINT "branches_currency_format" CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$'),
    CONSTRAINT "branches_hours_object" CHECK (jsonb_typeof("business_hours") = 'object'),
    CONSTRAINT "branches_settings_object" CHECK (jsonb_typeof("settings") = 'object'),
    CONSTRAINT "branches_version_positive" CHECK ("version" > 0)
);

CREATE INDEX "branches_tenant_id_status_idx" ON "branches"("tenant_id", "status");

CREATE TABLE "memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "principal_id" UUID NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "access_scope" "MembershipAccessScope" NOT NULL DEFAULT 'ALL_BRANCHES',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "memberships_pkey" PRIMARY KEY ("tenant_id", "id"),
    CONSTRAINT "memberships_tenant_principal_key" UNIQUE ("tenant_id", "principal_id"),
    CONSTRAINT "memberships_tenant_fk" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT,
    CONSTRAINT "memberships_version_positive" CHECK ("version" > 0)
);

CREATE INDEX "memberships_principal_id_status_idx" ON "memberships"("principal_id", "status");
CREATE INDEX "memberships_tenant_id_role_status_idx" ON "memberships"("tenant_id", "role", "status");

CREATE TABLE "membership_branch_scopes" (
    "tenant_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "membership_branch_scopes_pkey" PRIMARY KEY ("tenant_id", "membership_id", "branch_id"),
    CONSTRAINT "membership_branch_scopes_membership_fk" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "memberships"("tenant_id", "id") ON DELETE CASCADE,
    CONSTRAINT "membership_branch_scopes_branch_fk" FOREIGN KEY ("tenant_id", "branch_id") REFERENCES "branches"("tenant_id", "id") ON DELETE CASCADE
);

CREATE INDEX "membership_branch_scopes_tenant_branch_idx" ON "membership_branch_scopes"("tenant_id", "branch_id");

CREATE FUNCTION app.current_tenant_id() RETURNS UUID
LANGUAGE SQL STABLE PARALLEL SAFE
RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;

REVOKE ALL ON FUNCTION app.current_tenant_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO nexo_runtime, nexo_readonly;

ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "branches" FORCE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" FORCE ROW LEVEL SECURITY;
ALTER TABLE "membership_branch_scopes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "membership_branch_scopes" FORCE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "organizations"
    AS RESTRICTIVE FOR ALL TO nexo_runtime, nexo_readonly
    USING ("id" = app.current_tenant_id())
    WITH CHECK ("id" = app.current_tenant_id());

CREATE POLICY "tenant_isolation" ON "branches"
    AS RESTRICTIVE FOR ALL TO nexo_runtime, nexo_readonly
    USING ("tenant_id" = app.current_tenant_id())
    WITH CHECK ("tenant_id" = app.current_tenant_id());

CREATE POLICY "tenant_isolation" ON "memberships"
    AS RESTRICTIVE FOR ALL TO nexo_runtime, nexo_readonly
    USING ("tenant_id" = app.current_tenant_id())
    WITH CHECK ("tenant_id" = app.current_tenant_id());

CREATE POLICY "tenant_isolation" ON "membership_branch_scopes"
    AS RESTRICTIVE FOR ALL TO nexo_runtime, nexo_readonly
    USING ("tenant_id" = app.current_tenant_id())
    WITH CHECK ("tenant_id" = app.current_tenant_id());

-- A restrictive policy cannot grant access by itself. This single permissive
-- policy makes tenant isolation explicit while additional restrictive policies
-- can safely be layered later.
CREATE POLICY "runtime_access" ON "organizations" FOR ALL TO nexo_runtime USING (true) WITH CHECK (true);
CREATE POLICY "runtime_access" ON "branches" FOR ALL TO nexo_runtime USING (true) WITH CHECK (true);
CREATE POLICY "runtime_access" ON "memberships" FOR ALL TO nexo_runtime USING (true) WITH CHECK (true);
CREATE POLICY "runtime_access" ON "membership_branch_scopes" FOR ALL TO nexo_runtime USING (true) WITH CHECK (true);

CREATE POLICY "readonly_access" ON "organizations" FOR SELECT TO nexo_readonly USING (true);
CREATE POLICY "readonly_access" ON "branches" FOR SELECT TO nexo_readonly USING (true);
CREATE POLICY "readonly_access" ON "memberships" FOR SELECT TO nexo_readonly USING (true);
CREATE POLICY "readonly_access" ON "membership_branch_scopes" FOR SELECT TO nexo_readonly USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON "organizations", "branches", "memberships", "membership_branch_scopes" TO nexo_runtime;
GRANT SELECT ON "organizations", "branches", "memberships", "membership_branch_scopes" TO nexo_readonly;

COMMENT ON TABLE "organizations" IS 'Tenant roots. The organization id is the tenant boundary.';
COMMENT ON TABLE "branches" IS 'Tenant-owned operating locations protected by forced RLS.';
COMMENT ON TABLE "memberships" IS 'Relationship between an external verified principal and a tenant.';
COMMENT ON TABLE "membership_branch_scopes" IS 'Restricted branch scopes with composite tenant-safe foreign keys.';
