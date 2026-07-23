import { expect, test } from '@playwright/test';
import { geometry, openCatalog, uploadThroughChooser } from './last-two-blockers.helpers';

test('file chooser real restaura scrollTop del documento y cada contenedor', async ({ page }) => {
  const { scroller } = await openCatalog(page);
  await scroller.evaluate((element) => {
    element.scrollTop += 91;
  });
  const before = await geometry(page);
  await uploadThroughChooser(page);
  await expect
    .poll(async () => (await geometry(page)).panelScroll)
    .toBeCloseTo(before.panelScroll, 0);
  const after = await geometry(page);
  expect(after.pageScroll).toBe(before.pageScroll);
  expect(['BODY', 'INPUT', 'DIV']).toContain(after.focus);
});
