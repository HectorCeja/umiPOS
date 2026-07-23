import { expect, test } from '@playwright/test';
import {
  browserAudit,
  completeOnboarding,
  evidence,
  expectClean,
  login,
  web,
} from './owner-corrective.helpers';

test('destructive avatar action is visually separated from upload', async ({ page }) => {
  await login(page);
  await completeOnboarding(page);
  const audit = browserAudit(page);
  await page.goto(`${web}/settings/profile`);
  const remove = page.getByRole('button', { name: 'Eliminar foto' });
  await expect(remove).toBeVisible();
  const upload = page.locator('.nexo-file-upload');
  const uploadBox = await upload.boundingBox();
  const removeBox = await remove.boundingBox();
  expect(
    (removeBox?.y ?? 0) - ((uploadBox?.y ?? 0) + (uploadBox?.height ?? 0)),
  ).toBeGreaterThanOrEqual(12);
  await evidence(page, 'profile-avatar-delete-spacing.png');
  expectClean(audit);
});
