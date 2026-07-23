import {
  createAuthorizationContext,
  featureRegistry,
  permissionDefinition,
  roleRegistry,
  type AuthorizationScope,
  type FeatureKey,
  type RoleKey,
} from '@nexo/authorization';
import {
  type DatabaseClient,
  type DatabaseTransaction,
  withTenantTransaction,
} from '@nexo/database';
import { Inject, Injectable } from '@nestjs/common';

import { DATABASE } from '../../../infrastructure/infrastructure.module.js';
import type {
  AuthorizationRepository,
  AuthorizationSnapshot,
} from '../application/authorization.ports.js';

const roleKeys = new Set<string>(roleRegistry.map(({ key }) => key));

@Injectable()
export class PrismaAuthorizationRepository implements AuthorizationRepository {
  constructor(@Inject(DATABASE) private readonly database: DatabaseClient) {}

  async resolve(
    input: Parameters<AuthorizationRepository['resolve']>[0],
  ): Promise<AuthorizationSnapshot | null> {
    return withTenantTransaction(this.database, input.tenantId, async (transaction) => {
      const user = await transaction.user.findUnique({ where: { id: input.userId } });
      const organization = await transaction.organization.findUnique({
        where: { id: input.tenantId },
      });
      const membership = await transaction.membership.findUnique({
        where: {
          tenantId_principalId: {
            principalId: input.userId,
            tenantId: input.tenantId,
          },
        },
        include: {
          authorizationRoles: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
          branchScopes: true,
        },
      });
      if (
        user?.status !== 'ACTIVE' ||
        organization?.status !== 'ACTIVE' ||
        membership?.status !== 'ACTIVE' ||
        membership.authorizationRoles.length === 0
      )
        return null;

      const branchIds = membership.branchScopes.map(({ branchId }) => branchId);
      if (input.branchId !== undefined) {
        const branch = await transaction.branch.findUnique({
          where: { tenantId_id: { id: input.branchId, tenantId: input.tenantId } },
        });
        if (
          branch?.status !== 'ACTIVE' ||
          (membership.accessScope === 'RESTRICTED' && !branchIds.includes(input.branchId))
        )
          return null;
      }

      const [roleDefinitions, permissionDefinitions, featureDefinitions, featureRows, memberships] =
        await Promise.all([
          transaction.authorizationRoleDefinition.findMany({ orderBy: { key: 'asc' } }),
          transaction.authorizationPermissionDefinition.findMany({ orderBy: { key: 'asc' } }),
          transaction.authorizationFeatureDefinition.findMany({ orderBy: { key: 'asc' } }),
          transaction.organizationFeature.findMany({
            where: { tenantId: input.tenantId },
            orderBy: { featureKey: 'asc' },
          }),
          transaction.membership.findMany({
            where: { tenantId: input.tenantId },
            include: { authorizationRoles: true, branchScopes: true },
            orderBy: { createdAt: 'asc' },
          }),
        ]);

      const effectiveRoles = membership.authorizationRoles
        .map(({ roleKey }) => this.roleKey(roleKey))
        .filter((role): role is RoleKey => role !== undefined);
      const grants = membership.authorizationRoles.flatMap((assignment) =>
        assignment.role.permissions.flatMap((grant) => {
          const permission = permissionDefinition(grant.permissionKey);
          const role = this.roleKey(assignment.roleKey);
          if (permission === undefined || role === undefined) return [];
          return [
            {
              assignmentId: assignment.id,
              permission: permission.key,
              role,
              scope: this.intersectScope(assignment.scope, grant.scope),
              ...(assignment.branchId === null ? {} : { branchId: assignment.branchId }),
              ...(assignment.customScope === null ? {} : { customScope: assignment.customScope }),
              ...(assignment.validFrom === null ? {} : { validFrom: assignment.validFrom }),
              ...(assignment.validUntil === null ? {} : { validUntil: assignment.validUntil }),
            },
          ];
        }),
      );
      const enabledFeatures = Object.fromEntries(
        featureRegistry.map(({ key }) => [
          key,
          featureRows.find(({ featureKey }) => featureKey === key)?.enabled ?? false,
        ]),
      ) as Record<FeatureKey, boolean>;
      const context = createAuthorizationContext({
        evaluatedAt: new Date(),
        features: enabledFeatures,
        grants,
        organizationStatus: organization.status,
        roles: effectiveRoles,
        ...(input.branchId === undefined ? {} : { selectedBranchId: input.branchId }),
        tenantContext: {
          branchIds: membership.accessScope === 'ALL_BRANCHES' ? 'ALL_BRANCHES' : branchIds,
          membershipId: membership.id,
          principalId: user.id,
          tenantId: input.tenantId,
        },
      });

      return {
        actor: {
          membershipId: membership.id,
          membershipStatus: membership.status,
          membershipType: 'STANDARD',
          userId: user.id,
          userStatus: user.status,
        },
        context,
        features: featureDefinitions.flatMap((definition) => {
          const feature = featureRegistry.find(({ key }) => key === definition.key);
          if (feature === undefined) return [];
          const state = featureRows.find(({ featureKey }) => featureKey === definition.key);
          return [
            {
              enabled: state?.enabled ?? false,
              key: feature.key,
              name: definition.name,
              version: state?.version ?? 0,
            },
          ];
        }),
        memberships: this.membershipViews(memberships),
        permissions: permissionDefinitions.flatMap((definition) => {
          const permission = permissionDefinition(definition.key);
          if (permission === undefined) return [];
          const effective = grants.filter((grant) => grant.permission === definition.key);
          return [
            {
              accessKind: definition.accessKind,
              action: definition.action,
              description: definition.description,
              effective: effective.length > 0,
              featureKey: definition.featureKey,
              key: definition.key,
              registryVersion: definition.registryVersion,
              resource: definition.resource,
              scopes: [...new Set(effective.map(({ scope }) => scope))],
            },
          ];
        }),
        roles: roleDefinitions.map((role) => ({
          description: role.description,
          effective: effectiveRoles.includes(role.key as RoleKey),
          key: role.key,
          name: role.name,
          registryVersion: role.registryVersion,
        })),
      };
    });
  }

  private roleKey(value: string): RoleKey | undefined {
    return roleKeys.has(value) ? (value as RoleKey) : undefined;
  }

  private intersectScope(
    assignment: AuthorizationScope,
    permission: AuthorizationScope,
  ): AuthorizationScope {
    if (assignment === 'CUSTOM' || permission === 'CUSTOM') return 'CUSTOM';
    if (assignment === 'SELF' || permission === 'SELF') return 'SELF';
    if (assignment === 'BRANCH' || permission === 'BRANCH') return 'BRANCH';
    if (assignment === 'ORGANIZATION' || permission === 'ORGANIZATION') return 'ORGANIZATION';
    return 'GLOBAL';
  }

  private membershipViews(
    memberships: Awaited<ReturnType<DatabaseTransaction['membership']['findMany']>>,
  ) {
    return memberships.map((membership) => ({
      accessScope: membership.accessScope,
      branchIds:
        'branchScopes' in membership
          ? (membership.branchScopes as readonly { branchId: string }[]).map(
              ({ branchId }) => branchId,
            )
          : [],
      id: membership.id,
      role: membership.role,
      principalId: membership.principalId,
      roles:
        'authorizationRoles' in membership
          ? (membership.authorizationRoles as readonly { roleKey: string }[])
              .map(({ roleKey }) => this.roleKey(roleKey))
              .filter((role): role is RoleKey => role !== undefined)
          : [],
      status: membership.status,
      tenantId: membership.tenantId,
      version: membership.version,
    }));
  }
}
