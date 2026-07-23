import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { login, web } from './owner-corrective.helpers';

test('Archivar usa NexoDestructiveButton ruby glass con iconografía reversible', async ({
  page,
}) => {
  const source = await readFile('apps/web/src/app/control-plane-shell.tsx', 'utf8');
  expect(source).toContain('<NexoDestructiveButton');
  expect(source).not.toMatch(/variant="danger"[\s\S]{0,100}>\s*Archivar/u);

  await login(page);
  await page.goto(`${web}/control-plane/branches`);
  const button = page.getByRole('button', { name: 'Archivar' }).first();
  await expect(button).toHaveClass(/nexo-destructive-button/u);
  await expect(button.locator('svg')).toHaveCount(1);
  const style = await button.evaluate((node) => {
    const computed = getComputedStyle(node);
    return {
      background: computed.backgroundImage,
      backdrop: computed.backdropFilter,
      border: computed.borderColor,
    };
  });
  expect(style.background).toContain('linear-gradient');
  expect(style.backdrop).toContain('blur');
  expect(style.border).not.toBe('rgb(180, 35, 24)');
});
