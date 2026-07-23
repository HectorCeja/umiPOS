import { createHash, randomBytes } from 'node:crypto';

export function issueOpaqueToken(bytes = 32): { raw: string; digest: string } {
  const raw = randomBytes(bytes).toString('base64url');
  return { raw, digest: digestToken(raw) };
}

export function digestToken(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex');
}

export function normalizeEmail(email: string): string {
  return email.trim().normalize('NFKC').toLocaleLowerCase('en-US');
}
