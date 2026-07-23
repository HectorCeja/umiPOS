import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('tres prepares consecutivos terminaron READY', async () => {
  for (const run of [1, 2, 3]) {
    const log = await readFile(
      `artifacts/owner-final-acceptance-master-part-2c/logs/prepare-${run}.log`,
      'utf8',
    );
    expect(log).toContain('NEXO READY');
    expect(log).not.toContain('violates RESTRICT');
    expect(log).not.toContain('ELIFECYCLE');
  }
});
