import { expect, request, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const alphaId = '10000000-0000-4000-8000-000000000001';
const betaId = '20000000-0000-4000-8000-000000000001';

async function login(email: string) {
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  expect(
    (
      await context.post('/v1/auth/login', {
        data: { email, password, deviceFingerprint: `catalog-${email}`, deviceName: 'Catalog E2E' },
      })
    ).status(),
  ).toBe(200);
  const state = await context.storageState();
  return {
    context,
    headers: {
      origin: 'http://localhost:3000',
      'x-csrf-token': state.cookies.find(({ name }) => name === 'nexo_csrf')!.value,
    },
  };
}

async function createProduct(
  context: APIRequestContext,
  headers: Record<string, string>,
  tenantId: string,
  name: string,
) {
  const response = await context.post(`/v1/organizations/${tenantId}/products`, {
    headers,
    data: { name, type: 'PHYSICAL' },
  });
  expect(response.status()).toBe(201);
  return (await response.json()) as { id: string };
}

test.describe.serial('Product catalog structural integrity', () => {
  test('rejects cross-tenant and missing category references', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    const categoryId = '90000000-0000-4000-8000-000000000098';
    const fixture = spawnSync(
      'docker',
      [
        'compose',
        'exec',
        '-T',
        'postgres',
        'psql',
        '-U',
        'nexo_admin',
        '-d',
        'nexo',
        '-v',
        'ON_ERROR_STOP=1',
      ],
      {
        encoding: 'utf8',
        input: `INSERT INTO product_categories (id, tenant_id, name, slug, updated_at)
VALUES ('${categoryId}', '${betaId}', 'Categoría Beta', 'certification-beta', now())
ON CONFLICT (tenant_id, id) DO NOTHING;`,
      },
    );
    expect(fixture.status, fixture.stderr).toBe(0);

    for (const foreignCategoryId of [categoryId, '90000000-0000-4000-8000-000000000099']) {
      const response = await alpha.context.post(`/v1/organizations/${alphaId}/products`, {
        headers: alpha.headers,
        data: {
          name: `Invalid category ${foreignCategoryId}`,
          type: 'PHYSICAL',
          categoryId: foreignCategoryId,
        },
      });
      expect(response.status()).toBe(400);
    }
  });

  test('rejects a variant belonging to a different product for barcode and price', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    const first = await createProduct(alpha.context, alpha.headers, alphaId, `First ${Date.now()}`);
    const second = await createProduct(
      alpha.context,
      alpha.headers,
      alphaId,
      `Second ${Date.now()}`,
    );
    const secondBody = (await (
      await alpha.context.get(`/v1/organizations/${alphaId}/products/${second.id}`)
    ).json()) as { variants: { id: string }[] };
    const foreignVariantId = secondBody.variants[0]!.id;

    const barcode = await alpha.context.post(
      `/v1/organizations/${alphaId}/products/${first.id}/barcodes`,
      {
        headers: alpha.headers,
        data: { type: 'INTERNAL', value: `X-${Date.now()}`, variantId: foreignVariantId },
      },
    );
    expect(barcode.status()).toBe(400);

    const price = await alpha.context.post(
      `/v1/organizations/${alphaId}/products/${first.id}/prices`,
      {
        headers: alpha.headers,
        data: { variantId: foreignVariantId, amount: '10.00', currency: 'MXN' },
      },
    );
    expect(price.status()).toBe(400);
  });

  test('rejects blank names and preserves optimistic locking', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    const invalid = await alpha.context.post(`/v1/organizations/${alphaId}/products`, {
      headers: alpha.headers,
      data: { name: '   ', type: 'PHYSICAL' },
    });
    expect(invalid.status()).toBe(400);

    const product = await createProduct(
      alpha.context,
      alpha.headers,
      alphaId,
      `Lock ${Date.now()}`,
    );
    const first = await alpha.context.patch(`/v1/organizations/${alphaId}/products/${product.id}`, {
      headers: alpha.headers,
      data: { name: 'Winner', version: 1 },
    });
    expect(first.status()).toBe(200);
    const stale = await alpha.context.patch(`/v1/organizations/${alphaId}/products/${product.id}`, {
      headers: alpha.headers,
      data: { name: 'Lost update', version: 1 },
    });
    expect(stale.status()).toBe(409);
  });

  test('exposes only implemented product types and rejects invalid category parents', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    for (const type of ['PHYSICAL', 'SERVICE']) {
      const response = await alpha.context.post(`/v1/organizations/${alphaId}/products`, {
        headers: alpha.headers,
        data: { name: `${type} ${Date.now()}`, type },
      });
      expect(response.status()).toBe(201);
    }
    for (const type of [
      'BUNDLE',
      'KIT',
      'COMPOSITE',
      'DIGITAL',
      'GIFT_CARD',
      'SUBSCRIPTION',
      'CUSTOM',
    ]) {
      const response = await alpha.context.post(`/v1/organizations/${alphaId}/products`, {
        headers: alpha.headers,
        data: { name: `Unsupported ${type}`, type },
      });
      expect(response.status()).toBe(400);
      expect((await response.json()) as unknown).not.toEqual(
        expect.objectContaining({ stack: expect.anything() }),
      );
    }

    const invalidParent = await alpha.context.post(
      `/v1/organizations/${alphaId}/product-categories`,
      {
        headers: alpha.headers,
        data: {
          name: 'Orphan',
          slug: `orphan-${Date.now()}`,
          parentId: '90000000-0000-4000-8000-000000000099',
        },
      },
    );
    expect(invalidParent.status()).toBe(400);
  });

  test('serializes concurrent duplicate SKU creation and emits one create event', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    const sku = `RACE-${Date.now()}`;
    const before = Number(
      spawnSync(
        'docker',
        [
          'compose',
          'exec',
          '-T',
          'postgres',
          'psql',
          '-U',
          'nexo_admin',
          '-d',
          'nexo',
          '-Atc',
          `SELECT count(*) FROM product_events WHERE tenant_id='${alphaId}' AND event_type='ProductCreated'`,
        ],
        { encoding: 'utf8' },
      ).stdout.trim(),
    );
    const responses = await Promise.all(
      ['A', 'B'].map((suffix) =>
        alpha.context.post(`/v1/organizations/${alphaId}/products`, {
          headers: alpha.headers,
          data: { name: `Race ${suffix}`, type: 'PHYSICAL', sku },
        }),
      ),
    );
    expect(responses.map((response) => response.status()).sort()).toEqual([201, 409]);
    const count = Number(
      spawnSync(
        'docker',
        [
          'compose',
          'exec',
          '-T',
          'postgres',
          'psql',
          '-U',
          'nexo_admin',
          '-d',
          'nexo',
          '-Atc',
          `SELECT count(*) FROM product_events WHERE tenant_id='${alphaId}' AND event_type='ProductCreated'`,
        ],
        { encoding: 'utf8' },
      ).stdout.trim(),
    );
    expect(count - before).toBe(1);
  });

  test('keeps catalog administration unavailable to a cashier', async () => {
    const cashier = await login('alpha.cashier@nexo.local');
    const mutation = await cashier.context.post(`/v1/organizations/${alphaId}/products`, {
      headers: cashier.headers,
      data: { name: 'Forbidden cashier product', type: 'PHYSICAL' },
    });
    expect(mutation.status()).toBe(403);
  });

  test('keeps PostgreSQL RLS default-deny while a pooled context changes tenant', async () => {
    const sql = `BEGIN;
SET LOCAL ROLE nexo_runtime;
SELECT set_config('app.current_tenant_id', '${alphaId}', true);
SELECT count(*) FROM product_categories WHERE tenant_id='${betaId}';
SELECT set_config('app.current_tenant_id', '${betaId}', true);
SELECT count(*) FROM product_categories WHERE tenant_id='${betaId}' AND id='90000000-0000-4000-8000-000000000098';
ROLLBACK;`;
    const result = spawnSync(
      'docker',
      ['compose', 'exec', '-T', 'postgres', 'psql', '-U', 'nexo_admin', '-d', 'nexo', '-Atq'],
      { encoding: 'utf8', input: sql },
    );
    expect(result.status, result.stderr).toBe(0);
    const values = result.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /^\d+$/.test(line));
    expect(values).toEqual(['0', '1']);
  });

  test('canonicalizes variant combinations and serializes barcode races', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    const product = await createProduct(
      alpha.context,
      alpha.headers,
      alphaId,
      `Variant integrity ${Date.now()}`,
    );
    const firstVariant = await alpha.context.post(
      `/v1/organizations/${alphaId}/products/${product.id}/variants`,
      {
        headers: alpha.headers,
        data: { name: 'Black M', optionValues: { color: 'Black', size: 'M' } },
      },
    );
    expect(firstVariant.status()).toBe(201);
    const duplicate = await alpha.context.post(
      `/v1/organizations/${alphaId}/products/${product.id}/variants`,
      {
        headers: alpha.headers,
        data: { name: 'M Black', optionValues: { size: 'm', color: 'black' } },
      },
    );
    expect(duplicate.status()).toBe(409);

    const other = await createProduct(
      alpha.context,
      alpha.headers,
      alphaId,
      `Barcode integrity ${Date.now()}`,
    );
    const value = `INTERNAL-${Date.now()}`;
    const results = await Promise.all(
      [product.id, other.id].map((productId) =>
        alpha.context.post(`/v1/organizations/${alphaId}/products/${productId}/barcodes`, {
          headers: alpha.headers,
          data: { type: 'INTERNAL', value },
        }),
      ),
    );
    expect(results.map((response) => response.status()).sort()).toEqual([201, 409]);
  });
});
