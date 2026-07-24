import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const files = process.argv.slice(2);
if (!files.length) throw new Error('Provide one or more Playwright test files.');
const root = process.env.NEXO_E2E_REPORT_ROOT ?? 'artifacts/e2e-results/canonical-checkpoints';
const ledger = [];
mkdirSync(resolve(root), { recursive: true });

for (const [index, file] of files.entries()) {
  const suite = `${String(index + 1).padStart(2, '0')}-${basename(file, '.spec.ts')}`;
  const test = spawnSync(
    process.execPath,
    [resolve('node_modules/@playwright/test/cli.js'), 'test', file, '--workers=1'],
    {
      env: {
        ...process.env,
        NEXO_E2E_PHASE: 'functional',
        NEXO_E2E_REPORT_ROOT: `${root}/${suite}`,
      },
      stdio: 'inherit',
    },
  );
  const invariantPath = resolve(root, `${suite}-canonical.json`);
  const invariant = spawnSync(process.execPath, [resolve('scripts/e2e-canonical-invariants.mjs')], {
    env: { ...process.env, NEXO_E2E_INVARIANT_REPORT: invariantPath },
    encoding: 'utf8',
  });
  const entry = {
    file,
    testExitCode: test.status,
    invariantExitCode: invariant.status,
    invariantReport: invariantPath,
  };
  ledger.push(entry);
  writeFileSync(resolve(root, 'contamination-ledger.json'), `${JSON.stringify(ledger, null, 2)}\n`);
  if (invariant.status !== 0) {
    process.stderr.write(`Canonical drift introduced by ${file}; stopping subgroup.\n`);
    process.exit(1);
  }
}
process.exitCode = ledger.some(({ testExitCode }) => testExitCode !== 0) ? 1 : 0;
