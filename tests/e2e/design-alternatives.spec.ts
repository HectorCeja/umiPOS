import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('important refinements compare three alternatives before selection', async () => {
  const report = await readFile('artifacts/premium-ux-part-4a/DESIGN_ALTERNATIVES.md', 'utf8');
  const rows = report
    .split('\n')
    .filter((line) =>
      /^\| (Jerarquía|Números|Navegación|Shortcuts|Detalle|Tablas|Loading|Mobile|Estados|Scroll)/u.test(
        line,
      ),
    );
  expect(rows.length).toBeGreaterThanOrEqual(8);
  for (const row of rows) {
    const cells = row
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean);
    expect(cells).toHaveLength(5);
    expect(cells.slice(1, 4).every((cell) => cell.length > 0)).toBe(true);
  }
});
