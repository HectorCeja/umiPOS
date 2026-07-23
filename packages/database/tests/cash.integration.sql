\set ON_ERROR_STOP on
BEGIN;

DO $$ DECLARE membership_id uuid; BEGIN
  SELECT id INTO membership_id FROM memberships WHERE tenant_id='10000000-0000-4000-8000-000000000001' AND principal_id='41000000-0000-4000-8000-000000000004';
  INSERT INTO cash_registers(tenant_id,organization_id,branch_id,id,name,code,default_currency)
  VALUES('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001','Integration Register','CASH-IT','MXN');
  INSERT INTO cash_sessions(tenant_id,organization_id,branch_id,id,register_id,opened_by_user_id,opened_by_membership_id,assigned_cashier_id,currency,business_date,status,opening_float_minor,expected_amount_minor,opened_at,correlation_id)
  VALUES('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000004',membership_id,'41000000-0000-4000-8000-000000000004','MXN',current_date,'OPEN',10000,10000,now(),'c3000000-0000-4000-8000-000000000001');
END $$;
INSERT INTO sales(tenant_id,id,organization_id,branch_id,seller_user_id,membership_id,currency,business_date,status,channel,source,idempotency_key,correlation_id,updated_at)
SELECT '10000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000004',id,'MXN',current_date,'COMPLETED','API','TEST','cash-it-sale','c5000000-0000-4000-8000-000000000001',now()
FROM memberships WHERE tenant_id='10000000-0000-4000-8000-000000000001' AND principal_id='41000000-0000-4000-8000-000000000004';
INSERT INTO sale_payments(tenant_id,id,sale_id,method,status,amount_minor,idempotency_key,updated_at)
VALUES('10000000-0000-4000-8000-000000000001','c6000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','CASH','CAPTURED',2500,'cash-it-payment',now());

SET ROLE nexo_worker;
SELECT 1 / CASE WHEN app.post_completed_sale_cash_worker('10000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','c7000000-0000-4000-8000-000000000001')=1 THEN 1 ELSE 0 END AS first_post;
SELECT 1 / CASE WHEN app.post_completed_sale_cash_worker('10000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','c7000000-0000-4000-8000-000000000001')=0 THEN 1 ELSE 0 END AS replay_deduplicated;
RESET ROLE;
SELECT 1 / CASE WHEN count(*)=1 AND min(amount_minor)=2500 THEN 1 ELSE 0 END AS one_authoritative_entry FROM cash_ledger_entries WHERE payment_allocation_id='c6000000-0000-4000-8000-000000000001';
SELECT 1 / CASE WHEN expected_amount_minor=12500 THEN 1 ELSE 0 END AS expected_projection_updated FROM cash_sessions WHERE id='c2000000-0000-4000-8000-000000000001';
SELECT 1 / CASE WHEN count(*)=1 THEN 1 ELSE 0 END AS cash_event_written FROM cash_events WHERE event_type='CashSalePosted' AND payload->>'paymentAllocationId'='c6000000-0000-4000-8000-000000000001';
SELECT 1 / CASE WHEN count(*)=1 THEN 1 ELSE 0 END AS cash_outbox_written FROM cash_outbox WHERE event_type='CashSalePosted' AND payload->>'paymentAllocationId'='c6000000-0000-4000-8000-000000000001';
ROLLBACK;
