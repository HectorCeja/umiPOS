import {
  createTenantContext,
  type TenantContext,
  type VerifiedPrincipal,
} from './tenant-context.js';

export type ResolvedMembership = Readonly<{
  id: string;
  principalId: string;
  role: TenantContext['role'];
  accessScope: 'ALL_BRANCHES' | 'RESTRICTED';
  branchIds: readonly string[];
}>;

export interface MembershipResolverPort {
  findActiveMembership(
    tenantId: string,
    principalId: string,
  ): Promise<ResolvedMembership | undefined>;
}

/** Resolves an untrusted tenant candidate against a verified principal. */
export class TenantResolver {
  constructor(private readonly memberships: MembershipResolverPort) {}

  async resolve(candidateTenantId: string, principal: VerifiedPrincipal): Promise<TenantContext> {
    const membership = await this.memberships.findActiveMembership(
      candidateTenantId,
      principal.principalId,
    );
    if (membership === undefined || membership.principalId !== principal.principalId) {
      throw new TenantAccessDeniedError();
    }
    return createTenantContext({
      branchIds: membership.accessScope === 'ALL_BRANCHES' ? 'ALL_BRANCHES' : membership.branchIds,
      membershipId: membership.id,
      principalId: principal.principalId,
      role: membership.role,
      tenantId: candidateTenantId,
    });
  }
}

export class TenantAccessDeniedError extends Error {
  constructor() {
    super('Tenant access denied');
    this.name = 'TenantAccessDeniedError';
  }
}
