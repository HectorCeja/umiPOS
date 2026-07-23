DROP POLICY IF EXISTS tenant_isolation ON memberships;
CREATE POLICY tenant_isolation ON memberships
  AS RESTRICTIVE
  FOR ALL
  TO nexo_migration, nexo_readonly, nexo_runtime
  USING (
    tenant_id = app.current_tenant_id()
    OR principal_id = app.current_user_id()
  )
  WITH CHECK (tenant_id = app.current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation ON organizations;
CREATE POLICY tenant_isolation ON organizations
  AS RESTRICTIVE
  FOR ALL
  TO nexo_migration, nexo_readonly, nexo_runtime
  USING (
    id = app.current_tenant_id()
    OR EXISTS (
      SELECT 1
      FROM memberships membership_access
      WHERE membership_access.tenant_id = organizations.id
        AND membership_access.principal_id = app.current_user_id()
        AND membership_access.status = 'ACTIVE'
    )
  )
  WITH CHECK (id = app.current_tenant_id());

