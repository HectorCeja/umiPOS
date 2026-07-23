import { expect, test } from '@playwright/test';
import { browserAudit, evidence, expectClean, login, web } from './owner-corrective.helpers';

test('inventory submits authoritative variant and location identifiers', async ({ page }) => {
  await login(page);
  await page.goto(`${web}/inventory`);
  await page.waitForTimeout(500);
  const audit = browserAudit(page);
  const csrf = await page.evaluate(() =>
    decodeURIComponent(
      document.cookie
        .split('; ')
        .find((item) => item.startsWith('nexo_csrf='))
        ?.split('=')[1] ?? '',
    ),
  );
  const branchResponse = await page.request.get(
    'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/branches',
  );
  const branch = ((await branchResponse.json()) as { id: string; status: string }[]).find(
    (item) => item.status === 'ACTIVE',
  );
  const currentLocations = await page.request.get(
    'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/inventory/locations',
  );
  if (((await currentLocations.json()) as unknown[]).length === 0 && branch) {
    expect(
      (
        await page.request.post(
          'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/inventory/locations',
          {
            headers: { 'x-csrf-token': csrf },
            data: {
              branchId: branch.id,
              type: 'WAREHOUSE',
              code: `QA-${Date.now()}`,
              name: 'Almacén QA',
            },
          },
        )
      ).ok(),
    ).toBe(true);
    await page.reload();
  }
  const currentProducts = await page.request.get(
    'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/products',
  );
  const visibleProducts = (await currentProducts.json()) as {
    id: string;
    type: string;
    status: string;
  }[];
  if (!visibleProducts.some((item) => item.type === 'PHYSICAL' && item.status === 'ACTIVE')) {
    const stamp = Date.now();
    const created = await page.request.post(
      'http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/products',
      {
        headers: { 'x-csrf-token': csrf },
        data: { name: `Inventory selector ${stamp}`, sku: `INV-SEL-${stamp}`, type: 'PHYSICAL' },
      },
    );
    expect(created.status()).toBe(201);
    const productId = ((await created.json()) as { id: string }).id;
    const detail = (await (
      await page.request.get(
        `http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/products/${productId}`,
      )
    ).json()) as { version: number; variants: { id: string }[] };
    expect(
      (
        await page.request.post(
          `http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/products/${productId}/prices`,
          {
            headers: { 'x-csrf-token': csrf },
            data: {
              variantId: detail.variants[0]!.id,
              amount: '10.00',
              currency: 'MXN',
              taxProfileKey: 'MX_STANDARD',
            },
          },
        )
      ).status(),
    ).toBe(201);
    expect(
      (
        await page.request.post(
          `http://localhost:3001/v1/organizations/10000000-0000-4000-8000-000000000001/products/${productId}/activate`,
          {
            headers: { 'x-csrf-token': csrf },
            data: { version: detail.version },
          },
        )
      ).status(),
    ).toBe(201);
    await page.reload();
  }
  const product = page.getByRole('combobox', { name: 'Producto o presentación' });
  await product.click();
  const enabledProduct = page
    .getByRole('listbox')
    .last()
    .locator('[role="option"]:not([aria-disabled="true"])')
    .first();
  await expect(enabledProduct).toBeEnabled();
  const enabledProductName = (await enabledProduct.innerText()).split('\n')[0]!.trim();
  await page
    .getByRole('searchbox', { name: 'Buscar en Producto o presentación' })
    .fill(enabledProductName);
  await page.getByRole('searchbox', { name: 'Buscar en Producto o presentación' }).press('Enter');
  await page.getByRole('combobox', { name: 'Ubicación de inventario' }).click();
  await page.getByRole('searchbox', { name: 'Buscar en Ubicación de inventario' }).press('Enter');
  const response = page.waitForResponse((item) => item.url().includes('/inventory/availability'));
  await page.getByRole('button', { name: 'Consultar existencias' }).click();
  expect((await response).status()).toBe(200);
  await evidence(page, 'inventory-authoritative-selectors.png');
  expectClean(audit);
});
