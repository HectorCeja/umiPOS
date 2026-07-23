import { expect, test } from '@playwright/test';
import { completeOnboarding, login, web } from './owner-corrective.helpers';

test('primary navigation actions do not use underlines', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  for (const [route, name] of [
    ['/products', 'Crear producto'],
    ['/', 'Ver ventas'],
  ] as const) {
    await page.goto(`${web}${route}`);
    const action = page.getByRole('link', { name, exact: true }).first();
    await expect(action).toBeVisible();
    expect(await action.evaluate((node) => getComputedStyle(node).textDecorationLine)).toBe('none');
  }
});
