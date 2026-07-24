import { expect, request, test, type APIRequestContext } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { createCleanUser } from './dynamic-context.helpers';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const alphaId = '10000000-0000-4000-8000-000000000001';
const betaId = '20000000-0000-4000-8000-000000000001';
const fixtureEmails = new Map<string, string>();
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

async function putObject(url: string, bytes: Buffer) {
  const storage = await request.newContext();
  try {
    return await storage.put(url, { data: bytes, headers: { 'content-type': 'image/png' } });
  } finally {
    await storage.dispose();
  }
}

async function login(email: string) {
  const role = email.includes('cashier') ? 'CASHIER' : 'OWNER';
  email =
    fixtureEmails.get(role) ??
    (() => {
      const created = createCleanUser(role).email;
      fixtureEmails.set(role, created);
      return created;
    })();
  const context = await request.newContext({
    baseURL: 'http://127.0.0.1:3001',
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  expect(
    (
      await context.post('/v1/auth/login', {
        data: {
          email,
          password,
          deviceFingerprint: `media-price-${email}`,
          deviceName: 'Certification',
        },
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
  label: string,
) {
  const created = await context.post(`/v1/organizations/${tenantId}/products`, {
    headers,
    data: { name: `${label} ${Date.now()}-${Math.random()}`, type: 'PHYSICAL' },
  });
  expect(created.status()).toBe(201);
  const product = (await created.json()) as { id: string };
  const detail = await context.get(`/v1/organizations/${tenantId}/products/${product.id}`);
  expect(detail.status()).toBe(200);
  const body = (await detail.json()) as { variants: { id: string }[] };
  return { id: product.id, variantId: body.variants[0]!.id };
}

async function intent(
  context: APIRequestContext,
  headers: Record<string, string>,
  tenantId: string,
  productId: string,
  fileName: string,
  contentType = 'image/png',
) {
  return context.post(`/v1/organizations/${tenantId}/products/${productId}/media/uploads`, {
    headers,
    data: { fileName, contentType, altText: 'Certification image' },
  });
}

test.describe.serial('Media and pricing integrity certification', () => {
  test('uses an exact passive-image MIME allowlist', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    const product = await createProduct(alpha.context, alpha.headers, alphaId, 'MIME');
    for (const contentType of ['image/svg+xml', 'image/png; charset=utf-8', 'image/x-icon']) {
      const response = await intent(
        alpha.context,
        alpha.headers,
        alphaId,
        product.id,
        `invalid-${Date.now()}.png`,
        contentType,
      );
      expect(response.status()).toBe(400);
    }
  });

  test('binds finalization to the server-issued product, media and object key', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    const a = await createProduct(alpha.context, alpha.headers, alphaId, 'Media A');
    const b = await createProduct(alpha.context, alpha.headers, alphaId, 'Media B');
    const aIntentResponse = await intent(alpha.context, alpha.headers, alphaId, a.id, 'a.png');
    const bIntentResponse = await intent(alpha.context, alpha.headers, alphaId, b.id, 'b.png');
    expect(aIntentResponse.status()).toBe(201);
    expect(bIntentResponse.status()).toBe(201);
    const aIntent = (await aIntentResponse.json()) as {
      id: string;
      objectKey: string;
      uploadUrl: string;
    };
    const bIntent = (await bIntentResponse.json()) as {
      id: string;
      objectKey: string;
      uploadUrl: string;
    };
    expect(new URL(aIntent.uploadUrl).searchParams.get('X-Amz-Expires')).toBe('900');
    expect((await putObject(aIntent.uploadUrl, png)).status()).toBe(200);
    expect((await putObject(bIntent.uploadUrl, png)).status()).toBe(200);

    const altered = new URL(aIntent.uploadUrl);
    altered.searchParams.set('X-Amz-Signature', '0'.repeat(64));
    expect((await putObject(altered.toString(), png)).status()).toBe(403);

    const foreignVariant = await alpha.context.post(
      `/v1/organizations/${alphaId}/products/${a.id}/media/uploads`,
      {
        headers: alpha.headers,
        data: {
          fileName: 'foreign-variant.png',
          contentType: 'image/png',
          altText: 'Foreign variant',
          variantId: b.variantId,
        },
      },
    );
    expect(foreignVariant.status()).toBe(400);

    const wrongMedia = await alpha.context.post(
      `/v1/organizations/${alphaId}/products/${a.id}/media/complete`,
      { headers: alpha.headers, data: { mediaId: bIntent.id } },
    );
    expect(wrongMedia.status()).toBe(400);
    const finalizations = await Promise.all(
      Array.from({ length: 2 }, () =>
        alpha.context.post(`/v1/organizations/${alphaId}/products/${a.id}/media/complete`, {
          headers: alpha.headers,
          data: { mediaId: aIntent.id },
        }),
      ),
    );
    const finalizationStatuses = finalizations.map((response) => response.status());
    expect(finalizationStatuses.filter((status) => status === 201)).toHaveLength(1);
    expect(finalizationStatuses.filter((status) => status === 400 || status === 409)).toHaveLength(
      1,
    );
    const read = await alpha.context.get(
      `/v1/organizations/${alphaId}/products/${a.id}/media/${aIntent.id}`,
    );
    expect(read.status()).toBe(200);
    expect(read.headers()['content-type']).toContain('image/png');
  });

  test('rejects byte-signature mismatches, empty objects and objects over 5 MiB', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    const product = await createProduct(alpha.context, alpha.headers, alphaId, 'Bytes');
    for (const [name, bytes] of [
      ['html.png', Buffer.from('<html><script>alert(1)</script></html>')],
      ['empty.png', Buffer.alloc(0)],
      ['large.png', Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)])],
    ] as const) {
      const prepared = await intent(alpha.context, alpha.headers, alphaId, product.id, name);
      expect(prepared.status()).toBe(201);
      const media = (await prepared.json()) as { id: string; objectKey: string; uploadUrl: string };
      expect((await putObject(media.uploadUrl, bytes)).status()).toBe(200);
      const completed = await alpha.context.post(
        `/v1/organizations/${alphaId}/products/${product.id}/media/complete`,
        { headers: alpha.headers, data: { mediaId: media.id } },
      );
      expect(completed.status()).toBe(400);
    }
  });

  test('prevents cross-tenant media operations without disclosing metadata', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    const productId = `92000000-0000-4000-8000-${String(Date.now()).slice(-12)}`;
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
        input: `INSERT INTO products (id, tenant_id, name, type, created_by, updated_by, updated_at)
VALUES ('${productId}', '${betaId}', 'Beta media fixture', 'PHYSICAL',
  '20000000-0000-4000-8000-000000000101', '20000000-0000-4000-8000-000000000101', now());`,
      },
    );
    expect(fixture.status, fixture.stderr).toBe(0);
    const response = await alpha.context.post(
      `/v1/organizations/${alphaId}/products/${productId}/media/uploads`,
      {
        headers: alpha.headers,
        data: { fileName: 'foreign.png', contentType: 'image/png', altText: 'x' },
      },
    );
    expect([400, 404]).toContain(response.status());
    expect(JSON.stringify(await response.json())).not.toContain(betaId);
  });

  test('keeps exactly one active price under concurrent creates and enforces organization currency', async () => {
    const alpha = await login('alpha.owner@nexo.local');
    const product = await createProduct(alpha.context, alpha.headers, alphaId, 'Price race');
    const mismatch = await alpha.context.post(
      `/v1/organizations/${alphaId}/products/${product.id}/prices`,
      {
        headers: alpha.headers,
        data: { variantId: product.variantId, amount: '10.00', currency: 'USD' },
      },
    );
    expect(mismatch.status()).toBe(400);

    const responses = await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        alpha.context.post(`/v1/organizations/${alphaId}/products/${product.id}/prices`, {
          headers: alpha.headers,
          data: { variantId: product.variantId, amount: `${10 + index}.00`, currency: 'MXN' },
        }),
      ),
    );
    expect(responses.every((response) => response.status() === 201)).toBeTruthy();
    const sql = spawnSync(
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
        `SELECT count(*) FROM product_prices WHERE tenant_id='${alphaId}' AND product_id='${product.id}' AND variant_id='${product.variantId}' AND currency='MXN' AND active`,
      ],
      { encoding: 'utf8' },
    );
    expect(sql.status, sql.stderr).toBe(0);
    expect(sql.stdout.trim()).toBe('1');
  });

  test('keeps MinIO bucket and objects unavailable anonymously', async () => {
    for (const url of [
      'http://127.0.0.1:9000/nexo-local',
      'http://127.0.0.1:9000/nexo-local/arbitrary',
    ]) {
      const anonymous = await request.newContext();
      const response = await anonymous.get(url);
      expect(response.status()).toBe(403);
      await anonymous.dispose();
    }

    const signed = spawnSync(
      'node',
      [
        '--input-type=module',
        '-e',
        `import {Client} from 'minio'; const client=new Client({endPoint:'127.0.0.1',port:9000,useSSL:false,accessKey:'nexo_local',secretKey:'nexo_local_only'}); console.log(await client.presignedPutObject('nexo-local','certification/expired-${Date.now()}.png',1));`,
      ],
      { cwd: 'apps/api', encoding: 'utf8' },
    );
    expect(signed.status, signed.stderr).toBe(0);
    await new Promise((resolve) => setTimeout(resolve, 2_100));
    expect((await putObject(signed.stdout.trim(), png)).status()).toBe(403);
  });

  test('denies direct media and price administration to a cashier', async () => {
    const owner = await login('alpha.owner@nexo.local');
    const cashier = await login('alpha.cashier@nexo.local');
    const product = await createProduct(owner.context, owner.headers, alphaId, 'Permissions');
    const media = await intent(cashier.context, cashier.headers, alphaId, product.id, 'denied.png');
    expect(media.status()).toBe(403);
    const price = await cashier.context.post(
      `/v1/organizations/${alphaId}/products/${product.id}/prices`,
      {
        headers: cashier.headers,
        data: { variantId: product.variantId, amount: '20.00', currency: 'MXN' },
      },
    );
    expect(price.status()).toBe(403);
  });
});
