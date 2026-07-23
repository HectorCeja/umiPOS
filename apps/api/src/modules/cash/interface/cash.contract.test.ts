import openApiDocument from '@nexo/contracts/openapi' with { type: 'json' };
import { describe, expect, test } from 'vitest';

const operations = [
  ['get', '/v1/organizations/{organizationId}/cash/registers', 'listCashRegisters'],
  ['post', '/v1/organizations/{organizationId}/cash/registers', 'createCashRegister'],
  ['patch', '/v1/organizations/{organizationId}/cash/registers/{registerId}', 'updateCashRegister'],
  ['get', '/v1/organizations/{organizationId}/cash/drawers', 'listCashDrawers'],
  ['post', '/v1/organizations/{organizationId}/cash/drawers', 'createCashDrawer'],
  ['patch', '/v1/organizations/{organizationId}/cash/drawers/{drawerId}', 'updateCashDrawer'],
  ['post', '/v1/organizations/{organizationId}/cash/sessions/open', 'openCashSession'],
  ['get', '/v1/organizations/{organizationId}/cash/sessions/active', 'getActiveCashSession'],
  ['get', '/v1/organizations/{organizationId}/cash/sessions/{sessionId}', 'getCashSession'],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/suspend',
    'suspendCashSession',
  ],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/resume',
    'resumeCashSession',
  ],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/movements',
    'recordCashMovement',
  ],
  ['post', '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/counts', 'countCash'],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/reconcile',
    'reconcileCashSession',
  ],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/close',
    'closeCashSession',
  ],
  [
    'get',
    '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/timeline',
    'getCashTimeline',
  ],
  [
    'get',
    '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/summary',
    'getCashOperationalSummary',
  ],
  ['get', '/v1/organizations/{organizationId}/cash/policies', 'getCashPolicy'],
  ['post', '/v1/organizations/{organizationId}/cash/policies', 'saveCashPolicy'],
  ['get', '/v1/organizations/{organizationId}/cash/approvals', 'listCashApprovals'],
  ['post', '/v1/organizations/{organizationId}/cash/approvals', 'requestCashApproval'],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/approvals/{approvalId}/decision',
    'decideCashApproval',
  ],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/deposits',
    'prepareCashDeposit',
  ],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/deposits/{depositId}/transition',
    'transitionCashDeposit',
  ],
  ['post', '/v1/organizations/{organizationId}/cash/transfers', 'transferCash'],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/reopen',
    'reopenCashSession',
  ],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/sessions/{sessionId}/handoffs',
    'initiateCashShiftHandoff',
  ],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/handoffs/{handoffId}/count',
    'countCashShiftHandoff',
  ],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/handoffs/{handoffId}/decision',
    'decideCashShiftHandoff',
  ],
  [
    'post',
    '/v1/organizations/{organizationId}/cash/handoffs/{handoffId}/complete',
    'completeCashShiftHandoff',
  ],
  ['get', '/v1/organizations/{organizationId}/cash/handoffs/{handoffId}', 'getCashShiftHandoff'],
  [
    'get',
    '/v1/organizations/{organizationId}/cash/integrations/quarantine',
    'listCashIntegrationQuarantine',
  ],
  [
    'get',
    '/v1/organizations/{organizationId}/cash/integrations/status',
    'getCashIntegrationOperationalStatus',
  ],
] as const;

describe('Cash OpenAPI contract', () => {
  test('keeps every implemented Cash route design-first', () => {
    for (const [method, path, operationId] of operations) {
      expect(
        (openApiDocument.paths as Record<string, Record<string, { operationId?: string }>>)[path]?.[
          method
        ]?.operationId,
      ).toBe(operationId);
    }
  });
});
