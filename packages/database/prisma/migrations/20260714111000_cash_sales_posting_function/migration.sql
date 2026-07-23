CREATE OR REPLACE FUNCTION app.post_completed_sale_cash(p_tenant_id uuid,p_sale_id uuid,p_event_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, app
AS $$
DECLARE
  sale_row record;
  payment_row record;
  session_row record;
  entry_id uuid;
  posted integer := 0;
BEGIN
  SELECT tenant_id,organization_id,branch_id,seller_user_id,currency,status,business_date,correlation_id
    INTO STRICT sale_row FROM public.sales
   WHERE tenant_id=p_tenant_id AND id=p_sale_id AND status IN ('COMPLETED','PARTIALLY_REFUNDED','REFUNDED');

  FOR payment_row IN
    SELECT id,amount_minor FROM public.sale_payments
     WHERE tenant_id=p_tenant_id AND sale_id=p_sale_id AND method='CASH' AND status='CAPTURED'
     ORDER BY id
  LOOP
    IF EXISTS(SELECT 1 FROM public.cash_ledger_entries WHERE tenant_id=p_tenant_id AND source_type='SALE_PAYMENT' AND source_id=payment_row.id::text) THEN
      CONTINUE;
    END IF;
    SELECT * INTO session_row FROM public.cash_sessions
     WHERE tenant_id=p_tenant_id AND organization_id=sale_row.organization_id
       AND branch_id=sale_row.branch_id AND assigned_cashier_id=sale_row.seller_user_id
       AND currency=sale_row.currency AND status IN ('OPEN','REOPENED')
     ORDER BY opened_at DESC LIMIT 1 FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'CASH_SESSION_NOT_OPEN'; END IF;
    entry_id := gen_random_uuid();
    INSERT INTO public.cash_ledger_entries(tenant_id,organization_id,branch_id,id,session_id,register_id,drawer_id,currency,direction,movement_type,amount_minor,source_type,source_id,sale_id,payment_allocation_id,reason,actor_id,membership_id,occurred_at,business_date,idempotency_key,correlation_id,causation_id)
    VALUES(p_tenant_id,sale_row.organization_id,sale_row.branch_id,entry_id,session_row.id,session_row.register_id,session_row.drawer_id,sale_row.currency,'IN','CASH_SALE',payment_row.amount_minor,'SALE_PAYMENT',payment_row.id::text,p_sale_id,payment_row.id,'Authoritative Sales cash allocation',sale_row.seller_user_id,session_row.opened_by_membership_id,now(),sale_row.business_date,'sale-payment:'||payment_row.id,sale_row.correlation_id,p_event_id);
    UPDATE public.cash_sessions SET expected_amount_minor=expected_amount_minor+payment_row.amount_minor,version=version+1,updated_at=now() WHERE tenant_id=p_tenant_id AND id=session_row.id;
    INSERT INTO public.cash_events(tenant_id,organization_id,branch_id,id,event_type,event_version,aggregate_id,aggregate_version,payload,occurred_at,correlation_id,actor_id)
    VALUES(p_tenant_id,sale_row.organization_id,sale_row.branch_id,gen_random_uuid(),'CashSalePosted',1,session_row.id,session_row.version+1,jsonb_build_object('entryId',entry_id,'saleId',p_sale_id,'paymentAllocationId',payment_row.id,'amountMinor',payment_row.amount_minor::text),now(),sale_row.correlation_id,sale_row.seller_user_id);
    INSERT INTO public.cash_outbox(tenant_id,organization_id,branch_id,id,event_type,event_version,payload,occurred_at)
    VALUES(p_tenant_id,sale_row.organization_id,sale_row.branch_id,gen_random_uuid(),'CashSalePosted',1,jsonb_build_object('entryId',entry_id,'saleId',p_sale_id,'paymentAllocationId',payment_row.id,'amountMinor',payment_row.amount_minor::text),now());
    posted := posted+1;
  END LOOP;
  RETURN posted;
EXCEPTION WHEN no_data_found THEN
  RAISE EXCEPTION 'SALE_NOT_FOUND_OR_NOT_COMPLETED';
END;
$$;
REVOKE ALL ON FUNCTION app.post_completed_sale_cash(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.post_completed_sale_cash(uuid,uuid,uuid) TO nexo_worker;
