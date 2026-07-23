import { expect, test } from '@playwright/test';
import { login, web } from './owner-corrective.helpers';

test('Equipo centra Enviar invitación y formularios no desbordan', async ({ page }) => {
  await login(page);
  for (const route of [
    '/control-plane/invitations',
    '/control-plane/branches',
    '/products',
    '/inventory',
  ]) {
    await page.goto(`${web}${route}`);
    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(horizontalOverflow).toBeLessThanOrEqual(1);
  }

  await page.goto(`${web}/control-plane/invitations`);
  const form = page.locator('.team-invitation-form');
  const button = form.getByRole('button', { name: 'Enviar invitación' });
  const [formBox, buttonBox] = await Promise.all([form.boundingBox(), button.boundingBox()]);
  expect(formBox).not.toBeNull();
  expect(buttonBox).not.toBeNull();
  const formCenter = formBox!.x + formBox!.width / 2;
  const buttonCenter = buttonBox!.x + buttonBox!.width / 2;
  expect(Math.abs(formCenter - buttonCenter)).toBeLessThanOrEqual(1);
  expect(buttonBox!.width).toBeLessThan(formBox!.width * 0.7);
});
