import { expect, test } from '@playwright/test';
import { enterAuthenticatedApp } from './premium-ux-part1b.helpers.js';

test('interactive controls answer pointer hover with depth, not color alone', async ({ page }) => {
  await enterAuthenticatedApp(page);
  const help = page.getByRole('button', { name: /Ver guía/ });
  await help.hover();
  await expect
    .poll(() =>
      help.evaluate((element) => ({
        transform: getComputedStyle(element).transform,
        shadow: getComputedStyle(element).boxShadow,
      })),
    )
    .not.toEqual({ transform: 'none', shadow: 'none' });
});
