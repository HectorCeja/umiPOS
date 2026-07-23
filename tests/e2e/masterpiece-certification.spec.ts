import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('masterpiece verdict is explicit, honest and keeps Product Certification blocked', async () => {
  const report = await readFile(
    'artifacts/premium-ux-part-4b/MASTERPIECE_CERTIFICATION.md',
    'utf8',
  );
  expect(report).toContain('PART 4B COMPLETE');
  expect(report).toContain('Product Certification continúa bloqueada');
  expect(report).toContain('Flutter runtime permanece pendiente');
});
