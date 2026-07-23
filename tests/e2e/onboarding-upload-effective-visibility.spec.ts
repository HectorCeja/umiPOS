import { expect, test } from '@playwright/test';
import { openCatalog, uploadThroughChooser } from './last-two-blockers.helpers';

test('panel nunca queda visualmente vacío y permite continuar sin volver atrás', async ({
  page,
}) => {
  const { form } = await openCatalog(page);
  await uploadThroughChooser(page);
  await expect(page.locator('.nexo-file-upload__preview')).toBeVisible();
  const visibleContent = await page.locator('.onboarding-content').evaluate(
    (panel) =>
      [...panel.querySelectorAll<HTMLElement>('h1,h2,input,textarea,button,img')].filter(
        (element) => {
          const box = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return (
            box.width > 0 &&
            box.height > 0 &&
            box.bottom > 0 &&
            box.top < innerHeight &&
            style.visibility === 'visible'
          );
        },
      ).length,
  );
  expect(visibleContent).toBeGreaterThanOrEqual(5);
  await expect(form.getByLabel('Nombre')).toHaveValue('Latte geometría real');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('.onboarding-content')).not.toBeEmpty();
});
