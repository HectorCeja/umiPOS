import { expect, request, test, type APIRequestContext } from '@playwright/test';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
async function login(email: string) {
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  expect(
    (
      await context.post('/v1/auth/login', {
        data: { email, password, deviceFingerprint: `product-${email}`, deviceName: 'Product E2E' },
      })
    ).status(),
  ).toBe(200);
  const state = await context.storageState();
  return { context, csrf: state.cookies.find(({ name }) => name === 'nexo_csrf')!.value };
}
const headers = (csrf: string) => ({ origin: 'http://localhost:3000', 'x-csrf-token': csrf });
function gtin13(seed: number) {
  const body = String(seed).padStart(12, '0').slice(-12);
  const sum = [...body]
    .reverse()
    .reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 3 : 1), 0);
  return `${body}${String((10 - (sum % 10)) % 10)}`;
}
test.describe.serial('Product Platform with real PostgreSQL and RLS', () => {
  let alpha: APIRequestContext;
  let beta: APIRequestContext;
  let csrf: string;
  let productId: string;
  let variantId: string;
  const alphaId = '10000000-0000-4000-8000-000000000001';
  const betaId = '20000000-0000-4000-8000-000000000001';
  const sku = `E2E-${Date.now()}`;
  test('creates physical product, service and unlimited-attribute variant', async () => {
    ({ context: alpha, csrf } = await login('alpha.owner@nexo.local'));
    ({ context: beta } = await login('beta.owner@nexo.local'));
    const created = await alpha.post(`/v1/organizations/${alphaId}/products`, {
      headers: headers(csrf),
      data: { name: 'Playera E2E', sku, type: 'PHYSICAL', searchTerms: ['playera'] },
    });
    expect(created.status()).toBe(201);
    const product = (await created.json()) as { id: string };
    productId = product.id;
    expect(
      (
        await alpha.post(`/v1/organizations/${alphaId}/products`, {
          headers: headers(csrf),
          data: { name: 'Corte E2E', type: 'SERVICE' },
        })
      ).status(),
    ).toBe(201);
    const variant = await alpha.post(
      `/v1/organizations/${alphaId}/products/${productId}/variants`,
      {
        headers: headers(csrf),
        data: {
          name: 'Azul M 250g',
          sku: `${sku}-V`,
          optionValues: { color: 'Azul', talla: 'M', peso: '250g' },
        },
      },
    );
    expect(variant.status()).toBe(201);
    variantId = ((await variant.json()) as { id: string }).id;
  });
  test('enforces duplicate SKU/barcode and records structured price', async () => {
    expect(
      (
        await alpha.post(`/v1/organizations/${alphaId}/products`, {
          headers: headers(csrf),
          data: { name: 'Duplicado', sku, type: 'PHYSICAL' },
        })
      ).status(),
    ).toBe(409);
    const barcode = { type: 'GTIN', value: gtin13(Date.now()), variantId };
    expect(
      (
        await alpha.post(`/v1/organizations/${alphaId}/products/${productId}/barcodes`, {
          headers: headers(csrf),
          data: barcode,
        })
      ).status(),
    ).toBe(201);
    expect(
      (
        await alpha.post(`/v1/organizations/${alphaId}/products/${productId}/barcodes`, {
          headers: headers(csrf),
          data: barcode,
        })
      ).status(),
    ).toBe(409);
    expect(
      (
        await alpha.post(`/v1/organizations/${alphaId}/products/${productId}/prices`, {
          headers: headers(csrf),
          data: { variantId, amount: '199.90', currency: 'MXN', taxProfileKey: 'MX_STANDARD' },
        })
      ).status(),
    ).toBe(201);
  });
  test('archives/restores and Tenant B cannot read Tenant A', async () => {
    const current = await alpha.get(`/v1/organizations/${alphaId}/products/${productId}`);
    const version = ((await current.json()) as { version: number }).version;
    const archived = await alpha.post(
      `/v1/organizations/${alphaId}/products/${productId}/archive`,
      { headers: headers(csrf), data: { version } },
    );
    expect(archived.status()).toBe(201);
    const archivedBody = (await archived.json()) as { version: number; deletedAt: string };
    expect(archivedBody.deletedAt).toBeTruthy();
    expect(
      (
        await alpha.post(`/v1/organizations/${alphaId}/products/${productId}/restore`, {
          headers: headers(csrf),
          data: { version: archivedBody.version },
        })
      ).status(),
    ).toBe(201);
    // Authorization rejects before repository access; no cross-tenant existence is disclosed.
    expect((await beta.get(`/v1/organizations/${betaId}/products/${productId}`)).status()).toBe(
      403,
    );
  });
});
