-- The worker's least-privilege RLS policies call the same SECURITY INVOKER
-- tenant-context function as Runtime. Grant execution without granting any
-- table ownership or BYPASSRLS capability.
GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO nexo_worker;
