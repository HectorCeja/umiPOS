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
  payment_row record;
  session_row record;
  policy_configuration jsonb;
  allocation jsonb := '[]'::jsonb;
  remaining bigint;
  capacity bigint;
  applied bigint;
  cash_amount bigint;
  threshold bigint;
  entry_id uuid;
  posted integer := 0;
BEGIN
  SELECT * INTO STRICT refund_row
  FROM refund_intents
  WHERE tenant_id=p_tenant_id AND id=p_refund_id AND status IN ('APPROVED','COMPLETED');

  IF EXISTS (
    SELECT 1 FROM cash_ledger_entries
    WHERE tenant_id=p_tenant_id AND movement_type='CASH_REFUND'
      AND (source_id=p_refund_id::text OR source_id LIKE p_refund_id::text||':%')
  ) THEN RETURN 0; END IF;

  SELECT * INTO STRICT sale_row FROM sales
  WHERE tenant_id=p_tenant_id AND id=refund_row.sale_id;

  SELECT LEAST(
    refund_row.amount_minor,
    COALESCE(SUM(GREATEST(0,p.amount_minor-COALESCE(posted.amount_minor,0))),0)
  ) INTO cash_amount
  FROM sale_payments p
  LEFT JOIN (
    SELECT payment_allocation_id,SUM(amount_minor) amount_minor
    FROM cash_ledger_entries
    WHERE tenant_id=p_tenant_id AND movement_type='CASH_REFUND'
    GROUP BY payment_allocation_id
  ) posted ON posted.payment_allocation_id=p.id
  WHERE p.tenant_id=p_tenant_id AND p.sale_id=sale_row.id
    AND p.method='CASH' AND p.status='CAPTURED';
  IF cash_amount<=0 THEN RAISE EXCEPTION 'CASH_REFUND_PAYMENT_NOT_FOUND'; END IF;

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

  remaining:=cash_amount;
  FOR payment_row IN
    SELECT p.*,GREATEST(0,p.amount_minor-COALESCE(posted.amount_minor,0)) available_minor
    FROM sale_payments p
    LEFT JOIN (
      SELECT payment_allocation_id,SUM(amount_minor) amount_minor
      FROM cash_ledger_entries
      WHERE tenant_id=p_tenant_id AND movement_type='CASH_REFUND'
      GROUP BY payment_allocation_id
    ) posted ON posted.payment_allocation_id=p.id
    WHERE p.tenant_id=p_tenant_id AND p.sale_id=sale_row.id
      AND p.method='CASH' AND p.status='CAPTURED'
    ORDER BY p.created_at,p.id
  LOOP
    EXIT WHEN remaining=0;
    capacity:=payment_row.available_minor;
    CONTINUE WHEN capacity<=0;
    applied:=LEAST(remaining,capacity);
    entry_id:=gen_random_uuid();
    INSERT INTO cash_ledger_entries(
      tenant_id,organization_id,branch_id,id,session_id,register_id,drawer_id,currency,
      direction,movement_type,amount_minor,source_type,source_id,sale_id,payment_allocation_id,
      reference,reason,actor_id,membership_id,occurred_at,business_date,idempotency_key,
      correlation_id,causation_id,metadata
    ) VALUES (
      p_tenant_id,sale_row.organization_id,sale_row.branch_id,entry_id,session_row.id,
      session_row.register_id,session_row.drawer_id,sale_row.currency,'OUT','CASH_REFUND',applied,
      'CASH_REFUND',p_refund_id::text||':'||payment_row.id::text,sale_row.id,payment_row.id,
      p_refund_id::text,refund_row.reason,refund_row.actor_user_id,session_row.opened_by_membership_id,
      now(),sale_row.business_date,'cash-refund:'||p_refund_id||':'||payment_row.id,
      sale_row.correlation_id,p_event_id,
      jsonb_build_object('refundId',p_refund_id,'commercialRefundMinor',refund_row.amount_minor::text,
        'cashComponentMinor',applied::text,'paymentAllocationId',payment_row.id)
    );
    allocation:=allocation||jsonb_build_array(jsonb_build_object(
      'entryId',entry_id,'paymentAllocationId',payment_row.id,'amountMinor',applied::text));
    remaining:=remaining-applied;
    posted:=posted+1;
  END LOOP;

  IF remaining<>0 THEN RAISE EXCEPTION 'CASH_REFUND_ALLOCATION_INCONSISTENT'; END IF;
  UPDATE cash_sessions SET expected_amount_minor=expected_amount_minor-cash_amount,
    version=version+1,updated_at=now()
  WHERE tenant_id=p_tenant_id AND id=session_row.id;
  INSERT INTO cash_events(
    tenant_id,organization_id,branch_id,id,event_type,event_version,aggregate_id,
    aggregate_version,payload,occurred_at,correlation_id,actor_id
  ) VALUES (
    p_tenant_id,sale_row.organization_id,sale_row.branch_id,gen_random_uuid(),'CashRefundPosted',2,
    session_row.id,session_row.version+1,
    jsonb_build_object('saleId',sale_row.id,'refundId',p_refund_id,
      'amountMinor',cash_amount::text,'allocations',allocation),
    now(),sale_row.correlation_id,refund_row.actor_user_id
  );
  INSERT INTO cash_outbox(
    tenant_id,organization_id,branch_id,id,event_type,event_version,payload,occurred_at
  ) VALUES (
    p_tenant_id,sale_row.organization_id,sale_row.branch_id,gen_random_uuid(),
    'CashRefundPosted',2,jsonb_build_object('sessionId',session_row.id,'saleId',sale_row.id,
      'refundId',p_refund_id,'amountMinor',cash_amount::text,'allocations',allocation),now()
  );
  RETURN posted;
EXCEPTION WHEN no_data_found THEN
  RAISE EXCEPTION 'REFUND_NOT_FOUND_OR_NOT_APPROVED';
END
$$;

REVOKE ALL ON FUNCTION app.post_approved_cash_refund(uuid,uuid,uuid) FROM PUBLIC;
