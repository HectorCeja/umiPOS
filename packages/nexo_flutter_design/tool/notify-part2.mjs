import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '../..');
const previous = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'artifacts/final-artwork-review/ntfy-response.json'), 'utf8'),
);
const topic = process.env.NTFY_TOPIC || previous.topic;
const configuredUrl = process.env.NTFY_URL || 'https://ntfy.sh';
const url = configuredUrl.endsWith(`/${topic}`)
  ? configuredUrl
  : `${configuredUrl.replace(/\/$/, '')}/${topic}`;
const headers = { Title: 'NEXO Flutter Parity — Parte 2 completada' };
if (process.env.NTFY_TOKEN) headers.Authorization = `Bearer ${process.env.NTFY_TOKEN}`;
const message =
  'La Component Library Flutter oficial quedó implementada con controles, surfaces, cards, overlays, forms, data display, accessibility, interaction tests, showcase y goldens conforme al Design Language V1. Revisar docs/flutter y artifacts/flutter-design-parity/part-2/.';

let response;
let retries = 0;
for (;;) {
  try {
    response = await fetch(url, { method: 'POST', headers, body: message });
  } catch {
    response = null;
  }
  if (response && response.ok) break;
  const temporary =
    !response || response.status === 408 || response.status === 429 || response.status >= 500;
  if (!temporary || retries === 1) break;
  retries += 1;
}

const result = {
  timestamp: new Date().toISOString(),
  httpStatus: response?.status ?? 0,
  retries,
  result: response?.ok ? 'sent' : 'failed',
};
fs.writeFileSync(
  path.join(repoRoot, 'artifacts/flutter-design-parity/part-2/ntfy-result.json'),
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify(result));
if (!response?.ok) process.exit(1);
