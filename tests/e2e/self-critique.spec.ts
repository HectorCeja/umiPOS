import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('self critique records at least thirty implemented improvements', async () => {
  const report = await readFile('artifacts/premium-ux-part-3a/SELF_CRITIQUE.md', 'utf8');
  const rows = report.split('\n').filter((line) => /^\|\s*\d+\s*\|/.test(line));
  expect(rows).toHaveLength(30);
  for (const row of rows) expect(row.split('|').filter(Boolean)).toHaveLength(5);
});
