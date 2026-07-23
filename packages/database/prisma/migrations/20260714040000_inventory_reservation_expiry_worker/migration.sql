-- Prompt 9 audit correction: reservations previously carried expires_at but no
-- least-privilege process could release their ledger allocation.
GRANT SELECT, UPDATE ON inventory_reservations TO nexo_worker;
GRANT SELECT, INSERT ON inventory_movements, inventory_events TO nexo_worker;
GRANT INSERT ON inventory_outbox TO nexo_worker;

CREATE POLICY inventory_reservations_worker_select ON inventory_reservations
  FOR SELECT TO nexo_worker USING (true);
CREATE POLICY inventory_reservations_worker_update ON inventory_reservations
  FOR UPDATE TO nexo_worker USING (true) WITH CHECK (true);
CREATE POLICY inventory_movements_worker_select ON inventory_movements
  FOR SELECT TO nexo_worker USING (true);
CREATE POLICY inventory_movements_worker_insert ON inventory_movements
  FOR INSERT TO nexo_worker WITH CHECK (true);
CREATE POLICY inventory_events_worker_insert ON inventory_events
  FOR INSERT TO nexo_worker WITH CHECK (true);
CREATE POLICY inventory_outbox_worker_insert ON inventory_outbox
  FOR INSERT TO nexo_worker WITH CHECK (true);
