import { expect, test } from '@playwright/test';
import { browserAudit, expectClean } from './owner-corrective.helpers';
import {
  expectEffectivelyVisible,
  geometry,
  openCatalog,
  uploadThroughChooser,
} from './last-two-blockers.helpers';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
  test(`upload conserva posición visual efectiva en ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const audit = browserAudit(page);
    const { form } = await openCatalog(page);
    const before = await geometry(page);
    expectEffectivelyVisible(before);
    await uploadThroughChooser(page);
    const after = await geometry(page);
    expectEffectivelyVisible(after);
    expect(Math.abs(after.panelScroll - before.panelScroll)).toBeLessThanOrEqual(2);
    expect(Math.abs(after.pageScroll - before.pageScroll)).toBeLessThanOrEqual(2);
    expect(Math.abs(after.heading.top - before.heading.top)).toBeLessThanOrEqual(2);
    await expect(form.getByAltText('Vista previa')).toBeVisible();
    expectClean(audit);
  });
}
