CREATE TABLE inventory_counts (
  tenant_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL,
  location_id uuid NOT NULL,
  logical_balances jsonb NOT NULL,
  counted_quantity numeric(20,6) NOT NULL CHECK (counted_quantity >= 0),
  difference numeric(20,6) NOT NULL,
  reason varchar(500) NOT NULL CHECK (length(btrim(reason)) > 0),
  idempotency_key varchar(160) NOT NULL CHECK (length(idempotency_key) >= 8),
  movement_id uuid,
  actor_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, id),
  UNIQUE (tenant_id, idempotency_key),
  FOREIGN KEY (tenant_id, variant_id)
    REFERENCES product_variants(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, location_id)
    REFERENCES inventory_locations(tenant_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, movement_id)
    REFERENCES inventory_movements(tenant_id, id) ON DELETE RESTRICT
);

CREATE INDEX inventory_counts_tenant_variant_location_created_idx
  ON inventory_counts(tenant_id, variant_id, location_id, created_at);

ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_counts FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON inventory_counts AS RESTRICTIVE FOR ALL
  TO nexo_migration, nexo_runtime, nexo_readonly
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());
CREATE POLICY runtime_access ON inventory_counts FOR ALL TO nexo_runtime
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());
CREATE POLICY readonly_access ON inventory_counts FOR SELECT TO nexo_readonly
  USING (tenant_id = app.current_tenant_id());

GRANT SELECT, INSERT ON inventory_counts TO nexo_runtime;
GRANT SELECT ON inventory_counts TO nexo_readonly;

CREATE TRIGGER inventory_counts_immutable
  BEFORE UPDATE OR DELETE ON inventory_counts
  FOR EACH ROW EXECUTE FUNCTION app.prevent_inventory_ledger_mutation();
