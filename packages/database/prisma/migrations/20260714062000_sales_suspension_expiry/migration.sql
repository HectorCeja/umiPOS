ALTER TABLE sales ADD COLUMN expires_at timestamptz(6);
CREATE INDEX sales_suspension_expiry_idx ON sales(status, expires_at) WHERE status = 'SUSPENDED';

CREATE POLICY sales_worker_select_expired ON sales FOR SELECT TO nexo_worker
  USING ((status = 'SUSPENDED' AND expires_at <= CURRENT_TIMESTAMP)
    OR (tenant_id = app.current_tenant_id() AND status = 'EXPIRED'));
CREATE POLICY sales_worker_expire ON sales FOR UPDATE TO nexo_worker
  USING (tenant_id = app.current_tenant_id() AND status = 'SUSPENDED' AND expires_at <= CURRENT_TIMESTAMP)
  WITH CHECK (tenant_id = app.current_tenant_id() AND status = 'EXPIRED');
CREATE POLICY sales_events_worker_insert ON sales_events FOR INSERT TO nexo_worker
  WITH CHECK (tenant_id = app.current_tenant_id());
CREATE POLICY sales_events_worker_select_inserted ON sales_events FOR SELECT TO nexo_worker
  USING (tenant_id = app.current_tenant_id());
CREATE POLICY sales_outbox_worker_insert ON sales_outbox FOR INSERT TO nexo_worker
  WITH CHECK (tenant_id = app.current_tenant_id());

GRANT SELECT, UPDATE (status, version, updated_at) ON sales TO nexo_worker;
GRANT SELECT, INSERT ON sales_events TO nexo_worker;
GRANT INSERT ON sales_outbox TO nexo_worker;
