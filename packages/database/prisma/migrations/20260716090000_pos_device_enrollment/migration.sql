CREATE TABLE pos_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL,
  branch_id uuid, name varchar(160) NOT NULL, platform varchar(40) NOT NULL,
  app_version varchar(40) NOT NULL, fingerprint_hash char(64) NOT NULL,
  status varchar(24) NOT NULL DEFAULT 'ACTIVE', capabilities jsonb NOT NULL DEFAULT '{}',
  enrolled_at timestamptz(6) NOT NULL DEFAULT now(), last_seen_at timestamptz(6),
  revoked_at timestamptz(6), revoked_by uuid, revocation_reason varchar(500),
  version integer NOT NULL DEFAULT 1, created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT pos_devices_pkey PRIMARY KEY (tenant_id,id),
  CONSTRAINT pos_devices_tenant_fk FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE RESTRICT,
  CONSTRAINT pos_devices_branch_fk FOREIGN KEY (tenant_id,branch_id) REFERENCES branches(tenant_id,id) ON DELETE RESTRICT,
  CONSTRAINT pos_devices_status_check CHECK (status IN ('PENDING','ACTIVE','DISABLED','REVOKED','OUTDATED','MAINTENANCE')),
  CONSTRAINT pos_devices_version_check CHECK (version > 0),
  CONSTRAINT pos_devices_capabilities_object CHECK (jsonb_typeof(capabilities)='object'),
  CONSTRAINT pos_devices_fingerprint_unique UNIQUE (tenant_id,fingerprint_hash)
);
CREATE INDEX pos_devices_tenant_branch_status_idx ON pos_devices(tenant_id,branch_id,status);

CREATE TABLE pos_device_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, branch_id uuid,
  token_hash char(64) NOT NULL, idempotency_key varchar(160) NOT NULL,
  status varchar(24) NOT NULL DEFAULT 'PENDING', capabilities jsonb NOT NULL DEFAULT '{}',
  created_by uuid NOT NULL, expires_at timestamptz(6) NOT NULL, consumed_at timestamptz(6),
  revoked_at timestamptz(6), enrolled_device_id uuid, request_fingerprint char(64),
  created_at timestamptz(6) NOT NULL DEFAULT now(), updated_at timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT pos_device_enrollments_pkey PRIMARY KEY (tenant_id,id),
  CONSTRAINT pos_device_enrollments_tenant_fk FOREIGN KEY (tenant_id) REFERENCES organizations(id) ON DELETE RESTRICT,
  CONSTRAINT pos_device_enrollments_branch_fk FOREIGN KEY (tenant_id,branch_id) REFERENCES branches(tenant_id,id) ON DELETE RESTRICT,
  CONSTRAINT pos_device_enrollments_status_check CHECK (status IN ('PENDING','CONSUMED','REVOKED','EXPIRED')),
  CONSTRAINT pos_device_enrollments_token_unique UNIQUE (token_hash),
  CONSTRAINT pos_device_enrollments_idempotency_unique UNIQUE (tenant_id,idempotency_key)
);
CREATE INDEX pos_device_enrollments_status_expiry_idx ON pos_device_enrollments(tenant_id,status,expires_at);

CREATE TABLE pos_device_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL, device_id uuid NOT NULL,
  secret_hash char(64) NOT NULL, status varchar(24) NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz(6) NOT NULL DEFAULT now(), last_used_at timestamptz(6),
  rotated_at timestamptz(6), revoked_at timestamptz(6), replaced_by_id uuid, rotation_key varchar(160),
  CONSTRAINT pos_device_credentials_pkey PRIMARY KEY (tenant_id,id),
  CONSTRAINT pos_device_credentials_device_fk FOREIGN KEY (tenant_id,device_id) REFERENCES pos_devices(tenant_id,id) ON DELETE CASCADE,
  CONSTRAINT pos_device_credentials_status_check CHECK (status IN ('ACTIVE','ROTATED','REVOKED')),
  CONSTRAINT pos_device_credentials_secret_unique UNIQUE (secret_hash),
  CONSTRAINT pos_device_credentials_rotation_unique UNIQUE (tenant_id,rotation_key)
);
CREATE INDEX pos_device_credentials_device_status_idx ON pos_device_credentials(tenant_id,device_id,status);

CREATE TABLE pos_device_outbox (
  tenant_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), aggregate_id uuid NOT NULL,
  aggregate_version integer NOT NULL, event_type varchar(100) NOT NULL, payload jsonb NOT NULL,
  occurred_at timestamptz(6) NOT NULL DEFAULT now(), published_at timestamptz(6), attempts integer NOT NULL DEFAULT 0,
  last_error varchar(1000), CONSTRAINT pos_device_outbox_pkey PRIMARY KEY (tenant_id,id),
  CONSTRAINT pos_device_outbox_event_unique UNIQUE (tenant_id,aggregate_id,aggregate_version,event_type)
);
CREATE INDEX pos_device_outbox_publish_idx ON pos_device_outbox(published_at,occurred_at);

DO $pos_device_rls$ DECLARE n text; BEGIN
  FOREACH n IN ARRAY ARRAY['pos_devices','pos_device_enrollments','pos_device_credentials','pos_device_outbox'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',n);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',n);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I AS RESTRICTIVE FOR ALL TO nexo_migration,nexo_runtime,nexo_readonly USING (tenant_id=app.current_tenant_id()) WITH CHECK (tenant_id=app.current_tenant_id())',n);
    EXECUTE format('CREATE POLICY runtime_access ON %I FOR ALL TO nexo_runtime USING (tenant_id=app.current_tenant_id()) WITH CHECK (tenant_id=app.current_tenant_id())',n);
    EXECUTE format('CREATE POLICY readonly_access ON %I FOR SELECT TO nexo_readonly USING (tenant_id=app.current_tenant_id())',n);
  END LOOP;
END $pos_device_rls$;

GRANT SELECT,INSERT,UPDATE ON pos_devices,pos_device_enrollments,pos_device_credentials TO nexo_runtime;
GRANT SELECT,INSERT ON pos_device_outbox TO nexo_runtime;
GRANT SELECT ON pos_devices,pos_device_enrollments,pos_device_credentials,pos_device_outbox TO nexo_readonly;
