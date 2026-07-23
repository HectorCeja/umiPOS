import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy } from './content-security-policy';

describe('avatar content security policy', () => {
  it('allows the development API without weakening image policy', () => {
    const value = buildContentSecurityPolicy('nonce', { development: true });
    expect(value).toContain("img-src 'self' blob: data: http://localhost:3001");
    expect(value).not.toContain('img-src *');
    expect(value).toContain("object-src 'none'");
    expect(value).toContain("frame-ancestors 'none'");
  });

  it('allows validated LAN API, storage and live-reload endpoints only in development', () => {
    const value = buildContentSecurityPolicy('nonce', {
      development: true,
      lanHost: '192.168.100.87',
    });
    expect(value).toContain('http://192.168.100.87:3001');
    expect(value).toContain('http://192.168.100.87:9000');
    expect(value).toContain('ws://192.168.100.87:3000');
    expect(value).not.toContain('connect-src *');
  });

  it('never adds DEV_LAN_HOST to production policy', () => {
    const value = buildContentSecurityPolicy('nonce', {
      development: false,
      lanHost: '192.168.100.87',
      apiOrigin: 'https://api.nexo.example',
    });
    expect(value).not.toContain('192.168.100.87');
  });

  it('allows only validated configured production origins', () => {
    const value = buildContentSecurityPolicy('nonce', {
      development: false,
      apiOrigin: 'https://api.nexo.example/v1',
      mediaOrigin: 'https://media.nexo.example/avatar',
    });
    expect(value).toContain('https://api.nexo.example');
    expect(value).toContain('https://media.nexo.example');
    expect(value).not.toContain('localhost:9000');
    expect(value).not.toContain('unsafe-eval');
  });

  it('rejects credentials, non-http protocols and arbitrary request values', () => {
    const value = buildContentSecurityPolicy('nonce', {
      development: false,
      apiOrigin: 'https://user:secret@api.nexo.example',
      mediaOrigin: 'javascript:alert(1)',
    });
    expect(value).toContain("img-src 'self' blob: data:");
    expect(value).not.toContain('secret');
    expect(value).not.toContain('javascript:');
  });
});
