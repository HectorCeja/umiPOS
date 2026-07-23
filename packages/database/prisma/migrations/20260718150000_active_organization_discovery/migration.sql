CREATE OR REPLACE FUNCTION app.active_organizations_for_current_user()
RETURNS TABLE(id uuid, name text, status text, role text, access_scope text, updated_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public, app
AS $$
  SELECT o.id, o.name, o.status::text, m.role::text, m.access_scope::text, o.updated_at
  FROM public.memberships m
  JOIN public.organizations o ON o.id = m.tenant_id
  WHERE m.principal_id = app.current_user_id()
    AND m.status = 'ACTIVE'
    AND o.status = 'ACTIVE'
  ORDER BY o.updated_at DESC, o.name ASC;
$$;

REVOKE ALL ON FUNCTION app.active_organizations_for_current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.active_organizations_for_current_user() TO nexo_runtime, nexo_readonly;
