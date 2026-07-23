-- Advanced Inventory rows have mutable lifecycle fields, but their identity,
-- quantity and ownership remain historical evidence.
ALTER TABLE inventory_transfers
  ADD CONSTRAINT inventory_transfers_tenant_variant_fk
  FOREIGN KEY (tenant_id, variant_id)
  REFERENCES product_variants (tenant_id, id)
  ON DELETE RESTRICT;

ALTER TABLE inventory_transfers
  ADD CONSTRAINT inventory_transfers_tenant_from_location_fk
  FOREIGN KEY (tenant_id, from_location_id)
  REFERENCES inventory_locations (tenant_id, id)
  ON DELETE RESTRICT;

ALTER TABLE inventory_transfers
  ADD CONSTRAINT inventory_transfers_tenant_to_location_fk
  FOREIGN KEY (tenant_id, to_location_id)
  REFERENCES inventory_locations (tenant_id, id)
  ON DELETE RESTRICT;

ALTER TABLE inventory_cost_layers
  ADD CONSTRAINT inventory_cost_layers_tenant_variant_fk
  FOREIGN KEY (tenant_id, variant_id)
  REFERENCES product_variants (tenant_id, id)
  ON DELETE RESTRICT;

ALTER TABLE inventory_cost_layers
  ADD CONSTRAINT inventory_cost_layers_tenant_receipt_fk
  FOREIGN KEY (tenant_id, receipt_movement_id)
  REFERENCES inventory_movements (tenant_id, id)
  ON DELETE RESTRICT;

ALTER TABLE inventory_cost_layers
  ADD CONSTRAINT inventory_cost_layers_tenant_receipt_unique
  UNIQUE (tenant_id, receipt_movement_id);

CREATE OR REPLACE FUNCTION app.protect_inventory_reservation_history() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_user = 'nexo_migration' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'inventory reservation history is immutable';
  END IF;
  IF NEW.tenant_id <> OLD.tenant_id
     OR NEW.id <> OLD.id
     OR NEW.variant_id <> OLD.variant_id
     OR NEW.location_id <> OLD.location_id
     OR NEW.quantity <> OLD.quantity
     OR NEW.source_type <> OLD.source_type
     OR NEW.source_id <> OLD.source_id
     OR NEW.expires_at <> OLD.expires_at
     OR NEW.created_by <> OLD.created_by
     OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'inventory reservation identity is immutable';
  END IF;
  IF OLD.status <> 'ACTIVE' AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'terminal inventory reservation cannot transition';
  END IF;
  IF OLD.status = 'ACTIVE' AND NEW.status NOT IN ('ACTIVE', 'RELEASED', 'EXPIRED', 'CONSUMED') THEN
    RAISE EXCEPTION 'invalid inventory reservation transition';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER inventory_reservations_history_guard
  BEFORE UPDATE OR DELETE ON inventory_reservations
  FOR EACH ROW EXECUTE FUNCTION app.protect_inventory_reservation_history();

CREATE OR REPLACE FUNCTION app.protect_inventory_transfer_history() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_user = 'nexo_migration' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'inventory transfer history is immutable';
  END IF;
  IF NEW.tenant_id <> OLD.tenant_id
     OR NEW.id <> OLD.id
     OR NEW.variant_id <> OLD.variant_id
     OR NEW.from_location_id <> OLD.from_location_id
     OR NEW.to_location_id <> OLD.to_location_id
     OR NEW.quantity <> OLD.quantity
     OR NEW.idempotency_key <> OLD.idempotency_key
     OR NEW.created_by <> OLD.created_by
     OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'inventory transfer identity is immutable';
  END IF;
  IF OLD.status IN ('COMPLETED', 'CANCELLED') AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'terminal inventory transfer cannot transition';
  END IF;
  IF OLD.status = 'IN_TRANSIT' AND NEW.status NOT IN ('IN_TRANSIT', 'COMPLETED', 'CANCELLED') THEN
    RAISE EXCEPTION 'invalid inventory transfer transition';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER inventory_transfers_history_guard
  BEFORE UPDATE OR DELETE ON inventory_transfers
  FOR EACH ROW EXECUTE FUNCTION app.protect_inventory_transfer_history();

CREATE OR REPLACE FUNCTION app.protect_inventory_cost_layer_history() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_user = 'nexo_migration' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'inventory cost layer history is immutable';
  END IF;
  IF NEW.tenant_id <> OLD.tenant_id
     OR NEW.id <> OLD.id
     OR NEW.variant_id <> OLD.variant_id
     OR NEW.location_id <> OLD.location_id
     OR NEW.receipt_movement_id <> OLD.receipt_movement_id
     OR NEW.original_quantity <> OLD.original_quantity
     OR NEW.unit_cost <> OLD.unit_cost
     OR NEW.currency <> OLD.currency
     OR NEW.received_at <> OLD.received_at THEN
    RAISE EXCEPTION 'inventory cost layer history is immutable';
  END IF;
  IF NEW.remaining_quantity > OLD.remaining_quantity THEN
    RAISE EXCEPTION 'inventory cost layer cannot be replenished';
  END IF;
  IF OLD.closed_at IS NOT NULL AND NEW.closed_at IS DISTINCT FROM OLD.closed_at THEN
    RAISE EXCEPTION 'closed inventory cost layer is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER inventory_cost_layers_history_guard
  BEFORE UPDATE OR DELETE ON inventory_cost_layers
  FOR EACH ROW EXECUTE FUNCTION app.protect_inventory_cost_layer_history();

GRANT SELECT, INSERT ON inventory_snapshots TO nexo_worker;
CREATE POLICY inventory_snapshots_worker_select
  ON inventory_snapshots FOR SELECT TO nexo_worker USING (true);
CREATE POLICY inventory_snapshots_worker_insert
  ON inventory_snapshots FOR INSERT TO nexo_worker WITH CHECK (true);
