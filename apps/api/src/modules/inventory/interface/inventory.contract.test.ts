import openApiDocument from '@nexo/contracts/openapi' with { type: 'json' };
import { describe, expect, it } from 'vitest';

const contract = openApiDocument as {
  paths: Record<string, Record<string, { operationId?: string }>>;
};
const operations = [
  ['get', '/v1/organizations/{organizationId}/inventory/locations', 'listInventoryLocations'],
  ['post', '/v1/organizations/{organizationId}/inventory/locations', 'createInventoryLocation'],
  ['get', '/v1/organizations/{organizationId}/inventory/movements', 'getInventoryTimeline'],
  ['post', '/v1/organizations/{organizationId}/inventory/movements', 'recordInventoryMovement'],
  ['get', '/v1/organizations/{organizationId}/inventory/availability', 'getInventoryAvailability'],
  [
    'post',
    '/v1/organizations/{organizationId}/inventory/reservations',
    'createInventoryReservation',
  ],
  [
    'post',
    '/v1/organizations/{organizationId}/inventory/reservations/{reservationId}/release',
    'releaseInventoryReservation',
  ],
  ['post', '/v1/organizations/{organizationId}/inventory/transfers', 'createInventoryTransfer'],
  [
    'post',
    '/v1/organizations/{organizationId}/inventory/transfers/{transferId}/complete',
    'completeInventoryTransfer',
  ],
  ['post', '/v1/organizations/{organizationId}/inventory/counts', 'recordInventoryCount'],
  ['put', '/v1/organizations/{organizationId}/inventory/policies', 'setInventoryPolicy'],
] as const;

describe('Inventory OpenAPI contract', () => {
  it('keeps every inventory application route design-first', () => {
    for (const [method, path, operationId] of operations)
      expect(contract.paths[path]?.[method]?.operationId).toBe(operationId);
  });
});
