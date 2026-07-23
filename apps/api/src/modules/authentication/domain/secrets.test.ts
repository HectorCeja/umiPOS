import { describe, expect, it } from 'vitest';

import { digestSecret, issueOpaqueSecret, secretDigestMatches } from './secrets.js';

const key = 'test-secret-key-with-at-least-thirty-two-bytes';

describe('opaque authentication secrets', () => {
  it('issues independent 256-bit values and stores deterministic keyed digests', () => {
    const first = issueOpaqueSecret(key);
    const second = issueOpaqueSecret(key);
    expect(first.raw).not.toBe(second.raw);
    expect(first.digest).toHaveLength(64);
    expect(first.digest).toBe(digestSecret(first.raw, key));
  });

  it('compares a presented secret against its session-bound digest', () => {
    const secret = issueOpaqueSecret(key);
    expect(secretDigestMatches(secret.raw, secret.digest, key)).toBe(true);
    expect(secretDigestMatches('wrong-secret', secret.digest, key)).toBe(false);
  });
});
