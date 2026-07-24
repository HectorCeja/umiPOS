import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { browserAudit, expectClean, login, web } from './owner-corrective.helpers';

test('SaveStatus autoritativo usa el provider único en la parte superior derecha', async () => {
  const [experience, primitives, styles] = await Promise.all([
    readFile('packages/ui/src/experience.tsx', 'utf8'),
    readFile('packages/ui/src/primitives.tsx', 'utf8'),
    readFile('packages/ui/src/styles.css', 'utf8'),
  ]);
  expect(experience).toContain('<PremiumToastPortal');
  expect(primitives).toContain("root.id = 'nexo-toast-provider'");
  expect(primitives).toContain('document.body.append(root)');
  expect(styles).toContain('max(var(--nexo-toast-safe-top, 0px), env(safe-area-inset-top))');
});

test('una mutación real de Productos produce toast global sin mover el scroll', async ({
  page,
}) => {
  const audit = browserAudit(page);
  await login(page);
  await page.goto(`${web}/products`);
  await page.locator('.product-catalog-card').first().click();
  await page.getByRole('button', { name: 'Editar producto' }).click();
  const input = page.getByLabel('Nombre').last();
  const original = await input.inputValue();
  await input.fill(`${original} `);
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  const toast = page.locator('body > .nexo-toast-region .nexo-premium-toast').last();
  await expect(toast).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  expectClean(audit);
});
