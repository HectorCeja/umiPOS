import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('screenshot review records the unedited method and honest module result', async () => {
  const report = await readFile('artifacts/premium-ux-part-4b/SCREENSHOT_REVIEW.md', 'utf8');
  expect(report).toContain('sin edición, filtros ni crop');
  expect(report).toContain('acción dominante');
  expect(report).toContain('Correctamente marcado “Próximamente”');
});
