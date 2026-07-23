import { describe, expect, it } from 'vitest';
import { pinoHttpOptions } from './app.module.js';

describe('API log redaction', () => {
  it('redacts sessions, CSRF and the POS device credential', () => {
    expect(pinoHttpOptions.redact.paths).toEqual(
      expect.arrayContaining([
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["x-csrf-token"]',
        'req.headers["x-nexo-device-credential"]',
        'res.headers["set-cookie"]',
      ]),
    );
  });
});
