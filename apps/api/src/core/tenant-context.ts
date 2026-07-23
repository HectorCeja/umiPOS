export type VerifiedPrincipal = Readonly<{
  principalId: string;
  authenticationMethod: string;
}>;

export type TenantContext = Readonly<{
  tenantId: string;
  membershipId: string;
  principalId: string;
  role: 'OWNER' | 'ADMIN' | 'SUPERVISOR' | 'CASHIER' | 'EMPLOYEE' | 'ACCOUNTANT';
  branchIds: readonly string[] | 'ALL_BRANCHES';
}>;

export function createTenantContext(context: TenantContext): TenantContext {
  return Object.freeze({
    ...context,
    branchIds:
      context.branchIds === 'ALL_BRANCHES'
        ? context.branchIds
        : Object.freeze([...context.branchIds]),
  });
}
