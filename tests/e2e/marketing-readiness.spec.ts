import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('marketing review covers every requested channel without promoting unfinished scope', async () => {
  const report = await readFile('artifacts/premium-ux-part-4b/MARKETING_READINESS.md', 'utf8');
  for (const channel of ['nexo.com', 'Product Hunt', 'Behance', 'Dribbble', 'LinkedIn'])
    expect(report).toContain(channel);
  expect(report).toContain('Clientes no debe aparecer como promesa funcional');
  expect(report).toContain('Product Certification');
});
