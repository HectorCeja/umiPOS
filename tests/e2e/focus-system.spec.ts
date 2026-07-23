import { expect, test } from '@playwright/test';
import { enterAuthenticatedApp } from './premium-ux-part1b.helpers.js';

test('keyboard focus is visible, separated and tokenized', async ({ page }) => {
  await enterAuthenticatedApp(page);
  const search = page.getByRole('button', { name: 'Abrir búsqueda global' });
  for (
    let index = 0;
    index < 20 && !(await search.evaluate((element) => element === document.activeElement));
    index += 1
  ) {
    await page.keyboard.press('Tab');
  }
  await expect(search).toBeFocused();
  const style = await search.evaluate((element) => ({
    outlineStyle: getComputedStyle(element).outlineStyle,
    outlineOffset: getComputedStyle(element).outlineOffset,
  }));
  expect(style.outlineStyle).not.toBe('none');
  expect(style.outlineOffset).toBe('3px');
});
