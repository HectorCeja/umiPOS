import { expect, test } from '@playwright/test';
import {
  browserAudit,
  createProductForOwnerTest,
  evidence,
  expectClean,
  login,
} from './owner-corrective.helpers';

test('product cards preserve horizontal readable text with DevTools-sized viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 720 });
  await login(page);
  await createProductForOwnerTest(page, 'Ramen especial con nombre largo');
  const card = await createProductForOwnerTest(
    page,
    'Ramen artesanal con caldo de cocción lenta y nombre deliberadamente extenso',
  );
  await page.waitForLoadState('networkidle');
  const audit = browserAudit(page);
  const box = await card.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(300);
  expect(
    await card
      .locator('strong')
      .first()
      .evaluate((node) => getComputedStyle(node).wordBreak),
  ).not.toBe('break-all');
  await evidence(page, 'product-card-responsive.png');
  await page.setViewportSize({ width: 600, height: 720 });
  await expect(card.locator('strong').first()).toBeVisible();
  expect((await card.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(280);
  await evidence(page, 'product-card-reduced-viewport.png');
  expectClean(audit);
});
