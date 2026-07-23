import type { FastifyRequest } from 'fastify';

export type OriginDecision = 'allowed' | 'absent' | 'rejected';

export function validateRequestOrigin(
  request: Pick<FastifyRequest, 'headers' | 'method'>,
  trustedOrigins: ReadonlySet<string>,
): OriginDecision {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) return 'absent';
  const origin = singleHeader(request.headers.origin);
  const referer = singleHeader(request.headers.referer);
  let candidate = origin;
  if (!candidate && referer) {
    try {
      candidate = new URL(referer).origin;
    } catch {
      return 'rejected';
    }
  }
  if (!candidate) {
    // Native clients do not send browser provenance headers. Browser CORS requests do.
    return request.headers['sec-fetch-mode'] === 'cors' ? 'rejected' : 'absent';
  }
  try {
    return trustedOrigins.has(new URL(candidate).origin) && new URL(candidate).origin === candidate
      ? 'allowed'
      : 'rejected';
  } catch {
    return 'rejected';
  }
}

function singleHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? undefined : value;
}
