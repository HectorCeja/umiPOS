import { createHash } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const pendingDir = path.join(root, 'artifacts/notifications/pending');
const delays = [0, 5000, 15000, 30000, 60000, 120000];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const classify = (error, status = 0) => {
  if (status >= 400 && status < 500) return 'HTTP_4XX';
  if (status >= 500) return 'HTTP_5XX';
  const code = error?.cause?.code || error?.code || '';
  if (String(code).includes('ENOTFOUND')) return 'DNS_ERROR';
  if (String(code).includes('CERT') || String(code).includes('TLS')) return 'TLS_ERROR';
  if (String(code).includes('TIMEOUT') || error?.name === 'AbortError') return 'CONNECTION_TIMEOUT';
  if (String(code).includes('RESET')) return 'CONNECTION_RESET';
  if (String(code).includes('UNREACH')) return 'NETWORK_UNREACHABLE';
  return 'UNKNOWN';
};
const configuration = async () => {
  let prior = {};
  try {
    prior = JSON.parse(
      await readFile(path.join(root, 'artifacts/final-artwork-review/ntfy-response.json'), 'utf8'),
    );
  } catch {}
  const topic = process.env.NTFY_TOPIC || prior.topic;
  const base = process.env.NTFY_URL || 'https://ntfy.sh';
  if (!topic) return { error: 'CONFIGURATION_MISSING' };
  const url = base.endsWith(`/${topic}`) ? base : `${base.replace(/\/$/, '')}/${topic}`;
  return { url, token: process.env.NTFY_TOKEN };
};
async function deliver(notification, resultPath, pendingPath) {
  const config = await configuration();
  const attempts = [];
  if (config.error) {
    await mkdir(pendingDir, { recursive: true });
    await writeFile(
      pendingPath,
      `${JSON.stringify({ notificationId: notification.id, phase: notification.phase, title: notification.title, message: notification.message, createdAt: notification.createdAt, attemptCount: 0, lastAttemptAt: null, sanitizedErrorCategory: config.error, deliveryStatus: 'PENDING', retryCommand: 'pnpm notifications:retry', artifactsPath: notification.artifactsPath, qualityGateVerdict: notification.verdict }, null, 2)}\n`,
    );
    return finish(config.error, 'PENDING');
  }
  try {
    await lookup(new URL(config.url).hostname);
  } catch {}
  for (let index = 0; index < delays.length; index++) {
    if (index > 0) await sleep(delays[index]);
    const started = Date.now();
    let status = 0,
      category = null,
      deliveryId = null;
    try {
      const headers = { Title: notification.title, 'User-Agent': 'nexo-notifications/1.0' };
      if (config.token) headers.Authorization = `Bearer ${config.token}`;
      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body: notification.message,
        signal: AbortSignal.timeout(10000),
      });
      status = response.status;
      const body = await response.text();
      if (response.ok && !/\"error\"\s*:/.test(body)) {
        try {
          deliveryId = JSON.parse(body).id ?? null;
        } catch {}
        attempts.push({
          timestamp: new Date(started).toISOString(),
          httpStatus: status,
          durationMs: Date.now() - started,
          errorCategory: null,
        });
        return finish(null, 'SENT', deliveryId);
      }
      category = classify(null, status);
    } catch (error) {
      category = classify(error);
    }
    attempts.push({
      timestamp: new Date(started).toISOString(),
      httpStatus: status,
      durationMs: Date.now() - started,
      errorCategory: category,
    });
    if (category === 'HTTP_4XX') break;
  }
  const safe = {
    notificationId: notification.id,
    phase: notification.phase,
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt,
    attemptCount: attempts.length,
    lastAttemptAt: attempts.at(-1)?.timestamp,
    sanitizedErrorCategory: attempts.at(-1)?.errorCategory,
    deliveryStatus: 'PENDING',
    retryCommand: 'pnpm notifications:retry',
    artifactsPath: notification.artifactsPath,
    qualityGateVerdict: notification.verdict,
  };
  await mkdir(pendingDir, { recursive: true });
  await writeFile(pendingPath, `${JSON.stringify(safe, null, 2)}\n`);
  await sleep(120000);
  const finalStarted = Date.now();
  try {
    const headers = { Title: notification.title, 'User-Agent': 'nexo-notifications/1.0' };
    if (config.token) headers.Authorization = `Bearer ${config.token}`;
    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: notification.message,
      signal: AbortSignal.timeout(10000),
    });
    const body = await response.text();
    attempts.push({
      timestamp: new Date(finalStarted).toISOString(),
      httpStatus: response.status,
      durationMs: Date.now() - finalStarted,
      errorCategory: response.ok ? null : classify(null, response.status),
    });
    if (response.ok && !/\"error\"\s*:/.test(body)) {
      let deliveryId = null;
      try {
        deliveryId = JSON.parse(body).id ?? null;
      } catch {}
      return finish(null, 'SENT', deliveryId);
    }
  } catch (error) {
    attempts.push({
      timestamp: new Date(finalStarted).toISOString(),
      httpStatus: 0,
      durationMs: Date.now() - finalStarted,
      errorCategory: classify(error),
    });
  }
  return finish(attempts.at(-1)?.errorCategory, 'PENDING');

  async function finish(errorCategory, status = 'FAILED', deliveryId = null) {
    const result = {
      title: notification.title,
      message: notification.message,
      timestamp: new Date().toISOString(),
      totalAttempts: attempts.length,
      attempts,
      httpStatus: attempts.at(-1)?.httpStatus ?? 0,
      result: status,
      errorCategory,
      deliveryId,
      pendingRecordPath: status === 'PENDING' ? path.relative(root, pendingPath) : null,
      retryScriptResult: status,
      secretsExposed: false,
    };
    await mkdir(path.dirname(resultPath), { recursive: true });
    await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`);
    return result;
  }
}
const definitions = {
  part2: {
    phase: 'Flutter Design Parity Part 2',
    title: 'NEXO Flutter Parity — Parte 2 completada',
    message:
      'La Component Library Flutter oficial quedó implementada con controles, surfaces, cards, overlays, forms, data display, accessibility, interaction tests, showcase y goldens conforme al Design Language V1. Revisar docs/flutter y artifacts/flutter-design-parity/part-2/.',
    artifactsPath: 'artifacts/flutter-design-parity/part-2/',
    verdict: 'CONDITIONALLY COMPLETE',
  },
  part3: {
    phase: 'Flutter Design Parity Part 3',
    title: 'NEXO Flutter Parity — Parte 3 completada',
    message:
      'LivingScene, artwork, Motion, Reduced Motion, quality modes, lifecycle, accesibilidad y performance quedaron implementados conforme al Design Language V1. Revisar docs/flutter y artifacts/flutter-design-parity/part-3/.',
    artifactsPath: 'artifacts/flutter-design-parity/part-3/',
    verdict: 'COMPLETE',
  },
  part4: {
    phase: 'Flutter Design Parity Part 4',
    title: 'NEXO Flutter Parity — Parte 4 incompleta',
    message:
      'La aplicación POS Flutter requiere intervención antes de la certificación final. Revisar QUALITY_GATE y artifacts/flutter-design-parity/part-4/.',
    artifactsPath: 'artifacts/flutter-design-parity/part-4/',
    verdict: 'INCOMPLETE',
  },
};
async function sendNamed(name) {
  const base = definitions[name];
  const createdAt = new Date().toISOString();
  const id = `${name}-${createHash('sha256').update(createdAt).digest('hex').slice(0, 12)}`;
  const notification = { ...base, id, createdAt };
  const dir = path.join(root, base.artifactsPath);
  const pending = path.join(
    pendingDir,
    `flutter-parity-${name}-${createdAt.replaceAll(':', '-')}.json`,
  );
  const result = await deliver(
    notification,
    path.join(dir, name === 'part2' ? 'ntfy-retry-result.json' : 'ntfy-result.json'),
    pending,
  );
  process.stdout.write(
    `${JSON.stringify({ phase: name, result: result.result, attempts: result.totalAttempts, httpStatus: result.httpStatus, errorCategory: result.errorCategory, secretsExposed: false })}\n`,
  );
  if (name === 'part2')
    await writeFile(
      path.join(dir, 'NTFY_RETRY.md'),
      `# Part 2 ntfy recovery\n\nResult: **${result.result}**  \nAttempts: ${result.totalAttempts}  \nHTTP: ${result.httpStatus}  \nHistorical verdict remains traceable.\n`,
    );
  else if (name === 'part3')
    await writeFile(
      path.join(dir, 'NTFY_DELIVERY.md'),
      `# Part 3 ntfy delivery\n\nResult: **${result.result}**  \nAttempts: ${result.totalAttempts}  \nHTTP: ${result.httpStatus}  \nSecrets exposed: false.\n`,
    );
  else
    await writeFile(
      path.join(dir, 'NTFY_DELIVERY.md'),
      `# Part 4 ntfy delivery\n\nTitle: ${base.title}  \nTimestamp: ${result.timestamp}  \nResult: **${result.result}**  \nAttempts: ${result.totalAttempts}  \nHTTP: ${result.httpStatus}  \nPending: ${result.pendingRecordPath ?? 'none'}  \nSecrets exposed: false.\n`,
    );
  return result;
}
if (process.argv.includes('--retry-pending')) {
  await mkdir(pendingDir, { recursive: true });
  const files = (await readdir(pendingDir)).filter((file) => file.endsWith('.json'));
  for (const file of files) {
    const pending = JSON.parse(await readFile(path.join(pendingDir, file), 'utf8'));
    const name = pending.phase.includes('Part 2')
      ? 'part2'
      : pending.phase.includes('Part 4')
        ? 'part4'
        : 'part3';
    await sendNamed(name);
  }
} else {
  const name = process.argv.includes('--part2')
    ? 'part2'
    : process.argv.includes('--part4')
      ? 'part4'
      : 'part3';
  await sendNamed(name);
}
