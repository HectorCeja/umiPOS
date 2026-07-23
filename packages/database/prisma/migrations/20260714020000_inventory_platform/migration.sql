-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('PURCHASE', 'SALE', 'ADJUSTMENT', 'TRANSFER', 'RESERVATION', 'RESERVATION_RELEASE', 'WASTE', 'CONSUMPTION', 'RETURN', 'CORRECTION', 'COUNT', 'IMPORT');

-- CreateEnum
CREATE TYPE "InventoryStockState" AS ENUM ('ON_HAND', 'RESERVED', 'COMMITTED', 'IN_TRANSIT', 'DAMAGED', 'QUARANTINE');

-- CreateEnum
CREATE TYPE "InventoryLocationType" AS ENUM ('BRANCH', 'WAREHOUSE', 'ZONE', 'SHELF', 'BIN');

-- CreateEnum
CREATE TYPE "InventoryReservationStatus" AS ENUM ('ACTIVE', 'RELEASED', 'EXPIRED', 'CONSUMED');

-- CreateEnum
CREATE TYPE "InventoryCostMethod" AS ENUM ('FIFO', 'WEIGHTED_AVERAGE', 'STANDARD', 'LIFO');

-- CreateEnum
CREATE TYPE "InventoryTransferStatus" AS ENUM ('DRAFT', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "inventory_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "parent_id" UUID,
    "type" "InventoryLocationType" NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inventory_locations_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "inventory_policies" (
    "tenant_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "allow_negative" BOOLEAN NOT NULL DEFAULT false,
    "cost_method" "InventoryCostMethod" NOT NULL DEFAULT 'FIFO',
    "standard_unit_cost" DECIMAL(20,6),
    "low_stock_threshold" DECIMAL(20,6),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inventory_policies_pkey" PRIMARY KEY ("tenant_id","variant_id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "state" "InventoryStockState" NOT NULL,
    "quantity" DECIMAL(20,6) NOT NULL,
    "unit_cost" DECIMAL(20,6),
    "total_cost" DECIMAL(20,6),
    "correlation_id" UUID NOT NULL,
    "causation_id" UUID,
    "idempotency_key" VARCHAR(160) NOT NULL,
    "reference_type" VARCHAR(80),
    "reference_id" VARCHAR(160),
    "reason" VARCHAR(500) NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_user_id" UUID NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "inventory_reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "quantity" DECIMAL(20,6) NOT NULL,
    "status" "InventoryReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "source_type" VARCHAR(80) NOT NULL,
    "source_id" VARCHAR(160) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "released_at" TIMESTAMPTZ(6),
    "release_reason" VARCHAR(500),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "inventory_reservations_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "inventory_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "through_movement_id" UUID NOT NULL,
    "balances" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_snapshots_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "inventory_cost_layers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "receipt_movement_id" UUID NOT NULL,
    "original_quantity" DECIMAL(20,6) NOT NULL,
    "remaining_quantity" DECIMAL(20,6) NOT NULL,
    "unit_cost" DECIMAL(20,6) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "received_at" TIMESTAMPTZ(6) NOT NULL,
    "closed_at" TIMESTAMPTZ(6),

    CONSTRAINT "inventory_cost_layers_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "inventory_transfers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "from_location_id" UUID NOT NULL,
    "to_location_id" UUID NOT NULL,
    "quantity" DECIMAL(20,6) NOT NULL,
    "status" "InventoryTransferStatus" NOT NULL DEFAULT 'DRAFT',
    "idempotency_key" VARCHAR(160) NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "inventory_transfers_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "inventory_outbox" (
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

    CONSTRAINT "inventory_outbox_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateTable
CREATE TABLE "inventory_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "aggregate_type" VARCHAR(80) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_events_pkey" PRIMARY KEY ("tenant_id","id")
);

-- CreateIndex
CREATE INDEX "inventory_locations_tenant_id_branch_id_parent_id_idx" ON "inventory_locations"("tenant_id", "branch_id", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_locations_tenant_id_code_key" ON "inventory_locations"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "inventory_movements_tenant_id_variant_id_location_id_record_idx" ON "inventory_movements"("tenant_id", "variant_id", "location_id", "recorded_at");

-- CreateIndex
CREATE INDEX "inventory_movements_tenant_id_correlation_id_idx" ON "inventory_movements"("tenant_id", "correlation_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_movements_tenant_id_idempotency_key_key" ON "inventory_movements"("tenant_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "inventory_reservations_tenant_id_status_expires_at_idx" ON "inventory_reservations"("tenant_id", "status", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_reservations_tenant_id_source_type_source_id_vari_key" ON "inventory_reservations"("tenant_id", "source_type", "source_id", "variant_id");

-- CreateIndex
CREATE INDEX "inventory_snapshots_tenant_id_variant_id_location_id_create_idx" ON "inventory_snapshots"("tenant_id", "variant_id", "location_id", "created_at");

-- CreateIndex
CREATE INDEX "inventory_cost_layers_tenant_id_variant_id_location_id_rece_idx" ON "inventory_cost_layers"("tenant_id", "variant_id", "location_id", "received_at");

-- CreateIndex
CREATE INDEX "inventory_transfers_tenant_id_status_idx" ON "inventory_transfers"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_transfers_tenant_id_idempotency_key_key" ON "inventory_transfers"("tenant_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "inventory_outbox_published_at_occurred_at_idx" ON "inventory_outbox"("published_at", "occurred_at");

-- CreateIndex
CREATE INDEX "inventory_events_tenant_id_aggregate_id_created_at_idx" ON "inventory_events"("tenant_id", "aggregate_id", "created_at");

-- AddForeignKey
ALTER TABLE "inventory_policies" ADD CONSTRAINT "inventory_policies_tenant_id_variant_id_fkey" FOREIGN KEY ("tenant_id", "variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_tenant_id_location_id_fkey" FOREIGN KEY ("tenant_id", "location_id") REFERENCES "inventory_locations"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_tenant_id_variant_id_fkey" FOREIGN KEY ("tenant_id", "variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_tenant_id_location_id_fkey" FOREIGN KEY ("tenant_id", "location_id") REFERENCES "inventory_locations"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_tenant_id_variant_id_fkey" FOREIGN KEY ("tenant_id", "variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

DO $inventory_rls$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['inventory_locations','inventory_policies','inventory_movements','inventory_reservations','inventory_snapshots','inventory_cost_layers','inventory_transfers','inventory_outbox','inventory_events'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL TO nexo_migration, nexo_runtime, nexo_readonly USING (tenant_id = app.current_tenant_id()) WITH CHECK (tenant_id = app.current_tenant_id())', table_name);
    EXECUTE format('CREATE POLICY migration_access ON %I FOR ALL TO nexo_migration USING (true) WITH CHECK (true)', table_name);
    EXECUTE format('CREATE POLICY runtime_access ON %I FOR ALL TO nexo_runtime USING (true) WITH CHECK (true)', table_name);
    EXECUTE format('CREATE POLICY readonly_access ON %I FOR SELECT TO nexo_readonly USING (true)', table_name);
  END LOOP;
END $inventory_rls$;

GRANT SELECT, INSERT, UPDATE ON inventory_locations, inventory_policies,
 inventory_reservations, inventory_snapshots, inventory_cost_layers, inventory_transfers,
 inventory_outbox TO nexo_runtime;
GRANT SELECT, INSERT ON inventory_movements, inventory_events TO nexo_runtime;
GRANT SELECT ON inventory_locations, inventory_policies, inventory_movements,
 inventory_reservations, inventory_snapshots, inventory_cost_layers, inventory_transfers,
 inventory_outbox, inventory_events TO nexo_readonly;
GRANT SELECT, UPDATE ON inventory_outbox TO nexo_worker;
CREATE POLICY inventory_outbox_worker_select ON inventory_outbox FOR SELECT TO nexo_worker USING (true);
CREATE POLICY inventory_outbox_worker_update ON inventory_outbox FOR UPDATE TO nexo_worker USING (true) WITH CHECK (true);

ALTER TABLE inventory_movements ADD CONSTRAINT inventory_movement_nonzero CHECK (quantity <> 0);
ALTER TABLE inventory_reservations ADD CONSTRAINT inventory_reservation_positive CHECK (quantity > 0);
ALTER TABLE inventory_cost_layers ADD CONSTRAINT inventory_cost_layer_valid CHECK (original_quantity > 0 AND remaining_quantity >= 0 AND remaining_quantity <= original_quantity AND unit_cost >= 0);
ALTER TABLE inventory_transfers ADD CONSTRAINT inventory_transfer_valid CHECK (quantity > 0 AND from_location_id <> to_location_id);
ALTER TABLE inventory_policies ADD CONSTRAINT inventory_standard_cost_valid CHECK (standard_unit_cost IS NULL OR standard_unit_cost >= 0);

CREATE FUNCTION app.prevent_inventory_ledger_mutation() RETURNS trigger LANGUAGE plpgsql AS $immutable$
BEGIN RAISE EXCEPTION 'inventory ledger is immutable'; END $immutable$;
CREATE TRIGGER inventory_movements_immutable BEFORE UPDATE OR DELETE ON inventory_movements FOR EACH ROW EXECUTE FUNCTION app.prevent_inventory_ledger_mutation();
CREATE TRIGGER inventory_events_immutable BEFORE UPDATE OR DELETE ON inventory_events FOR EACH ROW EXECUTE FUNCTION app.prevent_inventory_ledger_mutation();

CREATE FUNCTION app.reject_inventory_location_cycle() RETURNS trigger LANGUAGE plpgsql AS $cycle$
DECLARE cursor_id uuid;
BEGIN
 IF NEW.parent_id IS NULL THEN RETURN NEW; END IF;
 IF NEW.parent_id = NEW.id THEN RAISE EXCEPTION 'inventory location cycle'; END IF;
 cursor_id := NEW.parent_id;
 WHILE cursor_id IS NOT NULL LOOP
  IF cursor_id = NEW.id THEN RAISE EXCEPTION 'inventory location cycle'; END IF;
  SELECT parent_id INTO cursor_id FROM inventory_locations WHERE tenant_id=NEW.tenant_id AND id=cursor_id;
 END LOOP;
 RETURN NEW;
END $cycle$;
CREATE TRIGGER inventory_location_no_cycle BEFORE INSERT OR UPDATE OF parent_id ON inventory_locations FOR EACH ROW EXECUTE FUNCTION app.reject_inventory_location_cycle();

-- AddForeignKey
ALTER TABLE "inventory_snapshots" ADD CONSTRAINT "inventory_snapshots_tenant_id_location_id_fkey" FOREIGN KEY ("tenant_id", "location_id") REFERENCES "inventory_locations"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_cost_layers" ADD CONSTRAINT "inventory_cost_layers_tenant_id_location_id_fkey" FOREIGN KEY ("tenant_id", "location_id") REFERENCES "inventory_locations"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
