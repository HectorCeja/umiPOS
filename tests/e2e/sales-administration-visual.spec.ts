import { expect, test, type Page } from '@playwright/test';
const sale = {
  id: '70000000-0000-4000-8000-000000000001',
  folio: 'S-00000042',
  status: 'COMPLETED',
  branchId: '20000000-0000-4000-8000-000000000001',
  currency: 'MXN',
  version: 5,
  createdAt: '2026-07-14T18:30:00.000Z',
};
const json = (body: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});
async function deterministic(
  page: Page,
  mode: 'default' | 'empty' | 'forbidden' | 'conflict' | 'worker' = 'default',
) {
  await page.addInitScript(() => {
    Date.now = () => 1784079000000;
    Object.defineProperty(globalThis, 'crypto', {
      value: { ...crypto, randomUUID: () => '90000000-0000-4000-8000-000000000001' },
    });
  });
  await page.route('http://localhost:3001/**', async (route) => {
    const url = route.request().url();
    if (mode === 'forbidden') return route.fulfill(json({ detail: 'FORBIDDEN' }, 403));
    if (mode === 'worker' && url.includes('exceptions'))
      return route.fulfill(
        json({
          items: [
            {
              module: 'WORKER',
              code: 'WORKER_UNAVAILABLE',
              correlationId: 'safe-correlation',
              occurredAt: '2026-07-14T18:31:00Z',
            },
          ],
        }),
      );
    if (url.includes('/overview'))
      return route.fulfill(
        json({
          statuses:
            mode === 'empty'
              ? []
              : [
                  { status: 'COMPLETED', _count: { _all: 12 } },
                  { status: 'OPEN', _count: { _all: 2 } },
                ],
          pendingOutbox: mode === 'conflict' ? 1 : 0,
          soldAmountMinor: '184500',
        }),
      );
    if (url.includes('/history'))
      return route.fulfill(
        json({
          items: mode === 'empty' ? [] : [sale],
          total: mode === 'empty' ? 0 : 1,
          page: 1,
          pageSize: 25,
        }),
      );
    if (url.includes('/exceptions'))
      return route.fulfill(
        json({
          items:
            mode === 'conflict'
              ? [
                  {
                    module: 'SALES',
                    code: 'SALE_VERSION_CONFLICT',
                    resourceId: sale.id,
                    correlationId: 'safe-correlation',
                  },
                ]
              : [],
        }),
      );
    if (url.includes('/detail'))
      return route.fulfill(
        json({
          sale,
          items: [
            {
              id: 'line-1',
              snapshot: { sku: 'CAF-LAT-M', productName: 'Latte', variantName: 'Mediano' },
              quantity: '1',
              totalMinor: '6500',
              taxMinor: '897',
              discountMinor: '0',
            },
          ],
          payments: [{ method: 'CASH', amountMinor: '6500' }],
          refunds: [],
          receipts: [{ id: 'receipt-1', version: 1 }],
          relationships: {
            inventory: [{ eventType: 'InventoryCommitted' }],
            cash: [{ movementType: 'CASH_SALE', amountMinor: '6500' }],
          },
        }),
      );
    if (url.includes('/timeline'))
      return route.fulfill(
        json({
          items: [
            {
              eventType: 'SaleCreated',
              occurredAt: '2026-07-14T18:25:00Z',
              correlationId: 'safe-correlation',
            },
            {
              eventType: 'SaleCompleted',
              occurredAt: '2026-07-14T18:30:00Z',
              correlationId: 'safe-correlation',
            },
          ],
        }),
      );
    if (url.includes('/diagnostic'))
      return route.fulfill(
        json({
          saleId: sale.id,
          branchId: sale.branchId,
          correlationId: 'safe-correlation',
          workerStatus: mode === 'worker' ? 'UNAVAILABLE' : 'SYNCHRONIZED',
          outboxPending: mode === 'conflict' ? 1 : 0,
          apiVersion: '8.5.0',
        }),
      );
    return route.fulfill(json({}));
  });
}
async function surface(
  page: Page,
  path: string,
  options: {
    detail?: boolean;
    mode?: 'default' | 'empty' | 'forbidden' | 'conflict' | 'worker';
    dark?: boolean;
    viewport?: { width: number; height: number };
  } = {},
) {
  await page.setViewportSize(options.viewport ?? { width: 1366, height: 768 });
  await page.emulateMedia({
    colorScheme: options.dark ? 'dark' : 'light',
    reducedMotion: 'reduce',
  });
  await deterministic(page, options.mode);
  await page.goto(`http://localhost:3000${path}`);
  await page.getByRole('button', { name: 'Actualizar' }).click();
  if (options.detail) await page.getByRole('button', { name: 'Revisar' }).click();
  await page
    .locator('body')
    .evaluate((element) => element.setAttribute('data-certification', 'deterministic'));
}
const cases = [
  ['01-overview-desktop', '/sales', {}],
  ['02-overview-tablet', '/sales', { viewport: { width: 1024, height: 768 } }],
  ['03-history-desktop', '/sales/history', {}],
  ['04-history-tablet', '/sales/history', { viewport: { width: 768, height: 1024 } }],
  ['05-sale-detail', '/sales/' + sale.id, { detail: true }],
  ['06-sale-timeline', '/sales/' + sale.id + '/timeline', { detail: true }],
  ['07-open-sales', '/sales/open', {}],
  ['08-suspended-sales', '/sales/suspended', {}],
  ['09-refund-list', '/sales/refunds', {}],
  ['10-refund-detail', '/sales/refunds', { detail: true }],
  ['11-receipt-preview', '/sales/' + sale.id + '/receipt', { detail: true }],
  ['12-related-inventory', '/sales/' + sale.id, { detail: true }],
  ['13-related-cash', '/sales/' + sale.id, { detail: true }],
  ['14-operational-exceptions', '/sales/exceptions', { mode: 'conflict' }],
  ['15-diagnostic-bundle', '/sales/' + sale.id, { detail: true }],
  ['16-outbox-status', '/sales/exceptions', { mode: 'conflict' }],
  ['17-quarantine-status', '/sales/exceptions', { mode: 'worker' }],
  ['18-empty', '/sales', { mode: 'empty' }],
  ['19-loading', '/sales', {}],
  ['20-forbidden', '/sales', { mode: 'forbidden' }],
  ['21-version-conflict', '/sales/exceptions', { mode: 'conflict' }],
  ['22-worker-unavailable', '/sales/exceptions', { mode: 'worker' }],
  ['23-dark-overview', '/sales', { dark: true }],
  ['24-dark-detail', '/sales/' + sale.id, { detail: true, dark: true }],
  ['25-reduced-motion', '/sales', {}],
  ['26-tablet-portrait', '/sales', { viewport: { width: 768, height: 1024 } }],
  ['27-tablet-landscape', '/sales', { viewport: { width: 1024, height: 768 } }],
] as const;
test.describe('Sales Administration deterministic visual baselines', () => {
  for (const [name, path, options] of cases)
    test(name, async ({ page }) => {
      await surface(page, path, options);
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
});
