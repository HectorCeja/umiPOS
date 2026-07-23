import {
  AUTHORIZATION_REGISTRY_VERSION,
  permissionDefinition,
  type AuthorizationScope,
  type FeatureKey,
  type PermissionKey,
  type RoleKey,
} from './registry.js';

export type EffectiveGrant = Readonly<{
  assignmentId: string;
  role: RoleKey;
  permission: PermissionKey;
  scope: AuthorizationScope;
  branchId?: string;
  customScope?: string;
  validFrom?: Date;
  validUntil?: Date;
}>;

export type AuthorizationActor = Readonly<{
  userId: string;
  userStatus: string;
  membershipId: string;
  membershipStatus: string;
  membershipType: string;
}>;

export type AuthorizationResource = Readonly<{
  id?: string;
  type: string;
  tenantId: string;
  branchId?: string;
  ownerUserId?: string;
  status?: string;
}>;

export type AuthorizationContext = Readonly<{
  tenantContext: Readonly<{
    tenantId: string;
    principalId: string;
    membershipId: string;
    branchIds: readonly string[] | 'ALL_BRANCHES';
  }>;
  organizationStatus: string;
  selectedBranchId?: string;
  roles: readonly RoleKey[];
  grants: readonly EffectiveGrant[];
  features: Readonly<Record<FeatureKey, boolean>>;
  evaluatedAt: Date;
}>;

export type AuthorizationDecision = Readonly<{
  allowed: boolean;
  permission: string;
  registryVersion: number;
  reason:
    | 'ALLOWED'
    | 'UNKNOWN_PERMISSION'
    | 'INACTIVE_ACTOR'
    | 'INACTIVE_ORGANIZATION'
    | 'TENANT_MISMATCH'
    | 'FEATURE_DISABLED'
    | 'RESOURCE_STATE_DENIED'
    | 'NO_ACTIVE_GRANT'
    | 'SCOPE_MISMATCH';
  grantedBy?: Readonly<{
    assignmentId: string;
    role: RoleKey;
    scope: AuthorizationScope;
  }>;
}>;

export function createAuthorizationContext(context: AuthorizationContext): AuthorizationContext {
  return Object.freeze({
    ...context,
    features: Object.freeze({ ...context.features }),
    grants: Object.freeze(context.grants.map((grant) => Object.freeze({ ...grant }))),
    roles: Object.freeze([...context.roles]),
    tenantContext: Object.freeze({
      ...context.tenantContext,
      branchIds:
        context.tenantContext.branchIds === 'ALL_BRANCHES'
          ? 'ALL_BRANCHES'
          : Object.freeze([...context.tenantContext.branchIds]),
    }),
  });
}

export class AuthorizationEngine {
  can(
    actor: AuthorizationActor,
    action: string,
    resource: AuthorizationResource,
    context: AuthorizationContext,
  ): AuthorizationDecision {
    const definition = permissionDefinition(action);
    if (definition === undefined) return this.deny(action, 'UNKNOWN_PERMISSION');
    if (actor.userStatus !== 'ACTIVE' || actor.membershipStatus !== 'ACTIVE')
      return this.deny(action, 'INACTIVE_ACTOR');
    if (context.organizationStatus !== 'ACTIVE') return this.deny(action, 'INACTIVE_ORGANIZATION');
    if (resource.tenantId !== context.tenantContext.tenantId)
      return this.deny(action, 'TENANT_MISMATCH');
    if ('feature' in definition && !context.features[definition.feature])
      return this.deny(action, 'FEATURE_DISABLED');
    if (
      resource.status === 'DELETED' ||
      (resource.status === 'ARCHIVED' &&
        definition.access !== 'READ' &&
        action !== 'branch.restore')
    )
      return this.deny(action, 'RESOURCE_STATE_DENIED');

    const activeGrants = context.grants.filter(
      (grant) =>
        grant.permission === action &&
        (grant.validFrom === undefined || grant.validFrom <= context.evaluatedAt) &&
        (grant.validUntil === undefined || grant.validUntil > context.evaluatedAt),
    );
    if (activeGrants.length === 0) return this.deny(action, 'NO_ACTIVE_GRANT');
    const granting = activeGrants.find((grant) =>
      this.scopeAllows(grant, actor, resource, context),
    );
    if (granting === undefined) return this.deny(action, 'SCOPE_MISMATCH');
    return Object.freeze({
      allowed: true,
      grantedBy: {
        assignmentId: granting.assignmentId,
        role: granting.role,
        scope: this.effectiveScope(granting.scope, resource, context),
      },
      permission: action,
      reason: 'ALLOWED' as const,
      registryVersion: AUTHORIZATION_REGISTRY_VERSION,
    });
  }

  private scopeAllows(
    grant: EffectiveGrant,
    actor: AuthorizationActor,
    resource: AuthorizationResource,
    context: AuthorizationContext,
  ): boolean {
    const { scope } = grant;
    if (
      context.selectedBranchId !== undefined &&
      resource.branchId !== undefined &&
      resource.branchId !== context.selectedBranchId
    )
      return false;
    if (grant.branchId !== undefined && resource.branchId !== grant.branchId) return false;
    const branchAllowed =
      resource.branchId === undefined ||
      context.tenantContext.branchIds === 'ALL_BRANCHES' ||
      context.tenantContext.branchIds.includes(resource.branchId);
    if (!branchAllowed) return false;
    switch (scope) {
      case 'GLOBAL':
        return true;
      case 'ORGANIZATION':
        return true;
      case 'BRANCH':
        return resource.branchId !== undefined;
      case 'SELF':
        return resource.ownerUserId === actor.userId;
      case 'CUSTOM':
        return false;
    }
  }

  private effectiveScope(
    granted: AuthorizationScope,
    resource: AuthorizationResource,
    context: AuthorizationContext,
  ): AuthorizationScope {
    if (
      granted === 'ORGANIZATION' &&
      resource.branchId !== undefined &&
      context.tenantContext.branchIds !== 'ALL_BRANCHES'
    )
      return 'BRANCH';
    return granted;
  }

  private deny(permission: string, reason: AuthorizationDecision['reason']): AuthorizationDecision {
    return Object.freeze({
      allowed: false,
      permission,
      reason,
      registryVersion: AUTHORIZATION_REGISTRY_VERSION,
    });
  }
}
