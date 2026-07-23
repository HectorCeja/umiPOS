-- Inventory locations cannot point at a branch or parent owned by another tenant.
ALTER TABLE inventory_locations
  ADD CONSTRAINT inventory_locations_tenant_branch_fk
  FOREIGN KEY (tenant_id, branch_id)
  REFERENCES branches (tenant_id, id)
  ON DELETE RESTRICT;

ALTER TABLE inventory_locations
  ADD CONSTRAINT inventory_locations_tenant_parent_fk
  FOREIGN KEY (tenant_id, parent_id)
  REFERENCES inventory_locations (tenant_id, id)
  ON DELETE RESTRICT;

-- A snapshot must identify the exact variant and immutable movement it summarizes.
ALTER TABLE inventory_snapshots
  ADD CONSTRAINT inventory_snapshots_tenant_variant_fk
  FOREIGN KEY (tenant_id, variant_id)
  REFERENCES product_variants (tenant_id, id)
  ON DELETE RESTRICT;

ALTER TABLE inventory_snapshots
  ADD CONSTRAINT inventory_snapshots_tenant_movement_fk
  FOREIGN KEY (tenant_id, through_movement_id)
  REFERENCES inventory_movements (tenant_id, id)
  ON DELETE RESTRICT;

-- Movement type, stock dimension and sign form one authoritative contract.
ALTER TABLE inventory_movements
  ADD CONSTRAINT inventory_movement_semantics CHECK (
    (type IN ('PURCHASE', 'RETURN', 'IMPORT') AND state = 'ON_HAND' AND quantity > 0)
    OR (type IN ('SALE', 'WASTE', 'CONSUMPTION') AND state = 'ON_HAND' AND quantity < 0)
    OR (type IN ('ADJUSTMENT', 'CORRECTION', 'COUNT') AND state = 'ON_HAND')
    OR (type = 'RESERVATION' AND state = 'RESERVED' AND quantity > 0)
    OR (type = 'RESERVATION_RELEASE' AND state = 'RESERVED' AND quantity < 0)
    OR (type = 'TRANSFER' AND state IN ('ON_HAND', 'IN_TRANSIT'))
  );

-- Snapshots are evidence derived from the ledger, not mutable application state.
REVOKE UPDATE ON inventory_snapshots FROM nexo_runtime;
CREATE TRIGGER inventory_snapshots_immutable
  BEFORE UPDATE OR DELETE ON inventory_snapshots
  FOR EACH ROW EXECUTE FUNCTION app.prevent_inventory_ledger_mutation();
