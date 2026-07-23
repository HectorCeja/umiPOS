-- Prisma materializes create() with INSERT ... RETURNING. RLS therefore needs
-- an explicit SELECT path in addition to INSERT for worker-owned event writes.
GRANT SELECT ON inventory_events TO nexo_worker;

DROP POLICY IF EXISTS inventory_events_worker_select ON inventory_events;
CREATE POLICY inventory_events_worker_select ON inventory_events
  FOR SELECT TO nexo_worker USING (true);
