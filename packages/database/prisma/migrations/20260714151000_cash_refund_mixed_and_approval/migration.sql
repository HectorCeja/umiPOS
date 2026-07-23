CREATE OR REPLACE FUNCTION app.post_approved_cash_refund(
  p_tenant_id uuid,
  p_refund_id uuid,
  p_event_id uuid
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,app
AS $$
DECLARE
  refund_row record;
  sale_row record;
  payment_id uuid;
  session_row record;
  policy_configuration jsonb;
  entry_id uuid;
  cash_paid bigint;
  cash_posted bigint;
  cash_amount bigint;
  threshold bigint;
BEGIN
  SELECT * INTO STRICT refund_row
  FROM refund_intents
  WHERE tenant_id=p_tenant_id AND id=p_refund_id AND status IN ('APPROVED','COMPLETED');

  IF EXISTS (
    SELECT 1 FROM cash_ledger_entries
    WHERE tenant_id=p_tenant_id AND source_type='CASH_REFUND' AND source_id=p_refund_id::text
  ) THEN RETURN 0; END IF;

  SELECT * INTO STRICT sale_row FROM sales
  WHERE tenant_id=p_tenant_id AND id=refund_row.sale_id;

  SELECT COALESCE(SUM(amount_minor),0),(array_agg(id ORDER BY created_at))[1]
    INTO cash_paid,payment_id
  FROM sale_payments
  WHERE tenant_id=p_tenant_id AND sale_id=sale_row.id AND method='CASH' AND status='CAPTURED';
  IF cash_paid=0 OR payment_id IS NULL THEN RAISE EXCEPTION 'CASH_REFUND_PAYMENT_NOT_FOUND'; END IF;

  SELECT COALESCE(SUM(amount_minor),0) INTO cash_posted
  FROM cash_ledger_entries
  WHERE tenant_id=p_tenant_id AND sale_id=sale_row.id AND movement_type='CASH_REFUND';
  cash_amount:=LEAST(refund_row.amount_minor,GREATEST(0,cash_paid-cash_posted));
  IF cash_amount<=0 THEN RETURN 0; END IF;

  SELECT configuration INTO policy_configuration
  FROM cash_policies
  WHERE tenant_id=p_tenant_id AND (branch_id IS NULL OR branch_id=sale_row.branch_id)
  ORDER BY (register_id IS NOT NULL) DESC,(branch_id IS NOT NULL) DESC LIMIT 1;
  policy_configuration:=COALESCE(policy_configuration,'{}'::jsonb);
  IF COALESCE((policy_configuration->>'cashRefundAllowed')::boolean,true)=false
    THEN RAISE EXCEPTION 'CASH_REFUND_NOT_ALLOWED'; END IF;
  threshold:=COALESCE((policy_configuration->>'supervisorThresholdMinor')::bigint,500);
  IF cash_amount>threshold AND NOT EXISTS (
    SELECT 1 FROM cash_approvals
    WHERE tenant_id=p_tenant_id AND branch_id=sale_row.branch_id
      AND action_type='CASH_REFUND' AND resource_id=p_refund_id AND status='APPROVED'
      AND expires_at>now()
  ) THEN RAISE EXCEPTION 'CASH_VARIANCE_APPROVAL_REQUIRED'; END IF;

  SELECT * INTO session_row FROM cash_sessions
  WHERE tenant_id=p_tenant_id AND branch_id=sale_row.branch_id AND currency=sale_row.currency
    AND assigned_cashier_id=refund_row.actor_user_id AND status IN ('OPEN','REOPENED')
  ORDER BY opened_at DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'CASH_SESSION_NOT_OPEN'; END IF;
  IF session_row.expected_amount_minor<cash_amount THEN
    RAISE EXCEPTION 'CASH_INSUFFICIENT_EXPECTED_AMOUNT';
  END IF;

  entry_id:=gen_random_uuid();
  INSERT INTO cash_ledger_entries(
    tenant_id,organization_id,branch_id,id,session_id,register_id,drawer_id,currency,
    direction,movement_type,amount_minor,source_type,source_id,sale_id,payment_allocation_id,
    reference,reason,actor_id,membership_id,occurred_at,business_date,idempotency_key,
    correlation_id,causation_id,metadata
  ) VALUES (
    p_tenant_id,sale_row.organization_id,sale_row.branch_id,entry_id,session_row.id,
    session_row.register_id,session_row.drawer_id,sale_row.currency,'OUT','CASH_REFUND',cash_amount,
    'CASH_REFUND',refund_row.id::text,sale_row.id,payment_id,refund_row.id::text,
    refund_row.reason,refund_row.actor_user_id,session_row.opened_by_membership_id,now(),
    sale_row.business_date,'cash-refund:'||refund_row.id,sale_row.correlation_id,p_event_id,
    jsonb_build_object('refundId',refund_row.id,'commercialRefundMinor',refund_row.amount_minor::text,
      'cashComponentMinor',cash_amount::text)
  );
  UPDATE cash_sessions SET expected_amount_minor=expected_amount_minor-cash_amount,
    version=version+1,updated_at=now()
  WHERE tenant_id=p_tenant_id AND id=session_row.id;
  INSERT INTO cash_events(
    tenant_id,organization_id,branch_id,id,event_type,event_version,aggregate_id,
    aggregate_version,payload,occurred_at,correlation_id,actor_id
  ) VALUES (
    p_tenant_id,sale_row.organization_id,sale_row.branch_id,gen_random_uuid(),'CashRefundPosted',1,
    session_row.id,session_row.version+1,
    jsonb_build_object('entryId',entry_id,'saleId',sale_row.id,'refundId',refund_row.id,
      'paymentAllocationId',payment_id,'amountMinor',cash_amount::text),
    now(),sale_row.correlation_id,refund_row.actor_user_id
  );
  INSERT INTO cash_outbox(
    tenant_id,organization_id,branch_id,id,event_type,event_version,payload,occurred_at
  ) VALUES (
    p_tenant_id,sale_row.organization_id,sale_row.branch_id,gen_random_uuid(),
    'CashRefundPosted',1,jsonb_build_object('entryId',entry_id,'saleId',sale_row.id,
      'refundId',refund_row.id,'paymentAllocationId',payment_id,'amountMinor',cash_amount::text),now()
  );
  RETURN 1;
EXCEPTION WHEN no_data_found THEN
  RAISE EXCEPTION 'REFUND_NOT_FOUND_OR_NOT_APPROVED';
END
$$;

REVOKE ALL ON FUNCTION app.post_approved_cash_refund(uuid,uuid,uuid) FROM PUBLIC;
