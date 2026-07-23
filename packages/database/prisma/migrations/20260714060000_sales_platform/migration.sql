CREATE TABLE sales (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL,
  organization_id uuid NOT NULL, branch_id uuid NOT NULL, register_id uuid, customer_id uuid,
  seller_user_id uuid NOT NULL, membership_id uuid NOT NULL, currency char(3) NOT NULL,
  business_date date NOT NULL, folio varchar(80), status varchar(40) NOT NULL,
  channel varchar(40) NOT NULL, source varchar(80) NOT NULL, external_reference varchar(200),
  idempotency_key varchar(160) NOT NULL, correlation_id uuid NOT NULL, notes varchar(1000),
  metadata jsonb NOT NULL DEFAULT '{}', version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT now(), updated_at timestamptz(6) NOT NULL,
  completed_at timestamptz(6), cancelled_at timestamptz(6),
  PRIMARY KEY (tenant_id,id), UNIQUE (tenant_id,idempotency_key),
  UNIQUE (tenant_id,branch_id,folio),
  CHECK (currency ~ '^[A-Z]{3}$'), CHECK (version > 0), CHECK (tenant_id = organization_id),
  CHECK (status IN ('DRAFT','OPEN','SUSPENDED','CHECKOUT_PENDING','PAYMENT_PENDING','COMPLETED','CANCELLED','PARTIALLY_REFUNDED','REFUNDED','FAILED','EXPIRED')),
  CHECK (channel IN ('WEB_POS','FLUTTER_POS','UMI','API','IMPORT','ECOMMERCE_FUTURE','MARKETPLACE_FUTURE')),
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id,branch_id) REFERENCES branches(tenant_id,id) ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id,membership_id) REFERENCES memberships(tenant_id,id) ON DELETE RESTRICT
);
CREATE INDEX sales_active_idx ON sales(tenant_id,branch_id,status,business_date);

CREATE TABLE sale_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, sale_id uuid NOT NULL,
  product_variant_id uuid NOT NULL, product_id uuid, snapshot jsonb NOT NULL,
  quantity numeric(20,6) NOT NULL, unit_amount_minor bigint NOT NULL,
  subtotal_minor bigint NOT NULL, discount_minor bigint NOT NULL, tax_minor bigint NOT NULL,
  total_minor bigint NOT NULL, version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT now(), updated_at timestamptz(6) NOT NULL,
  PRIMARY KEY (tenant_id,id), FOREIGN KEY (tenant_id,sale_id) REFERENCES sales(tenant_id,id) ON DELETE RESTRICT,
  CHECK (quantity > 0), CHECK (unit_amount_minor >= 0), CHECK (subtotal_minor >= 0),
  CHECK (discount_minor >= 0), CHECK (tax_minor >= 0), CHECK (total_minor >= 0), CHECK (version > 0)
);
CREATE INDEX sale_items_sale_idx ON sale_items(tenant_id,sale_id);

CREATE TABLE sale_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, sale_id uuid NOT NULL,
  method varchar(40) NOT NULL, status varchar(40) NOT NULL, amount_minor bigint NOT NULL,
  tendered_minor bigint, provider_reference varchar(200), idempotency_key varchar(160) NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT now(), updated_at timestamptz(6) NOT NULL,
  PRIMARY KEY (tenant_id,id), UNIQUE (tenant_id,idempotency_key),
  FOREIGN KEY (tenant_id,sale_id) REFERENCES sales(tenant_id,id) ON DELETE RESTRICT,
  CHECK (amount_minor > 0), CHECK (tendered_minor IS NULL OR tendered_minor >= amount_minor),
  CHECK (method IN ('CASH','CARD_EXTERNAL','BANK_TRANSFER','UMI_WALLET_FUTURE','GIFT_CARD_FUTURE','OTHER')),
  CHECK (status IN ('PENDING','AUTHORIZED','CAPTURED','REJECTED','CANCELLED','REFUNDED'))
);
CREATE INDEX sale_payments_sale_idx ON sale_payments(tenant_id,sale_id);

CREATE TABLE sales_idempotency (
  tenant_id uuid NOT NULL, operation varchar(80) NOT NULL, key varchar(160) NOT NULL,
  request_fingerprint char(64) NOT NULL, response_status integer, response_body jsonb,
  resource_id uuid, created_at timestamptz(6) NOT NULL DEFAULT now(), expires_at timestamptz(6) NOT NULL,
  PRIMARY KEY (tenant_id,operation,key), CHECK (request_fingerprint ~ '^[0-9a-f]{64}$')
);
CREATE INDEX sales_idempotency_expiry_idx ON sales_idempotency(expires_at);

CREATE TABLE sales_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, branch_id uuid,
  configuration jsonb NOT NULL, version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT now(), updated_at timestamptz(6) NOT NULL,
  PRIMARY KEY (tenant_id,id), CHECK (version > 0)
);
CREATE UNIQUE INDEX sales_policy_org_unique ON sales_policies(tenant_id) WHERE branch_id IS NULL;
CREATE UNIQUE INDEX sales_policy_branch_unique ON sales_policies(tenant_id,branch_id) WHERE branch_id IS NOT NULL;

CREATE TABLE sales_folio_sequences (
  tenant_id uuid NOT NULL, branch_id uuid NOT NULL, prefix varchar(20) NOT NULL DEFAULT 'S',
  next_value bigint NOT NULL DEFAULT 1, updated_at timestamptz(6) NOT NULL,
  PRIMARY KEY (tenant_id,branch_id), CHECK (next_value > 0),
  FOREIGN KEY (tenant_id,branch_id) REFERENCES branches(tenant_id,id) ON DELETE RESTRICT
);

CREATE TABLE sales_outbox (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, aggregate_id uuid NOT NULL,
  aggregate_version integer NOT NULL, event_type varchar(120) NOT NULL, event_version integer NOT NULL DEFAULT 1,
  correlation_id uuid NOT NULL, causation_id uuid, payload jsonb NOT NULL,
  occurred_at timestamptz(6) NOT NULL DEFAULT now(), published_at timestamptz(6), attempts integer NOT NULL DEFAULT 0,
  last_error varchar(1000), PRIMARY KEY (tenant_id,id),
  UNIQUE (tenant_id,aggregate_id,aggregate_version,event_type), CHECK (event_version > 0), CHECK (attempts >= 0)
);
CREATE INDEX sales_outbox_pending_idx ON sales_outbox(published_at,occurred_at);

CREATE TABLE sale_receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, sale_id uuid NOT NULL,
  version integer NOT NULL DEFAULT 1, model jsonb NOT NULL, content_hash char(64) NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT now(), PRIMARY KEY (tenant_id,id),
  UNIQUE (tenant_id,sale_id,version), FOREIGN KEY (tenant_id,sale_id) REFERENCES sales(tenant_id,id) ON DELETE RESTRICT,
  CHECK (content_hash ~ '^[0-9a-f]{64}$'), CHECK (version > 0)
);

CREATE TABLE external_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, system varchar(80) NOT NULL,
  entity_type varchar(80) NOT NULL, internal_id uuid NOT NULL, external_id varchar(200) NOT NULL,
  version integer NOT NULL DEFAULT 1, status varchar(40) NOT NULL DEFAULT 'ACTIVE', metadata jsonb NOT NULL DEFAULT '{}',
  synchronized_at timestamptz(6), created_at timestamptz(6) NOT NULL DEFAULT now(), updated_at timestamptz(6) NOT NULL,
  PRIMARY KEY (tenant_id,id), UNIQUE (tenant_id,system,entity_type,internal_id),
  UNIQUE (tenant_id,system,entity_type,external_id), CHECK (version > 0)
);

CREATE FUNCTION app.prevent_sales_delete() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Sales records are append-preserving and cannot be deleted'; END $$;
REVOKE ALL ON FUNCTION app.prevent_sales_delete() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.prevent_sales_delete() TO nexo_migration,nexo_runtime;

DO $$ DECLARE table_name text; BEGIN
  FOREACH table_name IN ARRAY ARRAY['sales','sale_items','sale_payments','sales_idempotency','sales_policies','sales_folio_sequences','sales_outbox','sale_receipts','external_mappings'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',table_name);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',table_name);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL TO nexo_migration,nexo_runtime,nexo_readonly USING (tenant_id=app.current_tenant_id()) WITH CHECK (tenant_id=app.current_tenant_id())',table_name);
    EXECUTE format('CREATE POLICY migration_access ON %I FOR ALL TO nexo_migration USING (true) WITH CHECK (true)',table_name);
    EXECUTE format('CREATE POLICY runtime_access ON %I FOR ALL TO nexo_runtime USING (true) WITH CHECK (true)',table_name);
    EXECUTE format('CREATE POLICY readonly_access ON %I FOR SELECT TO nexo_readonly USING (true)',table_name);
    EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON %I TO nexo_runtime',table_name);
    EXECUTE format('GRANT SELECT ON %I TO nexo_readonly',table_name);
  END LOOP;
END $$;

CREATE POLICY sales_outbox_worker_select ON sales_outbox FOR SELECT TO nexo_worker USING (true);
CREATE POLICY sales_outbox_worker_update ON sales_outbox FOR UPDATE TO nexo_worker USING (true) WITH CHECK (true);
GRANT SELECT,UPDATE ON sales_outbox TO nexo_worker;

CREATE TRIGGER sales_no_delete BEFORE DELETE ON sales FOR EACH ROW EXECUTE FUNCTION app.prevent_sales_delete();
CREATE TRIGGER sale_items_no_delete BEFORE DELETE ON sale_items FOR EACH ROW EXECUTE FUNCTION app.prevent_sales_delete();
CREATE TRIGGER sale_payments_no_delete BEFORE DELETE ON sale_payments FOR EACH ROW EXECUTE FUNCTION app.prevent_sales_delete();
CREATE TRIGGER sale_receipts_no_delete BEFORE DELETE ON sale_receipts FOR EACH ROW EXECUTE FUNCTION app.prevent_sales_delete();
