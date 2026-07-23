import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('round two records thirty additional implemented improvements', async () => {
  const [roundOne, roundTwo] = await Promise.all([
    readFile('artifacts/premium-ux-part-3a/SELF_CRITIQUE.md', 'utf8'),
    readFile('artifacts/premium-ux-part-3b/SELF_CRITIQUE_ROUND_2.md', 'utf8'),
  ]);
  const rows = roundTwo.split('\n').filter((line) => /^\| \d+ \|/u.test(line));
  expect(rows.length).toBeGreaterThanOrEqual(30);
  expect(roundTwo).toContain('adicionales a Part 3A');
  expect(roundTwo).not.toBe(roundOne);
});
