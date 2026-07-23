import openApiDocument from '@nexo/contracts/openapi' with { type: 'json' };
import { describe, expect, it } from 'vitest';

const contract = openApiDocument as {
  paths: Record<string, Record<string, { operationId?: string }>>;
};

const operations = [
  ['get', '/v1/organizations', 'listActiveOrganizations'],
  ['post', '/v1/organizations', 'createOrganization'],
  ['get', '/v1/organizations/{organizationId}', 'getOrganization'],
  ['patch', '/v1/organizations/{organizationId}', 'updateOrganization'],
  ['delete', '/v1/organizations/{organizationId}', 'archiveOrganization'],
  ['get', '/v1/organizations/{organizationId}/branches', 'listBranches'],
  ['post', '/v1/organizations/{organizationId}/branches', 'createBranch'],
  ['patch', '/v1/organizations/{organizationId}/branches/{branchId}', 'updateBranch'],
  ['delete', '/v1/organizations/{organizationId}/branches/{branchId}', 'archiveBranch'],
  ['post', '/v1/organizations/{organizationId}/branches/{branchId}/restore', 'restoreBranch'],
  ['get', '/v1/business-templates', 'listBusinessTemplates'],
  ['get', '/v1/organizations/{organizationId}/onboarding', 'getOnboarding'],
  ['put', '/v1/organizations/{organizationId}/onboarding', 'saveOnboarding'],
  ['post', '/v1/organizations/{organizationId}/onboarding/complete', 'completeOnboarding'],
  ['post', '/v1/organizations/{organizationId}/onboarding/restart', 'restartOnboarding'],
  ['patch', '/v1/organizations/{organizationId}/features/{featureKey}', 'updateFeatureFlag'],
  ['get', '/v1/organizations/{organizationId}/invitations', 'listInvitations'],
  ['post', '/v1/organizations/{organizationId}/invitations', 'createInvitation'],
  ['delete', '/v1/organizations/{organizationId}/invitations/{invitationId}', 'revokeInvitation'],
  [
    'post',
    '/v1/organizations/{organizationId}/invitations/{invitationId}/resend',
    'resendInvitation',
  ],
  ['post', '/v1/organizations/{organizationId}/invitations/accept', 'acceptInvitation'],
  ['patch', '/v1/organizations/{organizationId}/memberships/{membershipId}', 'updateMembership'],
] as const;

describe('Control Plane OpenAPI contract', () => {
  it('keeps every published application-service route design-first', () => {
    for (const [method, path, operationId] of operations)
      expect(contract.paths[path]?.[method]?.operationId).toBe(operationId);
  });
});
