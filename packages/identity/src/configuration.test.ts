import { describe, expect, it } from 'vitest';

import { createIdentityConfiguration } from './configuration.js';

describe('Identity configuration', () => {
  it('accepts a secure, explicit configuration', () => {
    const configuration = createIdentityConfiguration({
      defaultLocale: 'es-MX',
      defaultTimeZone: 'America/Mazatlan',
      defaultRegionalFormat: 'es-MX',
      features: {
        magicLinks: false,
        oauth: false,
        passkeys: false,
        passwordless: false,
        sso: false,
        webauthn: false,
      },
      password: {
        algorithm: 'argon2id',
        algorithmVersion: 1,
        historyDepth: 0,
        maximumLength: 128,
        memoryKiB: 19_456,
        minimumLength: 15,
        parallelism: 1,
        passes: 2,
      },
    });
    expect(configuration.password.algorithm).toBe('argon2id');
    expect(Object.isFrozen(configuration.features)).toBe(true);
  });

  it('rejects password work factors below the baseline', () => {
    expect(() =>
      createIdentityConfiguration({
        defaultLocale: 'es-MX',
        defaultTimeZone: 'UTC',
        defaultRegionalFormat: 'es-MX',
        features: {
          magicLinks: false,
          oauth: false,
          passkeys: false,
          passwordless: false,
          sso: false,
          webauthn: false,
        },
        password: {
          algorithm: 'argon2id',
          algorithmVersion: 1,
          historyDepth: 0,
          maximumLength: 128,
          memoryKiB: 1024,
          minimumLength: 15,
          parallelism: 1,
          passes: 1,
        },
      }),
    ).toThrow(/Argon2id/);
  });
});
