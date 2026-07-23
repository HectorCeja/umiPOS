import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export type OpaqueSecret = Readonly<{ raw: string; digest: string }>;

export function digestSecret(raw: string, key: string): string {
  return createHmac('sha256', key).update(raw, 'utf8').digest('hex');
}

export function issueOpaqueSecret(key: string, bytes = 32): OpaqueSecret {
  const raw = randomBytes(bytes).toString('base64url');
  return Object.freeze({ raw, digest: digestSecret(raw, key) });
}

export function secretDigestMatches(raw: string, expectedDigest: string, key: string): boolean {
  const actual = Buffer.from(digestSecret(raw, key), 'hex');
  const expected = Buffer.from(expectedDigest, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
