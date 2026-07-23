import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { enterAuthenticatedApp } from './premium-ux-part1b.helpers.js';

test('page, card, dialog, backdrop, tooltip and help use official motion tokens', async () => {
  const [ui, web] = await Promise.all([
    readFile('packages/ui/src/styles.css', 'utf8'),
    readFile('apps/web/src/app/styles.css', 'utf8'),
  ]);
  for (const selector of [
    'nexo-page-enter',
    'nexo-surface-enter',
    'nexo-dialog-enter',
    'nexo-backdrop-enter',
    'nexo-toast-enter',
  ])
    expect(ui).toContain(selector);
  expect(ui).not.toContain('var(--nexo-motion-fast)');
  expect(web).toContain('experience-reveal var(--nexo-duration-standard)');
});

test('reduced motion removes repeated and spatial interaction animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterAuthenticatedApp(page);
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
  const duration = await page
    .locator('.premium-card')
    .first()
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(['0s', '0.00001s', '1e-05s']).toContain(duration);
});
