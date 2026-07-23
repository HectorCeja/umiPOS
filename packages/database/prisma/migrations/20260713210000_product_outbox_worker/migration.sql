-- The dedicated publisher can only see and acknowledge the product outbox.
-- The role itself is provisioned outside migrations (bootstrap locally, IaC in production).
GRANT USAGE ON SCHEMA public TO nexo_worker;
GRANT SELECT, UPDATE ON product_outbox TO nexo_worker;
CREATE POLICY product_outbox_worker_select ON product_outbox FOR SELECT TO nexo_worker USING (true);
CREATE POLICY product_outbox_worker_update ON product_outbox FOR UPDATE TO nexo_worker USING (true) WITH CHECK (true);
