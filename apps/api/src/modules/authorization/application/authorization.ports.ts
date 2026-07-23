import type {
  AuthorizationActor,
  AuthorizationContext,
  AuthorizationScope,
  FeatureKey,
  RoleKey,
} from '@nexo/authorization';

export type AuthorizationRoleView = Readonly<{
  key: string;
  name: string;
  description: string;
  registryVersion: number;
  effective: boolean;
}>;

export type AuthorizationPermissionView = Readonly<{
  key: string;
  resource: string;
  action: string;
  accessKind: string;
  featureKey: string | null;
  description: string;
  registryVersion: number;
  effective: boolean;
  scopes: readonly AuthorizationScope[];
}>;

export type AuthorizationFeatureView = Readonly<{
  key: FeatureKey;
  name: string;
  enabled: boolean;
  version: number;
}>;

export type AuthorizationMembershipView = Readonly<{
  id: string;
  tenantId: string;
  principalId: string;
  status: string;
  role: string;
  accessScope: string;
  branchIds: readonly string[];
  roles: readonly RoleKey[];
  version: number;
}>;

export type AuthorizationSnapshot = Readonly<{
  actor: AuthorizationActor;
  context: AuthorizationContext;
  roles: readonly AuthorizationRoleView[];
  permissions: readonly AuthorizationPermissionView[];
  features: readonly AuthorizationFeatureView[];
  memberships: readonly AuthorizationMembershipView[];
}>;

export interface AuthorizationRepository {
  resolve(
    input: Readonly<{
      userId: string;
      tenantId: string;
      branchId?: string;
    }>,
  ): Promise<AuthorizationSnapshot | null>;
}

export const AUTHORIZATION_REPOSITORY = Symbol('AUTHORIZATION_REPOSITORY');
