ALTER FUNCTION app.post_approved_cash_refund(uuid,uuid,uuid)
  RENAME TO post_approved_cash_refund_allocation_v1;

CREATE FUNCTION app.post_approved_cash_refund(
  p_tenant_id uuid,
  p_refund_id uuid,
  p_event_id uuid
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,app
AS $$
DECLARE organization_mismatch boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM refund_intents r
    JOIN sales s ON s.tenant_id=r.tenant_id AND s.id=r.sale_id
    JOIN cash_sessions cs ON cs.tenant_id=s.tenant_id
      AND cs.branch_id=s.branch_id
      AND cs.currency=s.currency
      AND cs.assigned_cashier_id=r.actor_user_id
      AND cs.status IN ('OPEN','REOPENED')
    WHERE r.tenant_id=p_tenant_id AND r.id=p_refund_id
      AND cs.organization_id<>s.organization_id
  ) INTO organization_mismatch;
  IF organization_mismatch THEN RAISE EXCEPTION 'CROSS_ORGANIZATION_ACCESS_DENIED'; END IF;
  RETURN app.post_approved_cash_refund_allocation_v1(p_tenant_id,p_refund_id,p_event_id);
END
$$;

REVOKE ALL ON FUNCTION app.post_approved_cash_refund(uuid,uuid,uuid) FROM PUBLIC;
