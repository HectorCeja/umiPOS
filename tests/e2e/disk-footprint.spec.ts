import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

test('el reporte mide categorías críticas sin modificar datos', () => {
  const report = JSON.parse(
    execFileSync('node', ['scripts/owner-storage.mjs', 'report', '--json'], { encoding: 'utf8' }),
  ) as { categories: Record<string, number>; root: string };
  expect(path.isAbsolute(report.root)).toBe(true);
  for (const category of [
    'project',
    'turbo',
    'nodeModules',
    'artifacts',
    'nextCache',
    'playwright',
    'flutter',
  ]) {
    expect(report.categories[category]).toBeGreaterThanOrEqual(0);
  }
});
