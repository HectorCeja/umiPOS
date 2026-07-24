import { expect, request, test, type APIRequestContext, type Page } from '@playwright/test';
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
  mode: 'default' | 'empty' | 'forbidden' | 'conflict' | 'worker' | 'loading' = 'default',
) {
  let releaseLoading: (() => void) | undefined;
  const loadingGate =
    mode === 'loading'
      ? new Promise<void>((resolve) => {
          releaseLoading = resolve;
        })
      : undefined;
  await page.addInitScript(() => {
    Date.now = () => 1784079000000;
    Object.defineProperty(globalThis.crypto, 'randomUUID', {
      configurable: true,
      value: () => '90000000-0000-4000-8000-000000000001',
    });
  });
  await page.route('**/v1/**', async (route) => {
    const url = route.request().url();
    if (!url.includes('/sales')) return route.continue();
    if (loadingGate) await loadingGate;
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
    return route.continue();
  });
  return releaseLoading;
}
async function surface(
  page: Page,
  cookies: Awaited<ReturnType<APIRequestContext['storageState']>>['cookies'],
  path: string,
  options: {
    detail?: boolean;
    mode?: 'default' | 'empty' | 'forbidden' | 'conflict' | 'worker' | 'loading';
    dark?: boolean;
    viewport?: { width: number; height: number };
  } = {},
) {
  await page.setViewportSize(options.viewport ?? { width: 1366, height: 768 });
  await page.emulateMedia({
    colorScheme: options.dark ? 'dark' : 'light',
    reducedMotion: 'reduce',
  });
  await page.context().addCookies(cookies);
  const releaseLoading = await deterministic(page, options.mode);
  await page.goto(`http://localhost:3000${path}`);
  const businessContext = page.locator('.business-context');
  await expect(businessContext.getByText('Organization Alpha', { exact: true })).toBeVisible();
  await expect(businessContext.getByText('Main Branch', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Actualizar' }).click();
  if (options.mode === 'loading') {
    await expect(page.locator('button[aria-busy="true"]')).toBeVisible();
  } else if (options.mode === 'empty') {
    await expect(page.getByText('Sin datos todavía').first()).toBeVisible();
  } else if (options.mode === 'forbidden') {
    await expect(
      page.getByText('No tienes permiso para consultar esta información.').first(),
    ).toBeVisible();
  } else {
    await expect(page.getByText(sale.folio).first()).toBeVisible();
  }
  if (options.detail) await page.getByRole('button', { name: 'Revisar' }).click();
  await page
    .locator('body')
    .evaluate((element) => element.setAttribute('data-certification', 'deterministic'));
  await page.evaluate(() => {
    const contextLabels = document.querySelectorAll<HTMLElement>(
      '.home-context-controls .context-selector__copy strong',
    );
    if (contextLabels[0]) contextLabels[0].textContent = 'Organización Alpha';
    if (contextLabels[1]) contextLabels[1].textContent = 'Sucursal Principal';
    for (const image of document.querySelectorAll<HTMLElement>('.avatar img'))
      image.style.display = 'none';
    for (const fallback of document.querySelectorAll<HTMLElement>('.avatar__fallback'))
      fallback.style.display = 'grid';
    const profileName = document.querySelector<HTMLElement>('.profile-trigger strong');
    if (profileName) profileName.textContent = 'Alpha Owner';
    for (const skip of document.querySelectorAll<HTMLElement>('.nexo-skip-link'))
      skip.style.display = 'none';
  });
  await page.evaluate(async () => {
    await Promise.all(
      document.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
    );
  });
  return releaseLoading;
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
  ['19-loading', '/sales', { mode: 'loading' }],
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
  let visualSession: APIRequestContext;
  let visualCookies: Awaited<ReturnType<APIRequestContext['storageState']>>['cookies'];
  test.beforeAll(async () => {
    visualSession = await request.newContext({
      baseURL: 'http://localhost:3001',
      extraHTTPHeaders: { origin: 'http://localhost:3000' },
    });
    const login = await visualSession.post('/v1/auth/login', {
      data: {
        deviceFingerprint: 'sales-visual-baseline',
        deviceName: 'Sales visual baseline',
        email: 'alpha.owner@nexo.local',
        password: process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!',
      },
    });
    expect(login.status()).toBe(200);
    visualCookies = (await visualSession.storageState()).cookies;
  });
  test.afterAll(async () => visualSession.dispose());
  for (const [name, path, options] of cases)
    test(name, async ({ page }) => {
      const releaseLoading = await surface(page, visualCookies, path, options);
      try {
        await expect(page).toHaveScreenshot(`${name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      } finally {
        releaseLoading?.();
      }
    });
});
