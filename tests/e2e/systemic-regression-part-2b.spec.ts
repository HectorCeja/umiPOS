import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test('barrido sistémico conserva fuentes autoritativas', async () => {
  const [products, onboarding, cash, shell] = await Promise.all(
    [
      'apps/web/src/app/products/page.tsx',
      'apps/web/src/app/product-experience.tsx',
      'apps/web/src/app/cash/cash-console.tsx',
      'apps/web/src/app/global-shell.tsx',
    ].map((p) => readFile(p, 'utf8')),
  );
  expect(products).toContain('ProductIcon');
  expect(onboarding).toContain('productIconChoices');
  expect(cash).not.toContain('id="cash-feedback"');
  expect(shell).toContain('NexoIconButton');
});
