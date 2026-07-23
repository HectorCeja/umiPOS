CREATE OR REPLACE FUNCTION app.refund_has_cash_component_worker(
  p_tenant_id uuid,
  p_refund_id uuid
) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path=pg_catalog,public,app
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM refund_intents r
    JOIN sale_payments p
      ON p.tenant_id=r.tenant_id AND p.sale_id=r.sale_id
    WHERE r.tenant_id=p_tenant_id
      AND r.id=p_refund_id
      AND p.method='CASH'
      AND p.status IN ('CAPTURED','REFUNDED')
  )
$$;

REVOKE ALL ON FUNCTION app.refund_has_cash_component_worker(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.refund_has_cash_component_worker(uuid,uuid) TO nexo_worker;
