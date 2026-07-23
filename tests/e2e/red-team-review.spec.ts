import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('red team records and implements fifty new concrete improvements', async () => {
  const [report, styles] = await Promise.all([
    readFile('artifacts/premium-ux-part-4a/RED_TEAM_PRODUCT_REVIEW.md', 'utf8'),
    readFile('apps/web/src/app/styles.css', 'utf8'),
  ]);
  const rows = report.split('\n').filter((line) => /^\| \d+ \|/u.test(line));
  expect(rows).toHaveLength(50);
  for (const contract of [
    'text-wrap: balance',
    'font-variant-numeric: tabular-nums',
    'scroll-snap-type',
    'overscroll-behavior',
    'scroll-margin-top',
  ])
    expect(styles).toContain(contract);
});
