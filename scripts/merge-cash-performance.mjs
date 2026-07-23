import { readFile, writeFile } from 'node:fs/promises';

const directory = 'artifacts/cash-certification/performance';
const report = JSON.parse(await readFile(`${directory}/results.json`, 'utf8'));
const sampleFiles = ['refund-results.json', 'worker-results.json'];
const percentile = (values, value) =>
  [...values].sort((a, b) => a - b)[Math.max(0, Math.ceil(values.length * value) - 1)] ?? 0;

for (const file of sampleFiles) {
  const groups = JSON.parse(await readFile(`${directory}/${file}`, 'utf8'));
  for (const [name, values] of Object.entries(groups)) {
    report.results[name] = {
      p50Ms: Number(percentile(values, 0.5).toFixed(2)),
      p95Ms: Number(percentile(values, 0.95).toFixed(2)),
      maxMs: Number(Math.max(...values).toFixed(2)),
      samples: values.length,
    };
  }
}
report.operationCount = Object.keys(report.results).length;
await writeFile(`${directory}/results.json`, `${JSON.stringify(report, null, 2)}\n`);
if (report.operationCount !== 34) {
  throw new Error(`Expected 34 Cash performance operations, found ${report.operationCount}`);
}
