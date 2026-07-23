import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('retiene última ejecución, último fallo y última certificación', () => {
  const root = mkdtempSync(join(tmpdir(), 'nexo-retention-'));
  const old = new Date(Date.now() - 45 * 86_400_000);
  try {
    for (const name of ['old-run', 'quality-failed', 'product-certification', 'latest-run']) {
      const directory = join(root, 'artifacts', name);
      mkdirSync(directory, { recursive: true });
      writeFileSync(join(directory, 'report.txt'), name);
      utimesSync(directory, old, name === 'latest-run' ? new Date() : old);
    }
    execFileSync(
      'node',
      ['scripts/owner-storage.mjs', 'artifacts-clean', '--root', root, '--apply'],
      {
        env: { ...process.env, NEXO_RETENTION_DAYS: '30', NEXO_RETENTION_RUNS: '1' },
      },
    );
    expect(existsSync(join(root, 'artifacts/old-run'))).toBe(false);
    expect(existsSync(join(root, 'artifacts/quality-failed'))).toBe(true);
    expect(existsSync(join(root, 'artifacts/product-certification'))).toBe(true);
    expect(existsSync(join(root, 'artifacts/latest-run'))).toBe(true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
