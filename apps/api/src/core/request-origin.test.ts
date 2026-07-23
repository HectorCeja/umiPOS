import { describe, expect, it } from 'vitest';
import { validateRequestOrigin } from './request-origin.js';

const trusted = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.100.87:3000',
]);

const request = (origin?: string, referer?: string) => ({
  method: 'POST',
  headers: { ...(origin ? { origin } : {}), ...(referer ? { referer } : {}) },
});

describe('validateRequestOrigin', () => {
  it.each([...trusted])('accepts the exact trusted origin %s', (origin) => {
    expect(validateRequestOrigin(request(origin), trusted)).toBe('allowed');
  });
  it.each([
    'http://192.168.100.87.evil.com:3000',
    'http://192.168.100.88:3000',
    'http://evil.com/?origin=http://192.168.100.87:3000',
  ])('rejects untrusted or malicious origin %s', (origin) => {
    expect(validateRequestOrigin(request(origin), trusted)).toBe('rejected');
  });
  it('validates Referer when Origin is unavailable', () => {
    expect(
      validateRequestOrigin(request(undefined, 'http://192.168.100.87:3000/login'), trusted),
    ).toBe('allowed');
  });
});
