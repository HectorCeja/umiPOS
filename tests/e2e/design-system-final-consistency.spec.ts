import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('toast y Product Card poseen una sola implementación autoritativa', async () => {
  const [primitives, pos, products, styles] = await Promise.all([
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('packages/ui/src/pos.tsx', 'utf8'),
    readFile('apps/web/src/app/products/page.tsx', 'utf8'),
    readFile('packages/ui/src/styles.css', 'utf8'),
  ]);
  expect(primitives.match(/id = 'nexo-toast-provider'/g)).toHaveLength(1);
  expect(primitives).not.toContain('nexo-toast-region--onboarding');
  expect(products).toContain('<ProductCard');
  expect(products).not.toContain('product-catalog-card__media');
  expect(pos).toContain('nexo-product-card__type');
  expect(styles).toContain('object-fit: cover');
  expect(styles).toContain('.nexo-product-card__fallback');
});
