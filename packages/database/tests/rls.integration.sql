\set ON_ERROR_STOP on
BEGIN;

INSERT INTO organizations (id, slug, name, country_code, default_locale, default_currency, time_zone, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', 'rls-test-tenant-a', 'RLS Tenant A', 'MX', 'es-MX', 'MXN', 'America/Mazatlan', now()),
  ('91000000-0000-4000-8000-000000000002', 'rls-test-tenant-b', 'RLS Tenant B', 'MX', 'es-MX', 'MXN', 'America/Mexico_City', now());
INSERT INTO branches (tenant_id, id, code, name, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001', 'RLS-A-1', 'RLS Branch A', now()),
  ('91000000-0000-4000-8000-000000000002', '92000000-0000-4000-8000-000000000002', 'RLS-B-1', 'RLS Branch B', now());
INSERT INTO memberships (tenant_id, id, principal_id, role, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', '93000000-0000-4000-8000-000000000001', '94000000-0000-4000-8000-000000000001', 'OWNER', now()),
  ('91000000-0000-4000-8000-000000000002', '93000000-0000-4000-8000-000000000002', '94000000-0000-4000-8000-000000000002', 'OWNER', now());
INSERT INTO membership_authorization_roles (tenant_id, membership_id, role_key, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', '93000000-0000-4000-8000-000000000001', 'OWNER', now()),
  ('91000000-0000-4000-8000-000000000002', '93000000-0000-4000-8000-000000000002', 'OWNER', now());
INSERT INTO organization_features (tenant_id, feature_key, enabled, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', 'POS', true, now()),
  ('91000000-0000-4000-8000-000000000002', 'POS', true, now());
INSERT INTO organization_onboarding (tenant_id, answers, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', '{"tenant":"a"}', now()),
  ('91000000-0000-4000-8000-000000000002', '{"tenant":"b"}', now());
INSERT INTO products (tenant_id, id, name, type, created_by, updated_by, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', '95000000-0000-4000-8000-000000000001', 'Product A', 'PHYSICAL', '94000000-0000-4000-8000-000000000001', '94000000-0000-4000-8000-000000000001', now()),
  ('91000000-0000-4000-8000-000000000002', '95000000-0000-4000-8000-000000000002', 'Product B', 'SERVICE', '94000000-0000-4000-8000-000000000002', '94000000-0000-4000-8000-000000000002', now());
INSERT INTO product_variants (tenant_id, id, product_id, name, option_key, is_default, created_by, updated_by, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', '96000000-0000-4000-8000-000000000001', '95000000-0000-4000-8000-000000000001', 'Default A', 'default', true, '94000000-0000-4000-8000-000000000001', '94000000-0000-4000-8000-000000000001', now()),
  ('91000000-0000-4000-8000-000000000002', '96000000-0000-4000-8000-000000000002', '95000000-0000-4000-8000-000000000002', 'Default B', 'default', true, '94000000-0000-4000-8000-000000000002', '94000000-0000-4000-8000-000000000002', now());
INSERT INTO inventory_locations (tenant_id, id, branch_id, type, code, name, updated_at)
VALUES
  ('91000000-0000-4000-8000-000000000001', '97000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001', 'WAREHOUSE', 'RLS-WA', 'Warehouse A', now()),
  ('91000000-0000-4000-8000-000000000002', '97000000-0000-4000-8000-000000000002', '92000000-0000-4000-8000-000000000002', 'WAREHOUSE', 'RLS-WB', 'Warehouse B', now());
INSERT INTO inventory_movements (tenant_id, id, variant_id, location_id, type, state, quantity, correlation_id, idempotency_key, reason, occurred_at, actor_user_id)
VALUES
  ('91000000-0000-4000-8000-000000000001', '98000000-0000-4000-8000-000000000001', '96000000-0000-4000-8000-000000000001', '97000000-0000-4000-8000-000000000001', 'PURCHASE', 'ON_HAND', 10, '99000000-0000-4000-8000-000000000001', 'rls-a-receipt', 'RLS fixture', now(), '94000000-0000-4000-8000-000000000001'),
  ('91000000-0000-4000-8000-000000000002', '98000000-0000-4000-8000-000000000002', '96000000-0000-4000-8000-000000000002', '97000000-0000-4000-8000-000000000002', 'PURCHASE', 'ON_HAND', 20, '99000000-0000-4000-8000-000000000002', 'rls-b-receipt', 'RLS fixture', now(), '94000000-0000-4000-8000-000000000002');
INSERT INTO inventory_counts (tenant_id,id,variant_id,location_id,logical_balances,counted_quantity,difference,reason,idempotency_key,movement_id,actor_user_id)
VALUES
  ('91000000-0000-4000-8000-000000000001','98100000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000001','{"onHand":"10"}',10,0,'RLS count A','rls-count-a',NULL,'94000000-0000-4000-8000-000000000001'),
  ('91000000-0000-4000-8000-000000000002','98100000-0000-4000-8000-000000000002','96000000-0000-4000-8000-000000000002','97000000-0000-4000-8000-000000000002','{"onHand":"20"}',20,0,'RLS count B','rls-count-b',NULL,'94000000-0000-4000-8000-000000000002');
INSERT INTO sales (tenant_id,id,organization_id,branch_id,seller_user_id,membership_id,currency,business_date,status,channel,source,idempotency_key,correlation_id,updated_at)
VALUES
 ('91000000-0000-4000-8000-000000000001','9a000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000001','MXN',current_date,'OPEN','API','RLS','rls-sale-a','9b000000-0000-4000-8000-000000000001',now()),
 ('91000000-0000-4000-8000-000000000002','9a000000-0000-4000-8000-000000000002','91000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000002','94000000-0000-4000-8000-000000000002','93000000-0000-4000-8000-000000000002','MXN',current_date,'OPEN','API','RLS','rls-sale-b','9b000000-0000-4000-8000-000000000002',now());
INSERT INTO cash_registers (tenant_id,organization_id,branch_id,id,name,code,default_currency)
VALUES
 ('91000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000001','9c000000-0000-4000-8000-000000000001','Register A','RLS-A','MXN'),
 ('91000000-0000-4000-8000-000000000002','91000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000002','9c000000-0000-4000-8000-000000000002','Register B','RLS-B','MXN');
INSERT INTO cash_sessions (tenant_id,organization_id,branch_id,id,register_id,opened_by_user_id,opened_by_membership_id,assigned_cashier_id,currency,business_date,status,opening_float_minor,expected_amount_minor,opened_at,correlation_id)
VALUES
 ('91000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000001','9d000000-0000-4000-8000-000000000001','9c000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000001','94000000-0000-4000-8000-000000000001','MXN',current_date,'OPEN',10000,10000,now(),'9e000000-0000-4000-8000-000000000001'),
 ('91000000-0000-4000-8000-000000000002','91000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000002','9d000000-0000-4000-8000-000000000002','9c000000-0000-4000-8000-000000000002','94000000-0000-4000-8000-000000000002','93000000-0000-4000-8000-000000000002','94000000-0000-4000-8000-000000000002','MXN',current_date,'OPEN',20000,20000,now(),'9e000000-0000-4000-8000-000000000002');
SET ROLE nexo_runtime;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS no_context_default_deny FROM organizations;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS authorization_no_context_default_deny FROM membership_authorization_roles;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS features_no_context_default_deny FROM organization_features;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS control_plane_no_context_default_deny FROM organization_onboarding;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS invitations_no_context_default_deny FROM organization_invitations;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS events_no_context_default_deny FROM control_plane_events;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS products_no_context_default_deny FROM products;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS inventory_no_context_default_deny FROM inventory_movements;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS inventory_counts_no_context_default_deny FROM inventory_counts;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS sales_no_context_default_deny FROM sales;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS cash_no_context_default_deny FROM cash_sessions;
SELECT set_config('app.current_tenant_id', '91000000-0000-4000-8000-000000000001', true);
SELECT 1 / CASE WHEN count(*) = 1 THEN 1 ELSE 0 END AS tenant_a_reads_only_a FROM organizations;
SELECT 1 / CASE WHEN bool_and(id = '91000000-0000-4000-8000-000000000001') THEN 1 ELSE 0 END AS tenant_a_identity FROM organizations;
SELECT 1 / CASE WHEN count(*) = 1 THEN 1 ELSE 0 END AS tenant_a_branch_scope FROM branches;
SELECT 1 / CASE WHEN count(*) = 1 THEN 1 ELSE 0 END AS tenant_a_role_assignment FROM membership_authorization_roles;
SELECT 1 / CASE WHEN count(*) = 1 THEN 1 ELSE 0 END AS tenant_a_feature_state FROM organization_features;
SELECT 1 / CASE WHEN count(*) = 1 THEN 1 ELSE 0 END AS tenant_a_onboarding_state FROM organization_onboarding;
SELECT 1 / CASE WHEN count(*) = 1 AND bool_and(name = 'Product A') THEN 1 ELSE 0 END AS tenant_a_product_scope FROM products;
SELECT 1 / CASE WHEN count(*) = 1 AND bool_and(quantity = 10) THEN 1 ELSE 0 END AS tenant_a_inventory_scope FROM inventory_movements;
SELECT 1 / CASE WHEN count(*) = 1 AND bool_and(counted_quantity = 10) THEN 1 ELSE 0 END AS tenant_a_inventory_count_scope FROM inventory_counts;
SELECT 1 / CASE WHEN count(*) = 1 AND bool_and(id = '9a000000-0000-4000-8000-000000000001') THEN 1 ELSE 0 END AS tenant_a_sales_scope FROM sales;
SELECT 1 / CASE WHEN count(*) = 1 AND bool_and(id = '9d000000-0000-4000-8000-000000000001') THEN 1 ELSE 0 END AS tenant_a_cash_scope FROM cash_sessions;
SELECT 1 / CASE WHEN NOT has_table_privilege('nexo_runtime','cash_ledger_entries','UPDATE') AND NOT has_table_privilege('nexo_runtime','cash_ledger_entries','DELETE') THEN 1 ELSE 0 END AS cash_ledger_runtime_immutable;

SELECT set_config('app.current_tenant_id', '91000000-0000-4000-8000-000000000002', true);
WITH changed AS (
  UPDATE organizations SET name = 'cross-tenant-write' WHERE id = '91000000-0000-4000-8000-000000000001' RETURNING id
)
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS tenant_b_cannot_update_a FROM changed;
WITH changed AS (
  UPDATE organization_features SET enabled = false
  WHERE tenant_id = '91000000-0000-4000-8000-000000000001' AND feature_key = 'POS'
  RETURNING tenant_id
)
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS tenant_b_cannot_update_a_feature FROM changed;
WITH changed AS (
  UPDATE organization_onboarding SET current_step = 2
  WHERE tenant_id = '91000000-0000-4000-8000-000000000001'
  RETURNING tenant_id
)
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS tenant_b_cannot_update_a_onboarding FROM changed;
WITH changed AS (
  UPDATE products SET name = 'cross-tenant-product'
  WHERE tenant_id = '91000000-0000-4000-8000-000000000001'
  RETURNING tenant_id
)
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS tenant_b_cannot_update_a_product FROM changed;
WITH changed AS (
  UPDATE inventory_locations SET name = 'cross-tenant-location'
  WHERE tenant_id = '91000000-0000-4000-8000-000000000001'
  RETURNING tenant_id
)
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS tenant_b_cannot_update_a_inventory FROM changed;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS tenant_b_cannot_read_a_inventory_count
FROM inventory_counts WHERE tenant_id = '91000000-0000-4000-8000-000000000001';
SELECT 1 / CASE WHEN NOT has_table_privilege('nexo_runtime','inventory_counts','UPDATE') AND NOT has_table_privilege('nexo_runtime','inventory_counts','DELETE') THEN 1 ELSE 0 END AS inventory_count_runtime_immutable;
WITH changed AS (UPDATE sales SET notes='cross-tenant-sale' WHERE tenant_id='91000000-0000-4000-8000-000000000001' RETURNING tenant_id)
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS tenant_b_cannot_update_a_sale FROM changed;
WITH changed AS (UPDATE cash_sessions SET notes='cross-tenant-cash' WHERE tenant_id='91000000-0000-4000-8000-000000000001' RETURNING tenant_id)
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS tenant_b_cannot_update_a_cash FROM changed;
RESET ROLE;
SELECT 1 / CASE WHEN count(*) = 60 AND bool_and(relrowsecurity AND relforcerowsecurity) THEN 1 ELSE 0 END AS rls_forced
FROM pg_class WHERE relname IN ('organizations', 'branches', 'memberships', 'membership_branch_scopes', 'membership_authorization_roles', 'organization_features', 'organization_onboarding', 'organization_invitations', 'organization_invitation_branches', 'control_plane_events', 'products', 'product_variants', 'product_categories', 'product_barcodes', 'product_prices', 'product_media', 'product_outbox', 'product_events', 'inventory_locations', 'inventory_policies', 'inventory_movements', 'inventory_reservations', 'inventory_snapshots', 'inventory_counts', 'inventory_cost_layers', 'inventory_transfers', 'inventory_outbox', 'inventory_events','sales','sale_items','sale_payments','sales_idempotency','sales_policies','sales_folio_sequences','sales_outbox','sale_receipts','external_mappings','payment_intents','payment_attempts','refund_intents','refund_lines','sales_events','cash_registers','cash_drawers','cash_policies','cash_sessions','cash_ledger_entries','cash_counts','cash_count_denominations','cash_reconciliations','cash_variances','cash_approvals','cash_deposits','cash_transfers','cash_receipts','cash_idempotency_records','cash_events','cash_outbox','cash_handoffs','cash_public_event_deliveries');
SELECT 1 / CASE WHEN count(*) >= 171 THEN 1 ELSE 0 END AS policies_present
FROM pg_policies WHERE tablename LIKE 'cash_%' OR tablename IN ('organizations', 'branches', 'memberships', 'membership_branch_scopes', 'membership_authorization_roles', 'organization_features', 'organization_onboarding', 'organization_invitations', 'organization_invitation_branches', 'control_plane_events', 'products', 'product_variants', 'product_categories', 'product_barcodes', 'product_prices', 'product_media', 'product_outbox', 'product_events', 'inventory_locations', 'inventory_policies', 'inventory_movements', 'inventory_reservations', 'inventory_snapshots', 'inventory_counts', 'inventory_cost_layers','inventory_transfers','inventory_outbox','inventory_events','sales','sale_items','sale_payments','sales_idempotency','sales_policies','sales_folio_sequences','sales_outbox','sale_receipts','external_mappings','payment_intents','payment_attempts','refund_intents','refund_lines','sales_events');

ROLLBACK;
