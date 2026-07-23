CREATE TABLE payment_intents (id uuid NOT NULL DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,sale_id uuid NOT NULL,status varchar(40) NOT NULL,amount_minor bigint NOT NULL,currency char(3) NOT NULL,idempotency_key varchar(160) NOT NULL,provider varchar(80),provider_reference varchar(200),created_at timestamptz(6) NOT NULL DEFAULT now(),updated_at timestamptz(6) NOT NULL,PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,idempotency_key),FOREIGN KEY(tenant_id,sale_id) REFERENCES sales(tenant_id,id) ON DELETE RESTRICT,CHECK(amount_minor>0));
CREATE INDEX payment_intents_sale_idx ON payment_intents(tenant_id,sale_id);
CREATE TABLE payment_attempts (id uuid NOT NULL DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,payment_intent_id uuid NOT NULL,sequence integer NOT NULL,status varchar(40) NOT NULL,method varchar(40) NOT NULL,provider_reference varchar(200),failure_code varchar(80),created_at timestamptz(6) NOT NULL DEFAULT now(),PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,payment_intent_id,sequence),FOREIGN KEY(tenant_id,payment_intent_id) REFERENCES payment_intents(tenant_id,id) ON DELETE RESTRICT,CHECK(sequence>0));
CREATE TABLE refund_intents (id uuid NOT NULL DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,sale_id uuid NOT NULL,actor_user_id uuid NOT NULL,status varchar(40) NOT NULL,amount_minor bigint NOT NULL,idempotency_key varchar(160) NOT NULL,reason varchar(500) NOT NULL,created_at timestamptz(6) NOT NULL DEFAULT now(),updated_at timestamptz(6) NOT NULL,PRIMARY KEY(tenant_id,id),UNIQUE(tenant_id,idempotency_key),FOREIGN KEY(tenant_id,sale_id) REFERENCES sales(tenant_id,id) ON DELETE RESTRICT,CHECK(amount_minor>0));
CREATE INDEX refund_intents_sale_idx ON refund_intents(tenant_id,sale_id);
CREATE TABLE refund_lines (id uuid NOT NULL DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,refund_intent_id uuid NOT NULL,sale_item_id uuid NOT NULL,quantity numeric(20,6) NOT NULL,amount_minor bigint NOT NULL,destination varchar(40) NOT NULL,reason varchar(500) NOT NULL,PRIMARY KEY(tenant_id,id),FOREIGN KEY(tenant_id,refund_intent_id) REFERENCES refund_intents(tenant_id,id) ON DELETE RESTRICT,FOREIGN KEY(tenant_id,sale_item_id) REFERENCES sale_items(tenant_id,id) ON DELETE RESTRICT,CHECK(quantity>0),CHECK(amount_minor>0),CHECK(destination IN('AVAILABLE','DAMAGED','QUARANTINE','DISCARDED')));
CREATE INDEX refund_lines_intent_idx ON refund_lines(tenant_id,refund_intent_id);
CREATE TABLE sales_events (id uuid NOT NULL DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,aggregate_id uuid NOT NULL,aggregate_version integer NOT NULL,event_type varchar(120) NOT NULL,actor_user_id uuid NOT NULL,correlation_id uuid NOT NULL,payload jsonb NOT NULL,occurred_at timestamptz(6) NOT NULL DEFAULT now(),PRIMARY KEY(tenant_id,id));
CREATE INDEX sales_events_aggregate_idx ON sales_events(tenant_id,aggregate_id,occurred_at);

DO $$ DECLARE table_name text; BEGIN
 FOREACH table_name IN ARRAY ARRAY['payment_intents','payment_attempts','refund_intents','refund_lines','sales_events'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',table_name);EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',table_name);
  EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL TO nexo_migration,nexo_runtime,nexo_readonly USING(tenant_id=app.current_tenant_id()) WITH CHECK(tenant_id=app.current_tenant_id())',table_name);
  EXECUTE format('CREATE POLICY migration_access ON %I FOR ALL TO nexo_migration USING(true) WITH CHECK(true)',table_name);
  EXECUTE format('CREATE POLICY runtime_access ON %I FOR ALL TO nexo_runtime USING(true) WITH CHECK(true)',table_name);
  EXECUTE format('CREATE POLICY readonly_access ON %I FOR SELECT TO nexo_readonly USING(true)',table_name);
  EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON %I TO nexo_runtime',table_name);EXECUTE format('GRANT SELECT ON %I TO nexo_readonly',table_name);
 END LOOP;
END $$;
CREATE TRIGGER payment_attempts_no_delete BEFORE DELETE ON payment_attempts FOR EACH ROW EXECUTE FUNCTION app.prevent_sales_delete();
CREATE TRIGGER refund_intents_no_delete BEFORE DELETE ON refund_intents FOR EACH ROW EXECUTE FUNCTION app.prevent_sales_delete();
CREATE TRIGGER refund_lines_no_delete BEFORE DELETE ON refund_lines FOR EACH ROW EXECUTE FUNCTION app.prevent_sales_delete();
CREATE TRIGGER sales_events_no_delete BEFORE DELETE ON sales_events FOR EACH ROW EXECUTE FUNCTION app.prevent_sales_delete();
