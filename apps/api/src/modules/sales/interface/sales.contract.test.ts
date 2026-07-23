import openApiDocument from '@nexo/contracts/openapi' with { type: 'json' };
import { describe, expect, test } from 'vitest';

const operations = [
  ['post', '/v1/organizations/{organizationId}/sales', 'createSale'],
  ['get', '/v1/organizations/{organizationId}/sales', 'listSales'],
  ['get', '/v1/organizations/{organizationId}/sales/{saleId}', 'getSale'],
  ['post', '/v1/organizations/{organizationId}/sales/{saleId}/items', 'addSaleItem'],
  ['post', '/v1/organizations/{organizationId}/sales/{saleId}/checkout', 'prepareSaleCheckout'],
  ['post', '/v1/organizations/{organizationId}/sales/{saleId}/payments', 'recordSalePayment'],
  ['post', '/v1/organizations/{organizationId}/sales/{saleId}/complete', 'completeSale'],
  ['post', '/v1/organizations/{organizationId}/sales/{saleId}/suspend', 'suspendSale'],
  ['post', '/v1/organizations/{organizationId}/sales/{saleId}/resume', 'resumeSale'],
  ['post', '/v1/organizations/{organizationId}/sales/{saleId}/cancel', 'cancelSale'],
  ['post', '/v1/organizations/{organizationId}/sales/{saleId}/refunds', 'requestSaleRefund'],
  ['post', '/v1/organizations/{organizationId}/sales/{saleId}/receipt', 'generateSaleReceipt'],
  ['get', '/v1/organizations/{organizationId}/sales/policies', 'getSalesPolicy'],
  ['put', '/v1/organizations/{organizationId}/sales/policies', 'updateSalesPolicy'],
  ['get', '/v1/organizations/{organizationId}/external-mappings', 'listExternalMappings'],
  ['get', '/v1/organizations/{organizationId}/sales-administration/overview', 'getSalesOverview'],
  [
    'get',
    '/v1/organizations/{organizationId}/sales-administration/history',
    'searchSalesAdministration',
  ],
  [
    'get',
    '/v1/organizations/{organizationId}/sales-administration/refunds',
    'listSalesRefundsAdministration',
  ],
  [
    'get',
    '/v1/organizations/{organizationId}/sales-administration/receipts',
    'listSalesReceiptsAdministration',
  ],
  [
    'get',
    '/v1/organizations/{organizationId}/sales-administration/exceptions',
    'getSalesOperationalExceptions',
  ],
  [
    'get',
    '/v1/organizations/{organizationId}/sales-administration/{saleId}/detail',
    'getSaleAdministrationDetail',
  ],
  [
    'get',
    '/v1/organizations/{organizationId}/sales-administration/{saleId}/timeline',
    'getSaleAdministrationTimeline',
  ],
  [
    'get',
    '/v1/organizations/{organizationId}/sales-administration/{saleId}/diagnostic',
    'getSaleDiagnosticBundle',
  ],
] as const;

describe('Sales OpenAPI contract', () => {
  test('keeps every implemented Sales route design-first', () => {
    for (const [method, path, operationId] of operations)
      expect(
        (openApiDocument.paths as Record<string, Record<string, { operationId?: string }>>)[path]?.[
          method
        ]?.operationId,
      ).toBe(operationId);
  });
});
