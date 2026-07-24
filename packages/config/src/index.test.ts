import { describe, expect, it } from 'vitest';

import {
  authenticationConfigurationFromEnvironment,
  identityConfigurationFromEnvironment,
  parseServerEnvironment,
} from './index.js';

const validEnvironment = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/nexo',
  REDIS_URL: 'redis://localhost:6379',
  S3_ENDPOINT: 'http://localhost:9000',
  S3_ACCESS_KEY: 'access',
  S3_SECRET_KEY: 'secret',
  S3_BUCKET: 'nexo-test',
  MAIL_HOST: 'localhost',
  MAIL_FROM: 'no-reply@nexo.local',
  APP_BASE_URL: 'http://localhost:3000',
  AUTH_TOKEN_HMAC_SECRET: 'test-token-hmac-secret-at-least-32-bytes',
  AUTH_RATE_LIMIT_HMAC_SECRET: 'test-rate-hmac-secret-at-least-32-bytes',
  AUTH_ALLOWED_ORIGINS: 'http://localhost:3000',
  AUTH_ACCESS_TTL_SECONDS: '900',
  AUTH_IDLE_TTL_SECONDS: '1800',
  AUTH_ABSOLUTE_TTL_SECONDS: '43200',
  AUTH_REMEMBER_ABSOLUTE_TTL_SECONDS: '2592000',
  AUTH_PASSWORD_RESET_TTL_SECONDS: '1800',
  AUTH_EMAIL_VERIFICATION_TTL_SECONDS: '86400',
  AUTH_DEVICE_RECOGNITION_TTL_SECONDS: '2592000',
  AUTH_MAX_LOGIN_ATTEMPTS: '10',
  AUTH_LOCK_TTL_SECONDS: '900',
  AUTH_PASSWORD_BLOCKLIST_FILE: '/tmp/nexo-password-blocklist.txt',
  OTEL_SERVICE_NAME: 'test',
  OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
  IDENTITY_DEFAULT_LOCALE: 'es-MX',
  IDENTITY_DEFAULT_TIME_ZONE: 'America/Mazatlan',
  IDENTITY_DEFAULT_REGIONAL_FORMAT: 'es-MX',
  IDENTITY_PASSWORD_MIN_LENGTH: '15',
  IDENTITY_PASSWORD_MAX_LENGTH: '128',
  IDENTITY_PASSWORD_ARGON2_MEMORY_KIB: '19456',
  IDENTITY_PASSWORD_ARGON2_PASSES: '2',
  IDENTITY_PASSWORD_ARGON2_PARALLELISM: '1',
  IDENTITY_PASSWORD_HISTORY_DEPTH: '0',
  IDENTITY_PASSWORD_EXPIRATION_DAYS: '0',
  IDENTITY_FEATURE_OAUTH: 'false',
  IDENTITY_FEATURE_SSO: 'false',
  IDENTITY_FEATURE_PASSKEYS: 'false',
  IDENTITY_FEATURE_WEBAUTHN: 'false',
  IDENTITY_FEATURE_MAGIC_LINKS: 'false',
  IDENTITY_FEATURE_PASSWORDLESS: 'false',
};

describe('parseServerEnvironment', () => {
  it('applies safe development defaults', () => {
    const result = parseServerEnvironment(validEnvironment);
    expect(result.API_PORT).toBe(3001);
    expect(authenticationConfigurationFromEnvironment(result).loginIpRateLimit).toBe(30);
    expect(authenticationConfigurationFromEnvironment(result).loginAccountRateLimit).toBe(10);
    expect(result.S3_FORCE_PATH_STYLE).toBe(true);
    expect(identityConfigurationFromEnvironment(result).features.passkeys).toBe(false);
  });

  it('rejects an invalid database protocol', () => {
    expect(() =>
      parseServerEnvironment({ ...validEnvironment, DATABASE_URL: 'file:test.db' }),
    ).toThrow();
  });

  it('rejects identity password parameters below the security baseline', () => {
    expect(() =>
      parseServerEnvironment({ ...validEnvironment, IDENTITY_PASSWORD_MIN_LENGTH: '8' }),
    ).toThrow();
  });

  it('adds only the configured LAN host during explicit local development', () => {
    const result = parseServerEnvironment({
      ...validEnvironment,
      LOCAL_DEVELOPMENT: 'true',
      DEV_LAN_HOST: '192.168.100.87',
    });
    expect([...authenticationConfigurationFromEnvironment(result).allowedOrigins]).toEqual(
      expect.arrayContaining([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.100.87:3000',
      ]),
    );
  });

  it.each(['http://192.168.100.87', '192.168.100.87:3000', 'host/path'])(
    'rejects malformed DEV_LAN_HOST %s',
    (host) => {
      expect(() =>
        parseServerEnvironment({
          ...validEnvironment,
          LOCAL_DEVELOPMENT: 'true',
          DEV_LAN_HOST: host,
        }),
      ).toThrow();
    },
  );

  it('rejects LAN trust outside explicit local development', () => {
    expect(() =>
      parseServerEnvironment({ ...validEnvironment, DEV_LAN_HOST: '192.168.100.87' }),
    ).toThrow();
  });

  it('requires independent HMAC secrets', () => {
    expect(() =>
      parseServerEnvironment({
        ...validEnvironment,
        AUTH_RATE_LIMIT_HMAC_SECRET: validEnvironment.AUTH_TOKEN_HMAC_SECRET,
      }),
    ).toThrow(/independent/);
  });
});
