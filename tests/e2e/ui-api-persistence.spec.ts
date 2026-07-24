import { expect, test, type Page, type Request, type Response } from '@playwright/test';
import { chooseCustomNexoSelect } from './owner-corrective.helpers';

const web = 'http://localhost:3000';
const api = 'http://localhost:3001';

interface BrowserAudit {
  console: string[];
  failed: string[];
  httpFailures: string[];
  mutations: { method: string; url: string; status: number; request: Request }[];
}

function audit(page: Page): BrowserAudit {
  const result: BrowserAudit = { console: [], failed: [], httpFailures: [], mutations: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      result.console.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => result.console.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => {
    result.failed.push(
      `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`,
    );
  });
  page.on('response', (response: Response) => {
    const method = response.request().method();
    if (response.status() >= 400) {
      result.httpFailures.push(`${method} ${response.url()} ${response.status().toString()}`);
    }
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      result.mutations.push({
        method,
        url: response.url(),
        status: response.status(),
        request: response.request(),
      });
    }
  });
  return result;
}

async function login(page: Page) {
  await page.getByRole('button', { name: 'Entrar a NEXO' }).click();
  await page.locator('.product-main, .guided-onboarding, .products-page').first().waitFor();
  await expect(page.getByText('Validando tu sesión…')).toBeHidden();
}

test.describe.serial('UI ↔ API persistence certification', () => {
  test.afterEach(async ({ page }) => {
    const identity = await page.request.get(`${api}/v1/identity`);
    if (!identity.ok()) return;
    const csrf =
      (await page.context().cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
    const headers = { origin: web, 'x-csrf-token': csrf };
    const profile = await page.request.patch(`${api}/v1/profile`, {
      headers,
      data: {
        displayName: 'Alpha Owner',
        givenName: 'Alpha',
        familyName: 'Owner',
        locale: 'es-MX',
        timeZone: 'America/Mazatlan',
        preferences: { theme: 'system', density: 'comfortable' },
      },
    });
    expect(profile.ok(), 'canonical profile restoration').toBe(true);
    const avatar = await page.request.delete(`${api}/v1/profile/avatar`, { headers });
    expect(avatar.ok(), 'canonical avatar restoration').toBe(true);
  });

  test('expired or absent session cannot submit Product and returns safely after login', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const observed = audit(page);
    await page.goto(`${web}/products`);
    await expect(page).toHaveURL(/\?returnTo=%2Fproducts$/);
    await login(page);
    await expect(page).toHaveURL(`${web}/products`);
    observed.console.splice(0);
    observed.failed.splice(0);
    observed.httpFailures.splice(0);
    observed.mutations.splice(0);

    const suffix = Date.now().toString();
    const sku = `UIAPI-${suffix}`;
    await page.getByLabel('Nombre del producto').fill(`Producto UI API ${suffix}`);
    await page.getByLabel('SKU comercial (opcional)').fill(sku);
    await page.getByLabel('Descripción (opcional)').fill('Persistencia real certificada.');
    await chooseCustomNexoSelect(page, 'Categoría', 'Integración UI API');
    await page.getByLabel('Precio en MXN').fill('55.00');
    await page.getByLabel('Código de barras').fill(`751${suffix.slice(-10)}`);
    await page.getByRole('button', { name: 'Agregar al catálogo' }).click();
    await expect(page.getByText('Cambios guardados.')).toBeVisible({ timeout: 20_000 });

    const writes = observed.mutations.filter((item) => item.url.includes('/v1/organizations/'));
    expect(writes.length).toBeGreaterThanOrEqual(4);
    expect(writes.every((item) => item.status >= 200 && item.status < 300)).toBe(true);
    for (const write of writes) {
      expect((await write.request.allHeaders()).cookie).toContain('nexo_session=');
      expect((await write.request.allHeaders())['x-csrf-token']).toBeTruthy();
    }

    await page.reload();
    await page.getByLabel('Buscar productos').fill(sku);
    await expect(page.getByText(`Producto UI API ${suffix}`)).toBeVisible();
    await page.screenshot({
      path: 'artifacts/ui-api-persistence-certification/screenshots/product-persisted.png',
      fullPage: true,
    });
    const persisted = await page.request.get(
      `${api}/v1/organizations/10000000-0000-4000-8000-000000000001/products?q=${encodeURIComponent(sku)}`,
    );
    expect(persisted.status()).toBe(200);
    expect(JSON.stringify(await persisted.json())).toContain(sku);
    expect(observed.console).toEqual([]);
    expect(observed.failed).toEqual([]);
    expect(observed.httpFailures).toEqual([]);
    await context.close();
  });

  test('personal identity and avatar are identical in profile and global shell', async ({
    page,
  }) => {
    const observed = audit(page);
    await page.goto(web);
    await login(page);
    observed.console.splice(0);
    observed.failed.splice(0);
    observed.httpFailures.splice(0);
    observed.mutations.splice(0);
    await page.goto(`${web}/settings/profile`);
    const personalName = `Héctor QA ${Date.now().toString().slice(-6)}`;
    await page.getByRole('textbox', { name: 'Nombre *', exact: true }).fill('Héctor');
    await page.getByRole('textbox', { name: 'Apellidos *', exact: true }).fill('QA');
    await page.getByRole('textbox', { name: 'Nombre visible *', exact: true }).fill(personalName);
    await page.locator('input[type=file]').setInputFiles({
      name: 'hector-qa.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    });
    await page.getByRole('button', { name: 'Guardar perfil' }).click();
    await expect(page.getByText(/Perfil actualizado\. Tu nombre y tu foto/)).toBeVisible({
      timeout: 15_000,
    });
    await page.waitForLoadState('networkidle');
    await page.reload();
    await expect(page.getByRole('textbox', { name: 'Nombre visible *', exact: true })).toHaveValue(
      personalName,
    );
    await expect(page.locator('.profile-trigger')).toContainText(personalName);
    const profileImage = page.locator('.profile-trigger .avatar img');
    await expect(profileImage).toBeVisible();
    const src = await profileImage.getAttribute('src');
    expect(src).toContain('/v1/profile/avatar/');
    await page
      .getByRole('button', { name: new RegExp(`Abrir menú de usuario de ${personalName}`) })
      .click();
    await expect(page.locator('.account-menu')).toContainText(personalName);
    await expect(page.locator('.account-menu')).toContainText('alpha.owner@nexo.local');
    await page.screenshot({
      path: 'artifacts/ui-api-persistence-certification/screenshots/identity-avatar-consistent.png',
      fullPage: true,
    });
    expect(observed.console).toEqual([]);
    expect(observed.failed).toEqual([]);
    expect(observed.httpFailures).toEqual([]);
  });
});
