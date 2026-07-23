import { describe, expect, it, vi } from 'vitest';

import { TenantAccessDeniedError, TenantResolver } from './tenant-resolver.js';

describe('TenantResolver', () => {
  it('creates an explicit context only from an active membership', async () => {
    const findActiveMembership = vi.fn().mockResolvedValue({
      accessScope: 'ALL_BRANCHES',
      branchIds: [],
      id: '30000000-0000-4000-8000-000000000001',
      principalId: '40000000-0000-4000-8000-000000000001',
      role: 'OWNER',
    });
    const resolver = new TenantResolver({ findActiveMembership });
    const context = await resolver.resolve('10000000-0000-4000-8000-000000000001', {
      authenticationMethod: 'test-verified-adapter',
      principalId: '40000000-0000-4000-8000-000000000001',
    });
    expect(context.tenantId).toBe('10000000-0000-4000-8000-000000000001');
    expect(Object.isFrozen(context)).toBe(true);
  });

  it('fails closed when membership cannot be proven', async () => {
    const resolver = new TenantResolver({
      findActiveMembership: vi.fn().mockResolvedValue(undefined),
    });
    await expect(
      resolver.resolve('10000000-0000-4000-8000-000000000002', {
        authenticationMethod: 'test-verified-adapter',
        principalId: '40000000-0000-4000-8000-000000000001',
      }),
    ).rejects.toBeInstanceOf(TenantAccessDeniedError);
  });
});
