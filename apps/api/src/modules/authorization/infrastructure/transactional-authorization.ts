import {
  AuthorizationEngine,
  createAuthorizationContext,
  featureRegistry,
  permissionDefinition,
  roleRegistry,
  type AuthorizationResource,
  type AuthorizationScope,
  type FeatureKey,
  type RoleKey,
} from '@nexo/authorization';
import type { DatabaseTransaction } from '@nexo/database';
import { ForbiddenException } from '@nestjs/common';

const roleKeys = new Set<string>(roleRegistry.map(({ key }) => key));
const engine = new AuthorizationEngine();

export async function assertTransactionalAuthorization(
  transaction: DatabaseTransaction,
  input: Readonly<{
    userId: string;
    tenantId: string;
    permission: string;
    resource: Omit<AuthorizationResource, 'tenantId'>;
  }>,
): Promise<void> {
  const definition = permissionDefinition(input.permission);
  if (!definition) throw new ForbiddenException('Authorization denied');
  const [user, organization, membership, featureRows] = await Promise.all([
    transaction.user.findUnique({ where: { id: input.userId } }),
    transaction.organization.findUnique({ where: { id: input.tenantId } }),
    transaction.membership.findUnique({
      where: { tenantId_principalId: { principalId: input.userId, tenantId: input.tenantId } },
      include: {
        authorizationRoles: { include: { role: { include: { permissions: true } } } },
        branchScopes: true,
      },
    }),
    transaction.organizationFeature.findMany({ where: { tenantId: input.tenantId } }),
  ]);
  if (!user || !organization || !membership) throw new ForbiddenException('Authorization denied');
  const roles = membership.authorizationRoles
    .map(({ roleKey }) => (roleKeys.has(roleKey) ? (roleKey as RoleKey) : undefined))
    .filter((role): role is RoleKey => role !== undefined);
  const grants = membership.authorizationRoles.flatMap((assignment) =>
    assignment.role.permissions.flatMap((grant) => {
      if (grant.permissionKey !== definition.key) return [];
      const role = roleKeys.has(assignment.roleKey) ? (assignment.roleKey as RoleKey) : undefined;
      if (!role) return [];
      return [
        {
          assignmentId: assignment.id,
          permission: definition.key,
          role,
          scope: intersectScope(assignment.scope, grant.scope),
          ...(assignment.branchId === null ? {} : { branchId: assignment.branchId }),
          ...(assignment.validFrom === null ? {} : { validFrom: assignment.validFrom }),
          ...(assignment.validUntil === null ? {} : { validUntil: assignment.validUntil }),
        },
      ];
    }),
  );
  const context = createAuthorizationContext({
    evaluatedAt: new Date(),
    features: Object.fromEntries(
      featureRegistry.map(({ key }) => [
        key,
        featureRows.find(({ featureKey }) => featureKey === key)?.enabled ?? false,
      ]),
    ) as Record<FeatureKey, boolean>,
    grants,
    organizationStatus: organization.status,
    roles,
    tenantContext: {
      branchIds:
        membership.accessScope === 'ALL_BRANCHES'
          ? 'ALL_BRANCHES'
          : membership.branchScopes.map(({ branchId }) => branchId),
      membershipId: membership.id,
      principalId: user.id,
      tenantId: input.tenantId,
    },
  });
  const decision = engine.can(
    {
      membershipId: membership.id,
      membershipStatus: membership.status,
      membershipType: 'STANDARD',
      userId: user.id,
      userStatus: user.status,
    },
    definition.key,
    { ...input.resource, tenantId: input.tenantId },
    context,
  );
  if (!decision.allowed) throw new ForbiddenException('Authorization denied');
}

function intersectScope(
  assignment: AuthorizationScope,
  permission: AuthorizationScope,
): AuthorizationScope {
  if (assignment === 'CUSTOM' || permission === 'CUSTOM') return 'CUSTOM';
  if (assignment === 'SELF' || permission === 'SELF') return 'SELF';
  if (assignment === 'BRANCH' || permission === 'BRANCH') return 'BRANCH';
  if (assignment === 'ORGANIZATION' || permission === 'ORGANIZATION') return 'ORGANIZATION';
  return 'GLOBAL';
}
