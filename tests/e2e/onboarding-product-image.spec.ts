import { expect, test } from '@playwright/test';
import { api, browserAudit, evidence, expectClean, onePixelPng } from './owner-corrective.helpers';
import { createCleanBusiness, loginClean } from './dynamic-context.helpers';

type OnboardingState = {
  answers: Record<string, unknown>;
  businessType: string | null;
  status: string;
  templateKey: string | null;
  version: number;
};

async function csrf(page: Parameters<typeof loginClean>[0]) {
  return (await page.context().cookies()).find(({ name }) => name === 'nexo_csrf')?.value ?? '';
}

test('image uploader remains recoverable for valid, invalid, replace and remove operations', async ({
  page,
}) => {
  const fixture = createCleanBusiness();
  const organizationId = fixture.organizationId;
  await loginClean(page, fixture.email);
  const audit = browserAudit(page);
  const stateResponse = await page.request.get(
    `${api}/v1/organizations/${organizationId}/onboarding`,
  );
  expect(stateResponse.ok()).toBe(true);
  const original = (await stateResponse.json()) as OnboardingState;
  try {
    const restarted = await page.request.post(
      `${api}/v1/organizations/${organizationId}/onboarding/restart`,
      {
        headers: { 'x-csrf-token': await csrf(page) },
        data: { version: original.version },
      },
    );
    expect(restarted.ok()).toBe(true);
    const draft = (await restarted.json()) as OnboardingState;
    const prepared = await page.request.put(
      `${api}/v1/organizations/${organizationId}/onboarding`,
      {
        headers: { 'x-csrf-token': await csrf(page) },
        data: {
          version: draft.version,
          currentStep: 3,
          businessType: 'COFFEE_SHOP',
          templateKey: 'coffee-shop',
          answers: {
            businessName: 'Organization Alpha',
            branchName: 'Branch Centro',
            businessType: 'COFFEE_SHOP',
            country: 'MX',
            currency: 'MXN',
            locale: 'es-MX',
            timeZone: 'America/Mazatlan',
            journeyStep: 7,
            catalogChoice: 'custom',
            customProduct: { name: 'Producto imagen QA', image: '' },
          },
        },
      },
    );
    expect(prepared.ok()).toBe(true);
    await page.reload();
    const uploader = page.locator('.guided-onboarding .nexo-file-upload').last();
    await expect(uploader).toBeVisible();
    const input = uploader.locator('input[type=file]');
    await input.setInputFiles({ name: 'first.png', mimeType: 'image/png', buffer: onePixelPng });
    await expect(uploader.getByAltText('Vista previa')).toBeVisible();
    await expect(page.locator('.onboarding-product-builder')).toBeVisible();
    await evidence(
      page,
      'onboarding-product-image-preview.png',
      'artifacts/onboarding-product-image/screenshots',
    );
    await uploader.getByRole('button', { name: 'Eliminar imagen' }).click();
    await expect(uploader.getByAltText('Vista previa')).toHaveCount(0);
    await input.setInputFiles({
      name: 'invalid.png',
      mimeType: 'image/png',
      buffer: Buffer.from('not an image'),
    });
    await expect(uploader.getByRole('alert')).toContainText('PNG, JPEG o WebP válida');
    await expect(page.locator('.onboarding-product-builder')).toBeVisible();
    expectClean(audit);
  } finally {
    const currentResponse = await page.request.get(
      `${api}/v1/organizations/${organizationId}/onboarding`,
    );
    const current = (await currentResponse.json()) as OnboardingState;
    const restarted = await page.request.post(
      `${api}/v1/organizations/${organizationId}/onboarding/restart`,
      {
        headers: { 'x-csrf-token': await csrf(page) },
        data: { version: current.version },
      },
    );
    const clean = (await restarted.json()) as OnboardingState;
    const restored = await page.request.put(
      `${api}/v1/organizations/${organizationId}/onboarding`,
      {
        headers: { 'x-csrf-token': await csrf(page) },
        data: {
          version: clean.version,
          currentStep: 4,
          businessType: original.businessType ?? 'COFFEE_SHOP',
          templateKey: original.templateKey ?? 'coffee-shop',
          answers: original.answers,
        },
      },
    );
    const restoredState = (await restored.json()) as OnboardingState;
    if (original.status === 'COMPLETED') {
      const completed = await page.request.post(
        `${api}/v1/organizations/${organizationId}/onboarding/complete`,
        {
          headers: { 'x-csrf-token': await csrf(page) },
          data: { version: restoredState.version },
        },
      );
      expect(completed.ok()).toBe(true);
    }
  }
});
