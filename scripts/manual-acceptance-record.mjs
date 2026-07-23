import { mkdir, readFile, writeFile } from 'node:fs/promises';

const root = 'artifacts/manual-acceptance/current-run';
const source = `${root}/results.md`;
const text = await readFile(source, 'utf8');
const rows = text
  .split('\n')
  .filter((line) => /^\|\s*(MA|[A-Z])-?\d+/u.test(line))
  .map((line) => line.split('|').map((cell) => cell.trim()))
  .filter((cells) => cells.length >= 4);
const statuses = { PASS: 0, FAIL: 0, BLOCKED: 0, NOT_RUN: 0 };
for (const row of rows) {
  const status = row[2]?.replaceAll(' ', '_');
  if (status in statuses) statuses[status] += 1;
}
const criticalNotPassed = rows
  .filter((row) => /critical|crítica|alta/iu.test(row.join(' ')) && row[2] !== 'PASS')
  .map((row) => row[1]);
const summary = {
  generatedAt: new Date().toISOString(),
  source,
  totalRecorded: rows.length,
  statuses,
  criticalNotPassed,
  ownerAcceptanceComplete:
    rows.length > 0 &&
    statuses.FAIL === 0 &&
    statuses.BLOCKED === 0 &&
    statuses.NOT_RUN === 0 &&
    criticalNotPassed.length === 0,
};
await mkdir(root, { recursive: true });
await writeFile(`${root}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`);
await writeFile(
  `${root}/defects.json`,
  `${JSON.stringify(
    rows.filter((row) => row[2] === 'FAIL').map((row) => ({ id: row[1], detail: row.slice(3) })),
    null,
    2,
  )}\n`,
);
console.log(JSON.stringify(summary, null, 2));
if (!summary.ownerAcceptanceComplete) process.exitCode = 2;
