import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('hero evaluation is honest about product and infrastructure limits', async () => {
  const report = await readFile('artifacts/premium-ux-part-4a/HERO_IMAGE_TEST.md', 'utf8');
  expect(report).toContain('pueden funcionar como hero');
  expect(report).toContain('Clientes no se usa como hero');
  expect(report).toContain('Flutter POS requiere una captura nativa futura');
  expect(report).toContain('Behance / Dribbble');
});
