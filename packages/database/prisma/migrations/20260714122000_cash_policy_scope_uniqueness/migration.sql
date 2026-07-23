CREATE UNIQUE INDEX cash_policies_organization_scope_uidx
  ON cash_policies(tenant_id)
  WHERE branch_id IS NULL AND register_id IS NULL;

CREATE UNIQUE INDEX cash_policies_branch_scope_uidx
  ON cash_policies(tenant_id, branch_id)
  WHERE branch_id IS NOT NULL AND register_id IS NULL;

CREATE UNIQUE INDEX cash_policies_register_scope_uidx
  ON cash_policies(tenant_id, register_id)
  WHERE register_id IS NOT NULL;
