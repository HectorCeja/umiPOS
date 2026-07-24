import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const expected = JSON.parse(
  readFileSync(resolve('tests/e2e/fixtures/canonical-invariants.json'), 'utf8'),
);
const sql = `SELECT jsonb_build_object(
  'user', jsonb_build_object('displayName',u.display_name,'locale',u.locale,'timeZone',u.time_zone,'avatarUrl',u.avatar_url,'status',u.status),
  'organization', jsonb_build_object('name',o.name,'countryCode',o.country_code,'defaultCurrency',o.default_currency,'defaultLocale',o.default_locale,'timeZone',o.time_zone,'status',o.status),
  'branch', jsonb_build_object('name',b.name,'code',b.code,'status',b.status),
  'onboarding', jsonb_build_object('status',ob.status,'currentStep',ob.current_step,'businessType',ob.business_type,'templateKey',ob.template_key,'answers',ob.answers),
  'membership', jsonb_build_object('role',m.role,'accessScope',m.access_scope,'status',m.status)
) FROM users u, organizations o, branches b, organization_onboarding ob, memberships m
WHERE u.id='41000000-0000-4000-8000-000000000001'
AND o.id='10000000-0000-4000-8000-000000000001'
AND b.id='20000000-0000-4000-8000-000000000001'
AND ob.tenant_id=o.id AND m.tenant_id=o.id AND m.principal_id=u.id;`;
const result = spawnSync(
  'docker',
  ['compose', 'exec', '-T', 'postgres', 'psql', '-U', 'nexo_admin', '-d', 'nexo', '-Atc', sql],
  { encoding: 'utf8' },
);
if (result.status !== 0) {
  if (result.stderr) process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}
const actual = JSON.parse(result.stdout.trim());
const diffs = [];
compare('', expected, actual);
const report = { checkedAt: new Date().toISOString(), expected, actual, diffs };
const output = process.env.NEXO_E2E_INVARIANT_REPORT;
if (output) writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = diffs.length ? 1 : 0;

function compare(path, left, right) {
  if (left && typeof left === 'object' && !Array.isArray(left)) {
    for (const key of Object.keys(left))
      compare(path ? `${path}.${key}` : key, left[key], right?.[key]);
  } else if (JSON.stringify(left) !== JSON.stringify(right)) {
    diffs.push({ path, expected: left, actual: right });
  }
}
