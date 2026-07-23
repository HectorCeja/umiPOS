\set ON_ERROR_STOP on
\timing on
BEGIN;
SET LOCAL synchronous_commit=off;

INSERT INTO sales(
  tenant_id,id,organization_id,branch_id,seller_user_id,membership_id,currency,
  business_date,status,channel,source,idempotency_key,correlation_id,completed_at,updated_at
)
SELECT base.tenant_id,md5('analytics-sale-'||g)::uuid,base.organization_id,base.branch_id,
  base.seller_user_id,base.membership_id,'MXN',DATE '2026-01-01'+((g%180)::int),
  'COMPLETED','API','ANALYTICS_PERFORMANCE','analytics-sale-'||g,
  md5('analytics-correlation-'||g)::uuid,
  TIMESTAMPTZ '2026-01-01 00:00:00+00'+(g||' minutes')::interval,now()
FROM generate_series(1,100000) g
CROSS JOIN LATERAL (
  SELECT tenant_id,organization_id,branch_id,seller_user_id,membership_id
  FROM sales WHERE tenant_id='10000000-0000-4000-8000-000000000001'::uuid LIMIT 1
) base;

INSERT INTO sale_items(
  tenant_id,id,sale_id,product_variant_id,product_id,snapshot,quantity,
  unit_amount_minor,subtotal_minor,discount_minor,tax_minor,total_minor,updated_at
)
SELECT '10000000-0000-4000-8000-000000000001'::uuid,
  md5('analytics-item-'||g)::uuid,md5('analytics-sale-'||g)::uuid,v.id,v.product_id,
  jsonb_build_object('productName','Analytics fixture','variantName','Default','sku','AN-'||g),
  1,100,100,0,0,100,now()
FROM generate_series(1,100000) g
CROSS JOIN LATERAL (
  SELECT id,product_id FROM product_variants
  WHERE tenant_id='10000000-0000-4000-8000-000000000001'::uuid LIMIT 1
) v;

INSERT INTO inventory_movements(
  tenant_id,id,variant_id,location_id,type,state,quantity,correlation_id,
  idempotency_key,reason,occurred_at,actor_user_id
)
SELECT '10000000-0000-4000-8000-000000000001'::uuid,
  md5('analytics-movement-'||g)::uuid,base.variant_id,base.location_id,
  'PURCHASE','ON_HAND',1,md5('analytics-movement-correlation-'||g)::uuid,
  'analytics-movement-'||g,'Analytics performance fixture',
  TIMESTAMPTZ '2026-01-01 00:00:00+00'+(g||' seconds')::interval,base.actor_user_id
FROM generate_series(1,1000000) g
CROSS JOIN LATERAL (
  SELECT variant_id,location_id,actor_user_id FROM inventory_movements
  WHERE tenant_id='10000000-0000-4000-8000-000000000001'::uuid LIMIT 1
) base;

ANALYZE sales;
ANALYZE sale_items;
ANALYZE inventory_movements;

EXPLAIN (ANALYZE,BUFFERS,FORMAT TEXT)
SELECT s.id,SUM(i.total_minor)
FROM sales s JOIN sale_items i ON i.tenant_id=s.tenant_id AND i.sale_id=s.id
WHERE s.tenant_id='10000000-0000-4000-8000-000000000001'::uuid
  AND s.branch_id='20000000-0000-4000-8000-000000000001'::uuid
  AND s.status IN ('COMPLETED','PARTIALLY_REFUNDED','REFUNDED')
  AND s.completed_at >= TIMESTAMPTZ '2026-01-01' AND s.completed_at < TIMESTAMPTZ '2027-01-01'
GROUP BY s.id;

EXPLAIN (ANALYZE,BUFFERS,FORMAT TEXT)
SELECT variant_id,location_id,SUM(quantity) FILTER(WHERE state='ON_HAND')
FROM inventory_movements
WHERE tenant_id='10000000-0000-4000-8000-000000000001'::uuid
GROUP BY variant_id,location_id;

ROLLBACK;
