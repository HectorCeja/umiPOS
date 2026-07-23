import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('final Red Team records seventy-five new implemented refinements', async () => {
  const [report, styles] = await Promise.all([
    readFile('artifacts/premium-ux-part-4b/FINAL_RED_TEAM.md', 'utf8'),
    readFile('apps/web/src/app/styles.css', 'utf8'),
  ]);
  const rows = report.split('\n').filter((line) => /^\| \d+ \|/u.test(line));
  expect(rows).toHaveLength(75);
  for (const contract of [
    'font-synthesis: none',
    'caret-color',
    ':user-invalid',
    'forced-colors: active',
    '@media print',
  ])
    expect(styles).toContain(contract);
});
