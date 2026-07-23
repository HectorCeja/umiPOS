CREATE OR REPLACE FUNCTION app.process_approved_refund_worker(
  p_tenant_id uuid,
  p_refund_id uuid,
  p_event_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,app
AS $$
DECLARE
  has_cash boolean;
  cash_posted integer := 0;
  completed integer := 0;
BEGIN
  PERFORM set_config('app.current_tenant_id',p_tenant_id::text,true);
  SELECT app.refund_has_cash_component_worker(p_tenant_id,p_refund_id) INTO has_cash;
  IF has_cash THEN
    cash_posted:=app.post_approved_cash_refund_worker(p_tenant_id,p_refund_id,p_event_id);
  END IF;
  completed:=app.complete_approved_refund_worker(p_tenant_id,p_refund_id,p_event_id);
  RETURN jsonb_build_object('cashPosted',cash_posted,'completed',completed);
END
$$;

REVOKE ALL ON FUNCTION app.process_approved_refund_worker(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.process_approved_refund_worker(uuid,uuid,uuid) TO nexo_worker;
