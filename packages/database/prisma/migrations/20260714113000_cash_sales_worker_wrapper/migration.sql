CREATE OR REPLACE FUNCTION app.post_completed_sale_cash_worker(p_tenant_id uuid,p_sale_id uuid,p_event_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public, app
AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id',p_tenant_id::text,true);
  RETURN app.post_completed_sale_cash(p_tenant_id,p_sale_id,p_event_id);
END;
$$;
REVOKE EXECUTE ON FUNCTION app.post_completed_sale_cash(uuid,uuid,uuid) FROM nexo_worker;
REVOKE ALL ON FUNCTION app.post_completed_sale_cash_worker(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.post_completed_sale_cash_worker(uuid,uuid,uuid) TO nexo_worker;
