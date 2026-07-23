export const authorizationRoutes = Object.freeze({
  context: 'authorization/context',
  evaluate: 'authorization/evaluate',
  featureFlags: 'feature-flags',
  memberships: 'memberships',
  permissions: 'permissions',
  roles: 'roles',
});

export const authorizationRouteManifest = Object.freeze([
  ['GET', '/v1/organizations/{organizationId}/authorization/context', 'getAuthorizationContext'],
  ['POST', '/v1/organizations/{organizationId}/authorization/evaluate', 'evaluatePermission'],
  ['GET', '/v1/organizations/{organizationId}/roles', 'listRoles'],
  ['GET', '/v1/organizations/{organizationId}/permissions', 'listPermissions'],
  ['GET', '/v1/organizations/{organizationId}/feature-flags', 'listFeatureFlags'],
  ['GET', '/v1/organizations/{organizationId}/memberships', 'listMemberships'],
] as const);
