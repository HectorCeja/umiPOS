ALTER TABLE cash_idempotency_records ALTER COLUMN response DROP NOT NULL;
ALTER TABLE cash_idempotency_records ALTER COLUMN status_code DROP NOT NULL;
ALTER TABLE cash_idempotency_records ADD COLUMN state text NOT NULL DEFAULT 'COMPLETED' CHECK(state IN('IN_PROGRESS','COMPLETED','FAILED'));
ALTER TABLE cash_idempotency_records ADD COLUMN error_code text;
ALTER TABLE cash_idempotency_records ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE cash_deposits ADD COLUMN reason text NOT NULL DEFAULT 'Cash deposit';
ALTER TABLE cash_deposits ADD COLUMN bag_reference text;
ALTER TABLE cash_deposits ADD COLUMN handed_over_at timestamptz;
ALTER TABLE cash_deposits ADD COLUMN confirmed_at timestamptz;
ALTER TABLE cash_deposits ADD COLUMN cancelled_at timestamptz;
ALTER TABLE cash_deposits ADD COLUMN correlation_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE cash_deposits ADD COLUMN idempotency_key text;
CREATE UNIQUE INDEX cash_deposits_idempotency_unique ON cash_deposits(tenant_id,idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE TABLE cash_handoffs(
 tenant_id uuid NOT NULL,organization_id uuid NOT NULL,branch_id uuid NOT NULL,id uuid NOT NULL DEFAULT gen_random_uuid(),session_id uuid NOT NULL,
 outgoing_cashier_id uuid NOT NULL,incoming_cashier_id uuid NOT NULL,expected_amount_minor bigint NOT NULL,counted_amount_minor bigint,
 variance_minor bigint,status text NOT NULL CHECK(status IN('INITIATED','COUNTED','ACCEPTED','REJECTED','CANCELLED','COMPLETED')),
 reason text NOT NULL,requested_by uuid NOT NULL,accepted_by uuid,approval_id uuid,correlation_id uuid NOT NULL,idempotency_key text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),completed_at timestamptz,
 PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,idempotency_key),FOREIGN KEY(tenant_id,session_id) REFERENCES cash_sessions(tenant_id,id)
);

CREATE TABLE cash_public_event_deliveries(
 tenant_id uuid NOT NULL,event_id uuid NOT NULL,event_type text NOT NULL,event_version integer NOT NULL,payload jsonb NOT NULL,
 delivered_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(tenant_id,event_id)
);

DO $cash$ DECLARE n text; BEGIN
 FOREACH n IN ARRAY ARRAY['cash_handoffs','cash_public_event_deliveries'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',n);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',n);
  EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL TO nexo_migration,nexo_runtime,nexo_readonly USING (tenant_id=app.current_tenant_id()) WITH CHECK (tenant_id=app.current_tenant_id())',n);
  EXECUTE format('CREATE POLICY migration_access ON %I FOR ALL TO nexo_migration USING (tenant_id=app.current_tenant_id()) WITH CHECK (tenant_id=app.current_tenant_id())',n);
  EXECUTE format('CREATE POLICY runtime_access ON %I FOR ALL TO nexo_runtime USING (tenant_id=app.current_tenant_id()) WITH CHECK (tenant_id=app.current_tenant_id())',n);
  EXECUTE format('CREATE POLICY readonly_access ON %I FOR SELECT TO nexo_readonly USING (tenant_id=app.current_tenant_id())',n);
 END LOOP;
END $cash$;
GRANT SELECT,INSERT,UPDATE ON cash_handoffs TO nexo_runtime;
GRANT SELECT ON cash_handoffs,cash_public_event_deliveries TO nexo_readonly;
GRANT SELECT,INSERT ON cash_public_event_deliveries TO nexo_worker;
CREATE POLICY cash_public_delivery_worker ON cash_public_event_deliveries FOR ALL TO nexo_worker USING(true) WITH CHECK(true);

CREATE INDEX cash_approvals_pending_idx ON cash_approvals(tenant_id,branch_id,status,expires_at);
CREATE INDEX cash_deposits_session_idx ON cash_deposits(tenant_id,session_id,created_at);
CREATE INDEX cash_handoffs_session_idx ON cash_handoffs(tenant_id,session_id,created_at);
