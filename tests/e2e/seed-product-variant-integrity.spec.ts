import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const OWNER_PRODUCT_ID = '7c000000-0000-4000-8000-000000000001';
const OWNER_VARIANT_ID = '7c000000-0000-4000-8000-000000000002';
test('seed elimina dependencias QA antes del producto y no limpia tenants owner', async () => {
  const source = await readFile('packages/database/prisma/seed.ts', 'utf8');
  const qa = source.indexOf(
    'transaction.productVariant.deleteMany({ where: { tenantId: alpha2TenantId } })',
  );
  const product = source.indexOf(
    'transaction.product.deleteMany({ where: { tenantId: alpha2TenantId } })',
  );
  expect(qa).toBeGreaterThan(0);
  expect(product).toBeGreaterThan(qa);
  expect(source).not.toContain(
    'for (const organization of organizations) {\n  await prisma.$transaction(async (transaction) => {\n    await transaction.$executeRaw`SELECT set_config',
  );
});

test('PostgreSQL revierte completamente una preparación fallida simulada', async () => {
  const failedTransaction = spawnSync(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres',
      'psql',
      '-v',
      'ON_ERROR_STOP=1',
      '-U',
      'nexo_admin',
      '-d',
      'nexo',
    ],
    {
      encoding: 'utf8',
      input: `BEGIN;
UPDATE products SET name = 'NO DEBE PERSISTIR' WHERE id = '${OWNER_PRODUCT_ID}';
UPDATE product_variants SET product_id = gen_random_uuid() WHERE id = '${OWNER_VARIANT_ID}';
COMMIT;`,
    },
  );

  expect(failedTransaction.status).not.toBe(0);
  expect(failedTransaction.stderr).toContain('product_variants_tenant_id_product_id_fkey');

  const verification = spawnSync(
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
      `SELECT name FROM products WHERE id = '${OWNER_PRODUCT_ID}';`,
    ],
    { encoding: 'utf8' },
  );

  expect(verification.status).toBe(0);
  expect(verification.stdout.trim()).toBe('Producto persistente owner');
});
