\set ON_ERROR_STOP on
BEGIN;
SET ROLE nexo_runtime;

SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS analytics_sales_default_deny
FROM sales;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS analytics_payments_default_deny
FROM sale_payments;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS analytics_refunds_default_deny
FROM refund_intents;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS analytics_inventory_default_deny
FROM inventory_movements;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS analytics_cost_default_deny
FROM inventory_cost_layers;

SELECT set_config('app.current_tenant_id','10000000-0000-4000-8000-000000000001',true);
SELECT 1 / CASE WHEN count(*) > 0 AND bool_and(tenant_id='10000000-0000-4000-8000-000000000001'::uuid)
  THEN 1 ELSE 0 END AS analytics_tenant_a_sales FROM sales;
SELECT 1 / CASE WHEN count(*) > 0 AND bool_and(tenant_id='10000000-0000-4000-8000-000000000001'::uuid)
  THEN 1 ELSE 0 END AS analytics_tenant_a_inventory FROM inventory_movements;

SELECT set_config('app.current_tenant_id','10000000-0000-4000-8000-000000000002',true);
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS analytics_tenant_b_cannot_filter_a
FROM sales WHERE tenant_id='10000000-0000-4000-8000-000000000001'::uuid;
SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS analytics_join_cannot_leak_a
FROM sales s JOIN sale_items i ON i.tenant_id=s.tenant_id AND i.sale_id=s.id
WHERE s.tenant_id='10000000-0000-4000-8000-000000000001'::uuid;

RESET ROLE;
SELECT 1 / CASE WHEN count(*)=7 AND bool_and(relrowsecurity AND relforcerowsecurity)
  THEN 1 ELSE 0 END AS analytics_sources_force_rls
FROM pg_class WHERE relname IN (
  'sales','sale_items','sale_payments','refund_intents','refund_lines',
  'inventory_movements','inventory_cost_layers'
);
ROLLBACK;
