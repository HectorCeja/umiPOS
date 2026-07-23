-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'SERVICE', 'BUNDLE', 'KIT', 'COMPOSITE', 'DIGITAL', 'GIFT_CARD', 'SUBSCRIPTION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'DISABLED');

-- CreateEnum
CREATE TYPE "BarcodeType" AS ENUM ('EAN', 'UPC', 'GTIN', 'QR', 'INTERNAL');

-- CreateEnum
CREATE TYPE "ProductMediaStatus" AS ENUM ('PENDING', 'ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "ProductPriceKind" AS ENUM ('BASE', 'PRICE_LIST', 'CUSTOMER');

-- DropForeignKey
ALTER TABLE "authorization_role_permissions" DROP CONSTRAINT "authorization_role_permissions_permission_fk";

-- DropForeignKey
ALTER TABLE "authorization_role_permissions" DROP CONSTRAINT "authorization_role_permissions_role_fk";

-- DropForeignKey
ALTER TABLE "branches" DROP CONSTRAINT "branches_tenant_fk";

-- DropForeignKey
ALTER TABLE "control_plane_events" DROP CONSTRAINT "control_plane_events_actor_user_id_fkey";

-- DropForeignKey
ALTER TABLE "control_plane_events" DROP CONSTRAINT "control_plane_events_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_user_fk";

-- DropForeignKey
ALTER TABLE "identity_tokens" DROP CONSTRAINT "identity_tokens_email_fk";

-- DropForeignKey
ALTER TABLE "identity_tokens" DROP CONSTRAINT "identity_tokens_user_fk";

-- DropForeignKey
ALTER TABLE "membership_authorization_roles" DROP CONSTRAINT "membership_authorization_roles_branch_fk";

-- DropForeignKey
ALTER TABLE "membership_authorization_roles" DROP CONSTRAINT "membership_authorization_roles_membership_fk";

-- DropForeignKey
ALTER TABLE "membership_authorization_roles" DROP CONSTRAINT "membership_authorization_roles_role_fk";

-- DropForeignKey
ALTER TABLE "membership_branch_scopes" DROP CONSTRAINT "membership_branch_scopes_branch_fk";

-- DropForeignKey
ALTER TABLE "membership_branch_scopes" DROP CONSTRAINT "membership_branch_scopes_membership_fk";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_tenant_fk";

-- DropForeignKey
ALTER TABLE "organization_features" DROP CONSTRAINT "organization_features_feature_fk";

-- DropForeignKey
ALTER TABLE "organization_features" DROP CONSTRAINT "organization_features_tenant_fk";

-- DropForeignKey
ALTER TABLE "organization_invitation_branches" DROP CONSTRAINT "organization_invitation_branches_tenant_id_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_invitation_branches" DROP CONSTRAINT "organization_invitation_branches_tenant_id_invitation_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_invitations" DROP CONSTRAINT "organization_invitations_accepted_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_invitations" DROP CONSTRAINT "organization_invitations_invited_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_invitations" DROP CONSTRAINT "organization_invitations_role_key_fkey";

-- DropForeignKey
ALTER TABLE "organization_invitations" DROP CONSTRAINT "organization_invitations_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "organization_onboarding" DROP CONSTRAINT "organization_onboarding_template_key_fkey";

-- DropForeignKey
ALTER TABLE "organization_onboarding" DROP CONSTRAINT "organization_onboarding_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "password_credential_history" DROP CONSTRAINT "password_credential_history_user_fk";

-- DropForeignKey
ALTER TABLE "password_credentials" DROP CONSTRAINT "password_credentials_user_fk";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_session_fk";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_fk";

-- DropForeignKey
ALTER TABLE "security_events" DROP CONSTRAINT "security_events_user_fk";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_device_fk";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_fk";

-- DropForeignKey
ALTER TABLE "user_emails" DROP CONSTRAINT "user_emails_user_fk";

-- DropIndex
DROP INDEX "identity_tokens_email_purpose_expiry_idx";

-- AlterTable
ALTER TABLE "authorization_feature_definitions" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "authorization_permission_definitions" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "authorization_role_definitions" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "branches" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "business_templates" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "membership_authorization_roles" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "organization_features" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "organization_invitations" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "organization_onboarding" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "password_credentials" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user_emails" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "sku" VARCHAR(100),
    "normalized_sku" VARCHAR(100),
    "name" VARCHAR(200) NOT NULL,
    "short_name" VARCHAR(100),
    "description" TEXT,
    "short_description" VARCHAR(500),
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "ProductType" NOT NULL,
    "category_id" UUID,
    "brand" VARCHAR(120),
    "unit_code" VARCHAR(16) NOT NULL DEFAULT 'EA',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "search_terms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID NOT NULL,
    "updated_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "sku" VARCHAR(100),
    "normalized_sku" VARCHAR(100),
    "name" VARCHAR(200) NOT NULL,
    "option_values" JSONB NOT NULL DEFAULT '{}',
    "option_key" VARCHAR(1000) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMPTZ(6),
    "created_by" UUID NOT NULL,
    "updated_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "parent_id" UUID,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "product_barcodes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "type" "BarcodeType" NOT NULL,
    "value" VARCHAR(256) NOT NULL,
    "normalized_value" VARCHAR(256) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_barcodes_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "product_prices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "kind" "ProductPriceKind" NOT NULL DEFAULT 'BASE',
    "amount" DECIMAL(20,6) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "base_quantity" DECIMAL(20,6) NOT NULL DEFAULT 1,
    "unit_code" VARCHAR(16) NOT NULL DEFAULT 'EA',
    "tax_profile_key" VARCHAR(80),
    "price_list_key" VARCHAR(80),
    "context" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "product_media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "object_key" VARCHAR(500) NOT NULL,
    "content_type" VARCHAR(100) NOT NULL,
    "size_bytes" BIGINT,
    "alt_text" VARCHAR(500) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProductMediaStatus" NOT NULL DEFAULT 'PENDING',
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "product_outbox" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "aggregate_type" VARCHAR(80) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(6),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" VARCHAR(1000),

    CONSTRAINT "product_outbox_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "product_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "aggregate_type" VARCHAR(80) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_events_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateIndex
CREATE INDEX "products_tenant_id_status_type_idx" ON "products"("tenant_id", "status", "type");

-- CreateIndex
CREATE INDEX "products_tenant_id_category_id_idx" ON "products"("tenant_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenant_id_normalized_sku_key" ON "products"("tenant_id", "normalized_sku");

-- CreateIndex
CREATE INDEX "product_variants_tenant_id_product_id_status_idx" ON "product_variants"("tenant_id", "product_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_tenant_id_normalized_sku_key" ON "product_variants"("tenant_id", "normalized_sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_tenant_id_product_id_option_key_key" ON "product_variants"("tenant_id", "product_id", "option_key");

-- CreateIndex
CREATE INDEX "product_categories_tenant_id_parent_id_sort_order_idx" ON "product_categories"("tenant_id", "parent_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_tenant_id_slug_key" ON "product_categories"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "product_barcodes_tenant_id_product_id_idx" ON "product_barcodes"("tenant_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_barcodes_tenant_id_normalized_value_key" ON "product_barcodes"("tenant_id", "normalized_value");

-- CreateIndex
CREATE INDEX "product_prices_tenant_id_product_id_currency_active_idx" ON "product_prices"("tenant_id", "product_id", "currency", "active");

-- CreateIndex
CREATE INDEX "product_prices_tenant_id_variant_id_kind_idx" ON "product_prices"("tenant_id", "variant_id", "kind");

-- CreateIndex
CREATE INDEX "product_media_tenant_id_product_id_status_sort_order_idx" ON "product_media"("tenant_id", "product_id", "status", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "product_media_tenant_id_object_key_key" ON "product_media"("tenant_id", "object_key");

-- CreateIndex
CREATE INDEX "product_outbox_published_at_occurred_at_idx" ON "product_outbox"("published_at", "occurred_at");

-- CreateIndex
CREATE INDEX "product_outbox_tenant_id_aggregate_id_occurred_at_idx" ON "product_outbox"("tenant_id", "aggregate_id", "occurred_at");

-- CreateIndex
CREATE INDEX "product_events_tenant_id_aggregate_id_created_at_idx" ON "product_events"("tenant_id", "aggregate_id", "created_at");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_branch_scopes" ADD CONSTRAINT "membership_branch_scopes_tenant_id_membership_id_fkey" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "memberships"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_branch_scopes" ADD CONSTRAINT "membership_branch_scopes_tenant_id_branch_id_fkey" FOREIGN KEY ("tenant_id", "branch_id") REFERENCES "branches"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorization_role_permissions" ADD CONSTRAINT "authorization_role_permissions_role_key_fkey" FOREIGN KEY ("role_key") REFERENCES "authorization_role_definitions"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorization_role_permissions" ADD CONSTRAINT "authorization_role_permissions_permission_key_fkey" FOREIGN KEY ("permission_key") REFERENCES "authorization_permission_definitions"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_authorization_roles" ADD CONSTRAINT "membership_authorization_roles_tenant_id_membership_id_fkey" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "memberships"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_authorization_roles" ADD CONSTRAINT "membership_authorization_roles_role_key_fkey" FOREIGN KEY ("role_key") REFERENCES "authorization_role_definitions"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_onboarding" ADD CONSTRAINT "organization_onboarding_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_onboarding" ADD CONSTRAINT "organization_onboarding_template_key_fkey" FOREIGN KEY ("template_key") REFERENCES "business_templates"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitation_branches" ADD CONSTRAINT "organization_invitation_branches_tenant_id_invitation_id_fkey" FOREIGN KEY ("tenant_id", "invitation_id") REFERENCES "organization_invitations"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invitation_branches" ADD CONSTRAINT "organization_invitation_branches_tenant_id_branch_id_fkey" FOREIGN KEY ("tenant_id", "branch_id") REFERENCES "branches"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_plane_events" ADD CONSTRAINT "control_plane_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_features" ADD CONSTRAINT "organization_features_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_features" ADD CONSTRAINT "organization_features_feature_key_fkey" FOREIGN KEY ("feature_key") REFERENCES "authorization_feature_definitions"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_credentials" ADD CONSTRAINT "password_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_credential_history" ADD CONSTRAINT "password_credential_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_emails" ADD CONSTRAINT "user_emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_tokens" ADD CONSTRAINT "identity_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_tokens" ADD CONSTRAINT "identity_tokens_email_id_fkey" FOREIGN KEY ("email_id") REFERENCES "user_emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_barcodes" ADD CONSTRAINT "product_barcodes_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_barcodes" ADD CONSTRAINT "product_barcodes_tenant_id_variant_id_fkey" FOREIGN KEY ("tenant_id", "variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_tenant_id_variant_id_fkey" FOREIGN KEY ("tenant_id", "variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_tenant_id_variant_id_fkey" FOREIGN KEY ("tenant_id", "variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "authorization_permission_resource_action_idx" RENAME TO "authorization_permission_definitions_resource_action_idx";

-- RenameIndex
ALTER INDEX "authorization_role_permissions_permission_idx" RENAME TO "authorization_role_permissions_permission_key_idx";

-- RenameIndex
ALTER INDEX "control_plane_events_tenant_created_idx" RENAME TO "control_plane_events_tenant_id_created_at_idx";

-- RenameIndex
ALTER INDEX "control_plane_events_tenant_type_created_idx" RENAME TO "control_plane_events_tenant_id_type_created_at_idx";

-- RenameIndex
ALTER INDEX "devices_user_fingerprint_key" RENAME TO "devices_user_id_fingerprint_key";

-- RenameIndex
ALTER INDEX "devices_user_revoked_idx" RENAME TO "devices_user_id_revoked_at_idx";

-- RenameIndex
ALTER INDEX "identity_tokens_hash_key" RENAME TO "identity_tokens_token_hash_key";

-- RenameIndex
ALTER INDEX "identity_tokens_user_purpose_expiry_idx" RENAME TO "identity_tokens_user_id_purpose_expires_at_idx";

-- RenameIndex
ALTER INDEX "membership_authorization_roles_assignment_key" RENAME TO "membership_authorization_roles_tenant_id_membership_id_role_key";

-- RenameIndex
ALTER INDEX "membership_authorization_roles_tenant_branch_idx" RENAME TO "membership_authorization_roles_tenant_id_branch_id_idx";

-- RenameIndex
ALTER INDEX "membership_authorization_roles_tenant_membership_idx" RENAME TO "membership_authorization_roles_tenant_id_membership_id_idx";

-- RenameIndex
ALTER INDEX "membership_branch_scopes_tenant_branch_idx" RENAME TO "membership_branch_scopes_tenant_id_branch_id_idx";

-- RenameIndex
ALTER INDEX "memberships_tenant_principal_key" RENAME TO "memberships_tenant_id_principal_id_key";

-- RenameIndex
ALTER INDEX "organization_features_tenant_enabled_idx" RENAME TO "organization_features_tenant_id_enabled_idx";

-- RenameIndex
ALTER INDEX "organization_invitation_branches_tenant_branch_idx" RENAME TO "organization_invitation_branches_tenant_id_branch_id_idx";

-- RenameIndex
ALTER INDEX "organization_invitations_tenant_email_status_idx" RENAME TO "organization_invitations_tenant_id_normalized_email_status_idx";

-- RenameIndex
ALTER INDEX "organization_invitations_tenant_expiry_idx" RENAME TO "organization_invitations_tenant_id_expires_at_idx";

-- RenameIndex
ALTER INDEX "organization_onboarding_tenant_status_idx" RENAME TO "organization_onboarding_tenant_id_status_idx";

-- RenameIndex
ALTER INDEX "password_credential_history_user_retired_idx" RENAME TO "password_credential_history_user_id_retired_at_idx";

-- RenameIndex
ALTER INDEX "refresh_tokens_hash_key" RENAME TO "refresh_tokens_token_hash_key";

-- RenameIndex
ALTER INDEX "refresh_tokens_session_generation_key" RENAME TO "refresh_tokens_session_id_generation_key";

-- RenameIndex
ALTER INDEX "refresh_tokens_session_status_idx" RENAME TO "refresh_tokens_session_id_status_idx";

-- RenameIndex
ALTER INDEX "refresh_tokens_user_status_expiry_idx" RENAME TO "refresh_tokens_user_id_status_expires_at_idx";

-- RenameIndex
ALTER INDEX "security_events_type_created_idx" RENAME TO "security_events_type_created_at_idx";

-- RenameIndex
ALTER INDEX "security_events_user_created_idx" RENAME TO "security_events_user_id_created_at_idx";

-- RenameIndex
ALTER INDEX "sessions_device_status_idx" RENAME TO "sessions_device_id_status_idx";

-- RenameIndex
ALTER INDEX "sessions_user_status_expiry_idx" RENAME TO "sessions_user_id_status_absolute_expires_at_idx";

-- RenameIndex
ALTER INDEX "user_emails_user_status_idx" RENAME TO "user_emails_user_id_status_idx";

-- Product Platform security invariants: every catalog table is tenant owned,
-- default deny, FORCE RLS, and the runtime role cannot physically delete rows.
DO $product_rls$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'products','product_variants','product_categories','product_barcodes',
    'product_prices','product_media','product_outbox','product_events'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL TO nexo_migration, nexo_runtime, nexo_readonly USING (tenant_id = app.current_tenant_id()) WITH CHECK (tenant_id = app.current_tenant_id())', table_name);
    EXECUTE format('CREATE POLICY migration_access ON %I FOR ALL TO nexo_migration USING (true) WITH CHECK (true)', table_name);
    EXECUTE format('CREATE POLICY runtime_access ON %I FOR ALL TO nexo_runtime USING (true) WITH CHECK (true)', table_name);
    EXECUTE format('CREATE POLICY readonly_access ON %I FOR SELECT TO nexo_readonly USING (true)', table_name);
  END LOOP;
END $product_rls$;

GRANT SELECT, INSERT, UPDATE ON products, product_variants, product_categories,
  product_barcodes, product_prices, product_media, product_outbox TO nexo_runtime;
GRANT SELECT, INSERT ON product_events TO nexo_runtime;
GRANT SELECT ON products, product_variants, product_categories, product_barcodes,
  product_prices, product_media, product_outbox, product_events TO nexo_readonly;

ALTER TABLE product_prices ADD CONSTRAINT product_prices_amount_nonnegative CHECK (amount >= 0);
ALTER TABLE product_prices ADD CONSTRAINT product_prices_base_quantity_positive CHECK (base_quantity > 0);
ALTER TABLE product_media ADD CONSTRAINT product_media_size_nonnegative CHECK (size_bytes IS NULL OR size_bytes >= 0);

CREATE UNIQUE INDEX product_variants_one_default
  ON product_variants (tenant_id, product_id) WHERE is_default AND deleted_at IS NULL;
CREATE UNIQUE INDEX product_media_one_primary
  ON product_media (tenant_id, product_id) WHERE is_primary AND status <> 'DELETED';

CREATE FUNCTION app.reject_category_cycle() RETURNS trigger LANGUAGE plpgsql AS $cycle$
DECLARE cursor_id uuid;
BEGIN
  IF NEW.parent_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.parent_id = NEW.id THEN RAISE EXCEPTION 'category cycle'; END IF;
  cursor_id := NEW.parent_id;
  WHILE cursor_id IS NOT NULL LOOP
    IF cursor_id = NEW.id THEN RAISE EXCEPTION 'category cycle'; END IF;
    SELECT parent_id INTO cursor_id FROM product_categories
      WHERE tenant_id = NEW.tenant_id AND id = cursor_id;
  END LOOP;
  RETURN NEW;
END $cycle$;
CREATE TRIGGER product_category_no_cycle BEFORE INSERT OR UPDATE OF parent_id
  ON product_categories FOR EACH ROW EXECUTE FUNCTION app.reject_category_cycle();
