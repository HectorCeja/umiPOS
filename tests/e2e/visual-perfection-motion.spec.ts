import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { login, web } from './owner-corrective.helpers';

test('NexoSelect nace del trigger sin desplazamiento horizontal', async ({ page }) => {
  const css = await readFile('packages/ui/src/styles.css', 'utf8');
  const motion = css.match(/@keyframes nexo-select-enter\s*\{[\s\S]*?\n\}/u)?.[0] ?? '';
  expect(motion).toContain('translateY(var(--nexo-select-entry-y)) scale(0.98)');
  expect(motion).not.toMatch(/translateX|translate3d/u);

  await login(page);
  await page.goto(`${web}/inventory`);
  const trigger = page.getByRole('combobox', { name: 'Producto o presentación' });
  await trigger.click();
  const content = page.locator('.nexo-select-content');
  await expect(content).toBeVisible();
  await expect(content).toHaveCSS('transform-origin', /0px (0px|[\d.]+px)/u);
});
