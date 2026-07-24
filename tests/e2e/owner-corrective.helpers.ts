import { expect, type Page, type Request, type Response } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  completeCleanOnboarding,
  createCleanBusiness,
  loginClean,
} from './dynamic-context.helpers';

export const web = 'http://localhost:3000';
export const api = 'http://localhost:3001';
export const correctiveArtifacts = path.resolve(
  'artifacts/ui-api-persistence-certification/corrective-pass-2',
);

export async function evidence(
  page: Page,
  name: string,
  directory = path.join(correctiveArtifacts, 'screenshots'),
) {
  await mkdir(directory, { recursive: true });
  await page.waitForTimeout(350);
  await page.screenshot({
    path: path.join(directory, name),
    fullPage: true,
    animations: 'disabled',
  });
}

export function browserAudit(page: Page) {
  const consoleMessages: string[] = [];
  const failedRequests: Array<FailedRequestClassification & { message: string }> = [];
  const httpFailures: string[] = [];
  const successfulReadUrls = new Set<string>();
  const requestStartedAt = new WeakMap<Request, number>();
  const requestFrameUrlAtStart = new WeakMap<Request, string>();
  const requestNavigationGeneration = new WeakMap<Request, number>();
  let lastDocumentNavigationStartedAt = 0;
  let navigationGeneration = 0;
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) navigationGeneration += 1;
  });
  page.on('request', (request) => {
    const startedAt = Date.now();
    requestStartedAt.set(request, startedAt);
    requestFrameUrlAtStart.set(request, request.frame().url());
    requestNavigationGeneration.set(request, navigationGeneration);
    if (request.isNavigationRequest() && request.frame() === page.mainFrame())
      lastDocumentNavigationStartedAt = startedAt;
  });
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type()))
      consoleMessages.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => consoleMessages.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => {
    const failure = {
      method: request.method(),
      url: request.url(),
      errorText: request.failure()?.errorText ?? '',
      requestStartedAt: requestStartedAt.get(request) ?? Number.POSITIVE_INFINITY,
      navigationStartedAt: lastDocumentNavigationStartedAt,
      frameUrlAtStart: requestFrameUrlAtStart.get(request),
      currentFrameUrl: page.mainFrame().url(),
      requestNavigationGeneration: requestNavigationGeneration.get(request),
      currentNavigationGeneration: navigationGeneration,
    };
    if (!isExpectedNavigationCancellation(failure))
      failedRequests.push({
        ...failure,
        message: `${failure.method} ${failure.url} ${failure.errorText}`,
      });
  });
  page.on('response', (response: Response) => {
    if (response.status() < 400 && ['GET', 'HEAD'].includes(response.request().method()))
      successfulReadUrls.add(response.url());
    if (response.status() >= 400)
      httpFailures.push(`${response.request().method()} ${response.url()} ${response.status()}`);
  });
  return {
    consoleMessages,
    get failedRequests() {
      return failedRequests
        .filter(
          (failure) =>
            !isExpectedNavigationCancellation({
              ...failure,
              currentFrameUrl: page.mainFrame().url(),
              currentNavigationGeneration: navigationGeneration,
              replacementSucceeded: successfulReadUrls.has(failure.url),
            }),
        )
        .map(({ message }) => message);
    },
    httpFailures,
  };
}

export type FailedRequestClassification = {
  method: string;
  url: string;
  errorText: string;
  requestStartedAt: number;
  navigationStartedAt: number;
  frameUrlAtStart?: string;
  currentFrameUrl?: string;
  requestNavigationGeneration?: number;
  currentNavigationGeneration?: number;
  replacementSucceeded?: boolean;
};

export function isExpectedNavigationCancellation(failure: FailedRequestClassification) {
  const safeRead = failure.method === 'GET' || failure.method === 'HEAD';
  const expectedChromiumCancellation =
    failure.errorText.includes('net::ERR_ABORTED') ||
    failure.errorText.includes('frame was detached') ||
    failure.errorText.includes('Target page, context or browser has been closed');
  const navigationSupersededRequest =
    (Number.isFinite(failure.requestStartedAt) &&
      failure.navigationStartedAt >= failure.requestStartedAt) ||
    (Boolean(failure.frameUrlAtStart) &&
      Boolean(failure.currentFrameUrl) &&
      failure.frameUrlAtStart !== failure.currentFrameUrl) ||
    (failure.requestNavigationGeneration !== undefined &&
      failure.currentNavigationGeneration !== undefined &&
      failure.currentNavigationGeneration > failure.requestNavigationGeneration);
  const securityCriticalRead = /\/(?:auth|sessions?|password|mfa)(?:\/|\?|$)/i.test(failure.url);
  return (
    safeRead &&
    expectedChromiumCancellation &&
    (navigationSupersededRequest || failure.replacementSucceeded === true) &&
    !securityCriticalRead
  );
}

export async function login(page: Page) {
  await loginClean(page, 'alpha.owner@nexo.local', {
    organizationId: '10000000-0000-4000-8000-000000000001',
    branchId: '20000000-0000-4000-8000-000000000001',
  });
  await page
    .locator('.product-main, .guided-onboarding, .module-page, .settings-surface')
    .first()
    .waitFor();
  await page.waitForLoadState('domcontentloaded');
}

export async function setOnboardingStep(page: Page, step: number) {
  const organizationId = await activeOrganizationId(page);
  if (organizationId === '10000000-0000-4000-8000-000000000001') {
    throw new Error(
      `setOnboardingStep rejected canonical onboarding mutation: helper=setOnboardingStep caller=${testCaller()} organizationId=${organizationId} attemptedStep=${step}`,
    );
  }
  const organizationsResponse = await page.request.get(`${api}/v1/organizations`);
  expect(organizationsResponse.ok()).toBe(true);
  const organizationName = (
    (await organizationsResponse.json()) as { id: string; name: string }[]
  ).find(({ id }) => id === organizationId)?.name;
  const branchesResponse = await page.request.get(
    `${api}/v1/organizations/${organizationId}/branches`,
  );
  expect(branchesResponse.ok()).toBe(true);
  const branchName = ((await branchesResponse.json()) as { name: string }[])[0]?.name;
  const csrf =
    (await page.context().cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
  const currentResponse = await page.request.get(
    `${api}/v1/organizations/${organizationId}/onboarding`,
  );
  expect(currentResponse.ok()).toBe(true);
  const current = (await currentResponse.json()) as { version: number };
  const restart = await page.request.post(
    `${api}/v1/organizations/${organizationId}/onboarding/restart`,
    {
      headers: { 'x-csrf-token': csrf },
      data: { version: current.version },
    },
  );
  expect(restart.ok()).toBe(true);
  const draft = (await restart.json()) as { version: number };
  const prepared = await page.request.put(`${api}/v1/organizations/${organizationId}/onboarding`, {
    headers: { 'x-csrf-token': csrf },
    data: {
      version: draft.version,
      currentStep: Math.min(4, Math.floor(step / 3) + 1),
      businessType: 'COFFEE_SHOP',
      templateKey: 'coffee-shop',
      answers: {
        journeyStep: step,
        businessName: organizationName ?? 'Mi negocio',
        branchName: branchName ?? 'Sucursal principal',
        country: 'MX',
        currency: 'MXN',
        locale: 'es-MX',
        timeZone: 'America/Mazatlan',
        catalogChoice: 'template',
        selectedProducts: ['espresso', 'americano', 'latte'],
      },
    },
  });
  expect(prepared.ok()).toBe(true);
  await page.goto(web);
  await expect(page.locator('.guided-onboarding')).toHaveAttribute('data-step', String(step));
}

export async function completeOnboarding(page: Page) {
  const organizationId = await activeOrganizationId(page);
  if (organizationId === '10000000-0000-4000-8000-000000000001') {
    const currentResponse = await page.request.get(
      `${api}/v1/organizations/${organizationId}/onboarding`,
    );
    expect(currentResponse.ok()).toBe(true);
    const current = (await currentResponse.json()) as {
      status: string;
      businessType?: string;
      templateKey?: string;
      answers?: { seededPersona?: boolean };
    };
    expect(current).toMatchObject({
      status: 'COMPLETED',
      businessType: 'RETAIL_STORE',
      templateKey: 'retail-store',
      answers: { seededPersona: true },
    });
    await page.goto(web);
    await expect(page.locator('.product-main')).toBeVisible({ timeout: 20_000 });
    return;
  }
  await setOnboardingStep(page, 10);
  const csrf =
    (await page.context().cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
  const current = (await (
    await page.request.get(`${api}/v1/organizations/${organizationId}/onboarding`)
  ).json()) as { version: number };
  const completed = await page.request.post(
    `${api}/v1/organizations/${organizationId}/onboarding/complete`,
    { headers: { 'x-csrf-token': csrf }, data: { version: current.version } },
  );
  expect(completed.ok()).toBe(true);
  await page.goto(web);
  await expect(page.locator('.product-main')).toBeVisible({ timeout: 20_000 });
}

export async function loginIsolatedOnboarding(page: Page) {
  const fixture = createCleanBusiness();
  await loginClean(page, fixture.email);
  return fixture;
}

function testCaller() {
  return (
    new Error().stack
      ?.split('\n')
      .find((line) => line.includes('.spec.ts'))
      ?.trim() ?? 'unknown'
  );
}

export async function activeOrganizationId(page: Page) {
  const selected = await page.evaluate(() => localStorage.getItem('nexo.active-organization'));
  if (selected) return selected;
  const response = await page.request.get(`${api}/v1/organizations`);
  expect(response.ok()).toBe(true);
  const organizations = (await response.json()) as { id: string; status: string }[];
  const active = organizations.find(({ status }) => status === 'ACTIVE');
  expect(active?.id).toBeTruthy();
  return active!.id;
}

export async function ensureInventoryLocation(page: Page) {
  const organizationId = await activeOrganizationId(page);
  const locationsResponse = await page.request.get(
    `${api}/v1/organizations/${organizationId}/inventory/locations`,
  );
  expect(locationsResponse.ok()).toBe(true);
  const locations = (await locationsResponse.json()) as { id: string }[];
  if (locations.length) return;
  const branchesResponse = await page.request.get(
    `${api}/v1/organizations/${organizationId}/branches`,
  );
  expect(branchesResponse.ok()).toBe(true);
  const branch = ((await branchesResponse.json()) as { id: string; status: string }[]).find(
    ({ status }) => status === 'ACTIVE',
  );
  expect(branch?.id).toBeTruthy();
  const csrf =
    (await page.context().cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
  const created = await page.request.post(
    `${api}/v1/organizations/${organizationId}/inventory/locations`,
    {
      headers: { 'x-csrf-token': csrf },
      data: {
        branchId: branch!.id,
        type: 'WAREHOUSE',
        code: `FINAL-${Date.now()}`,
        name: 'Almacén Final Touches',
      },
    },
  );
  expect(created.ok()).toBe(true);
}

export async function createProductForOwnerTest(page: Page, prefix = 'Producto QA') {
  const fixture = createCleanBusiness();
  await loginClean(page, fixture.email);
  await completeCleanOnboarding(page, fixture.organizationId);
  await page.goto(`${web}/products`);
  await expect(page.getByRole('heading', { name: 'Productos', level: 1 })).toBeVisible();
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  const name = `${prefix} ${suffix}`;
  await page.getByLabel('Nombre del producto').fill(name);
  await page.getByLabel('SKU comercial (opcional)').fill(`QA-${suffix}`);
  await page.getByRole('button', { name: 'Agregar al catálogo' }).click();
  const card = page.locator('.product-catalog-card').filter({ hasText: name });
  await expect(card).toBeVisible();
  await expect(card).toContainText('Activo');
  await page.waitForTimeout(250);
  return card;
}

export async function createCompletedSaleForOwnerTest(page: Page) {
  const organizationId = '10000000-0000-4000-8000-000000000001';
  const branchId = '20000000-0000-4000-8000-000000000001';
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  const csrf =
    (await page.context().cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
  const writeHeaders = (key: string, version?: number) => ({
    origin: web,
    'x-csrf-token': csrf,
    'idempotency-key': key,
    ...(version ? { 'if-match': String(version) } : {}),
  });
  const product = await page.request.post(`${api}/v1/organizations/${organizationId}/products`, {
    headers: writeHeaders(`owner-receipt-product-${stamp}`),
    data: { name: `Servicio recibo ${stamp}`, sku: `REC-${stamp}`, type: 'SERVICE' },
  });
  expect(product.status()).toBe(201);
  const productId = ((await product.json()) as { id: string }).id;
  const detailResponse = await page.request.get(
    `${api}/v1/organizations/${organizationId}/products/${productId}`,
  );
  expect(detailResponse.status()).toBe(200);
  const detail = (await detailResponse.json()) as { version: number; variants: { id: string }[] };
  const variantId = detail.variants[0]?.id;
  expect(variantId).toBeTruthy();
  expect(
    (
      await page.request.post(
        `${api}/v1/organizations/${organizationId}/products/${productId}/prices`,
        {
          headers: writeHeaders(`owner-receipt-price-${stamp}`),
          data: { variantId, amount: '50.00', currency: 'MXN', taxProfileKey: 'MX_STANDARD' },
        },
      )
    ).status(),
  ).toBe(201);
  expect(
    (
      await page.request.post(
        `${api}/v1/organizations/${organizationId}/products/${productId}/activate`,
        {
          headers: writeHeaders(`owner-receipt-activate-${stamp}`),
          data: { version: detail.version },
        },
      )
    ).status(),
  ).toBe(201);
  const saleResponse = await page.request.post(`${api}/v1/organizations/${organizationId}/sales`, {
    headers: writeHeaders(`owner-receipt-sale-${stamp}`),
    data: { branchId, currency: 'MXN', channel: 'API', businessDate: '2026-07-17' },
  });
  expect(saleResponse.status()).toBe(201);
  const sale = (await saleResponse.json()) as { id: string; version: number };
  expect(
    (
      await page.request.post(`${api}/v1/organizations/${organizationId}/sales/${sale.id}/items`, {
        headers: writeHeaders(`owner-receipt-item-${stamp}`, sale.version),
        data: { productVariantId: variantId, quantity: '1' },
      })
    ).status(),
  ).toBe(201);
  expect(
    (
      await page.request.post(
        `${api}/v1/organizations/${organizationId}/sales/${sale.id}/checkout`,
        {
          headers: writeHeaders(`owner-receipt-checkout-${stamp}`, 2),
        },
      )
    ).status(),
  ).toBe(201);
  expect(
    (
      await page.request.post(
        `${api}/v1/organizations/${organizationId}/sales/${sale.id}/payments`,
        {
          headers: writeHeaders(`owner-receipt-payment-${stamp}`),
          data: {
            method: 'CARD_EXTERNAL',
            amountMinor: '5800',
            providerReference: `owner-approved-${stamp}`,
          },
        },
      )
    ).status(),
  ).toBe(201);
  expect(
    (
      await page.request.post(
        `${api}/v1/organizations/${organizationId}/sales/${sale.id}/complete`,
        {
          headers: writeHeaders(`owner-receipt-complete-${stamp}`, 4),
        },
      )
    ).status(),
  ).toBe(201);
  expect(
    (
      await page.request.post(
        `${api}/v1/organizations/${organizationId}/sales/${sale.id}/receipt`,
        {
          headers: writeHeaders(`owner-receipt-initial-${stamp}`),
        },
      )
    ).status(),
  ).toBe(201);
  return sale.id;
}

export function expectClean(audit: ReturnType<typeof browserAudit>) {
  expect(audit.consoleMessages).toEqual([]);
  expect(audit.failedRequests).toEqual([]);
  expect(audit.httpFailures).toEqual([]);
}

export async function chooseNexoSelect(
  page: Page,
  label: string | RegExp,
  option: string | RegExp | number,
) {
  const trigger = page.getByRole('combobox', { name: label });
  await trigger.click();
  const listbox = page.getByRole('listbox').last();
  await expect(listbox).toBeVisible();
  const options = listbox.locator('[role=option]:not([aria-disabled=true])');
  if (typeof option === 'number') await options.nth(option).click();
  else await listbox.getByRole('option', { name: option }).click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  return trigger;
}

export async function chooseCustomNexoSelect(page: Page, label: string | RegExp, value: string) {
  const trigger = page.getByRole('combobox', { name: label });
  await trigger.click();
  const search = page.getByRole('searchbox', {
    name: typeof label === 'string' ? `Buscar en ${label}` : label,
  });
  await expect(search).toBeVisible();
  await search.fill(value);
  await search.press('Enter');
  await expect(trigger).toHaveAttribute('data-value', value);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  return trigger;
}

export const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);
