import { describe, expect, it } from 'vitest';

import { AuthorizationEngine, type AuthorizationContext } from './index.js';

const actor = Object.freeze({
  membershipId: 'membership-alpha-cashier',
  membershipStatus: 'ACTIVE',
  membershipType: 'STANDARD',
  userId: 'alpha-cashier',
  userStatus: 'ACTIVE',
});

const context: AuthorizationContext = Object.freeze({
  evaluatedAt: new Date('2026-07-13T12:00:00Z'),
  features: {
    APPOINTMENTS: false,
    ECOMMERCE: false,
    INVENTORY: true,
    KITCHEN: false,
    LOYALTY: false,
    MARKETPLACE: false,
    POS: true,
    REPORTS: true,
  },
  grants: [
    {
      assignmentId: 'assignment-1',
      permission: 'sales.create',
      role: 'CASHIER',
      scope: 'BRANCH',
    },
    {
      assignmentId: 'assignment-1',
      permission: 'cash.session.close',
      role: 'CASHIER',
      scope: 'SELF',
    },
  ] as const,
  organizationStatus: 'ACTIVE',
  roles: ['CASHIER'] as const,
  selectedBranchId: 'branch-alpha',
  tenantContext: {
    branchIds: ['branch-alpha'],
    membershipId: 'membership-alpha-cashier',
    principalId: 'alpha-cashier',
    tenantId: 'tenant-alpha',
  },
});

describe('AuthorizationEngine', () => {
  const engine = new AuthorizationEngine();

  it('combines RBAC grant, tenant, branch and feature attributes', () => {
    expect(
      engine.can(
        actor,
        'sales.create',
        {
          branchId: 'branch-alpha',
          tenantId: 'tenant-alpha',
          type: 'sale',
        },
        context,
      ),
    ).toMatchObject({ allowed: true, grantedBy: { role: 'CASHIER', scope: 'BRANCH' } });
    expect(
      engine.can(
        actor,
        'sales.create',
        {
          branchId: 'branch-beta',
          tenantId: 'tenant-alpha',
          type: 'sale',
        },
        context,
      ),
    ).toMatchObject({ allowed: false, reason: 'SCOPE_MISMATCH' });
  });

  it('denies cross-tenant, missing, disabled-feature and ownership failures', () => {
    expect(
      engine.can(actor, 'sales.create', { tenantId: 'tenant-beta', type: 'sale' }, context).reason,
    ).toBe('TENANT_MISMATCH');
    expect(
      engine.can(actor, 'product.delete', { tenantId: 'tenant-alpha', type: 'product' }, context)
        .reason,
    ).toBe('NO_ACTIVE_GRANT');
    expect(
      engine.can(
        actor,
        'appointments.manage',
        { tenantId: 'tenant-alpha', type: 'appointment' },
        context,
      ).reason,
    ).toBe('FEATURE_DISABLED');
    expect(
      engine.can(
        actor,
        'cash.session.close',
        {
          branchId: 'branch-alpha',
          ownerUserId: 'someone-else',
          tenantId: 'tenant-alpha',
          type: 'cash_session',
        },
        context,
      ).reason,
    ).toBe('SCOPE_MISMATCH');
  });

  it('defaults to deny for unknown permissions and inactive principals', () => {
    expect(
      engine.can(actor, 'unknown.execute', { tenantId: 'tenant-alpha', type: 'x' }, context),
    ).toMatchObject({ allowed: false, reason: 'UNKNOWN_PERMISSION' });
    expect(
      engine.can(
        { ...actor, membershipStatus: 'SUSPENDED' },
        'sales.create',
        { branchId: 'branch-alpha', tenantId: 'tenant-alpha', type: 'sale' },
        context,
      ),
    ).toMatchObject({ allowed: false, reason: 'INACTIVE_ACTOR' });
    expect(
      engine.can(
        actor,
        'sales.create',
        { branchId: 'branch-alpha', tenantId: 'tenant-alpha', type: 'sale' },
        { ...context, organizationStatus: 'SUSPENDED' },
      ),
    ).toMatchObject({ allowed: false, reason: 'INACTIVE_ORGANIZATION' });
  });

  it('enforces resource state, validity intervals and reserved custom scope', () => {
    expect(
      engine.can(
        actor,
        'sales.create',
        { branchId: 'branch-alpha', status: 'ARCHIVED', tenantId: 'tenant-alpha', type: 'sale' },
        context,
      ),
    ).toMatchObject({ allowed: false, reason: 'RESOURCE_STATE_DENIED' });
    const constrained = {
      ...context,
      grants: [
        {
          assignmentId: 'expired',
          permission: 'sales.create' as const,
          role: 'CASHIER' as const,
          scope: 'BRANCH' as const,
          validUntil: new Date('2026-07-13T11:59:59Z'),
        },
        {
          assignmentId: 'custom',
          permission: 'cash.session.close' as const,
          role: 'CASHIER' as const,
          scope: 'CUSTOM' as const,
        },
      ],
    };
    expect(
      engine.can(
        actor,
        'sales.create',
        { branchId: 'branch-alpha', tenantId: 'tenant-alpha', type: 'sale' },
        constrained,
      ),
    ).toMatchObject({ allowed: false, reason: 'NO_ACTIVE_GRANT' });
    expect(
      engine.can(
        actor,
        'cash.session.close',
        { branchId: 'branch-alpha', tenantId: 'tenant-alpha', type: 'cash_session' },
        constrained,
      ),
    ).toMatchObject({ allowed: false, reason: 'SCOPE_MISMATCH' });
  });

  it('allows the explicit restore action for an archived branch', () => {
    expect(
      engine.can(
        actor,
        'branch.restore',
        {
          branchId: 'branch-alpha',
          status: 'ARCHIVED',
          tenantId: 'tenant-alpha',
          type: 'branch',
        },
        {
          ...context,
          grants: [
            {
              assignmentId: 'owner-assignment',
              permission: 'branch.restore',
              role: 'OWNER',
              scope: 'ORGANIZATION',
            },
          ],
          roles: ['OWNER'],
        },
      ),
    ).toMatchObject({ allowed: true });
  });
});
