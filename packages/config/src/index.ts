import { z } from 'zod';
import { createIdentityConfiguration, type IdentityConfiguration } from '@nexo/identity';

const booleanFromString = z.enum(['true', 'false']).transform((value) => value === 'true');

const serverEnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    API_HOST: z.string().min(1).default('0.0.0.0'),
    API_PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
    DATABASE_URL: z.url().startsWith('postgresql://'),
    REDIS_URL: z.url().startsWith('redis://'),
    S3_ENDPOINT: z.url(),
    S3_REGION: z.string().min(1).default('us-east-1'),
    S3_ACCESS_KEY: z.string().min(1),
    S3_SECRET_KEY: z.string().min(1),
    S3_BUCKET: z.string().min(3),
    S3_FORCE_PATH_STYLE: booleanFromString.default(true),
    MAIL_HOST: z.string().min(1),
    MAIL_PORT: z.coerce.number().int().min(1).max(65_535).default(1025),
    MAIL_FROM: z.email(),
    APP_BASE_URL: z.url(),
    COOKIE_SECURE: booleanFromString.default(true),
    LOCAL_DEVELOPMENT: booleanFromString.default(false),
    DEV_LAN_HOST: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      z.string().trim().min(1).optional(),
    ),
    DEV_WEB_PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    DEV_API_PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
    DEV_OBJECT_STORAGE_PORT: z.coerce.number().int().min(1).max(65_535).default(9000),
    AUTH_TOKEN_HMAC_SECRET: z.string().min(32),
    AUTH_RATE_LIMIT_HMAC_SECRET: z.string().min(32),
    AUTH_ALLOWED_ORIGINS: z.string().min(1),
    AUTH_ACCESS_TTL_SECONDS: z.coerce.number().int().min(300).max(3600),
    AUTH_IDLE_TTL_SECONDS: z.coerce.number().int().min(300).max(86_400),
    AUTH_ABSOLUTE_TTL_SECONDS: z.coerce.number().int().min(3600).max(2_592_000),
    AUTH_REMEMBER_ABSOLUTE_TTL_SECONDS: z.coerce.number().int().min(3600).max(2_592_000),
    AUTH_PASSWORD_RESET_TTL_SECONDS: z.coerce.number().int().min(300).max(3600),
    AUTH_EMAIL_VERIFICATION_TTL_SECONDS: z.coerce.number().int().min(300).max(86_400),
    AUTH_DEVICE_RECOGNITION_TTL_SECONDS: z.coerce.number().int().min(3600).max(7_776_000),
    AUTH_MAX_LOGIN_ATTEMPTS: z.coerce.number().int().min(5).max(100),
    AUTH_LOCK_TTL_SECONDS: z.coerce.number().int().min(60).max(86_400),
    AUTH_PASSWORD_BLOCKLIST_FILE: z.string().min(1),
    IDENTITY_DEFAULT_LOCALE: z.string().min(2).max(35),
    IDENTITY_DEFAULT_TIME_ZONE: z.string().min(1).max(63),
    IDENTITY_DEFAULT_REGIONAL_FORMAT: z.string().min(2).max(35),
    IDENTITY_PASSWORD_MIN_LENGTH: z.coerce.number().int().min(15),
    IDENTITY_PASSWORD_MAX_LENGTH: z.coerce.number().int().min(64),
    IDENTITY_PASSWORD_ARGON2_MEMORY_KIB: z.coerce.number().int().min(19_456),
    IDENTITY_PASSWORD_ARGON2_PASSES: z.coerce.number().int().min(2),
    IDENTITY_PASSWORD_ARGON2_PARALLELISM: z.coerce.number().int().min(1),
    IDENTITY_PASSWORD_HISTORY_DEPTH: z.coerce.number().int().min(0),
    IDENTITY_PASSWORD_EXPIRATION_DAYS: z.coerce.number().int().min(0),
    IDENTITY_FEATURE_OAUTH: booleanFromString,
    IDENTITY_FEATURE_SSO: booleanFromString,
    IDENTITY_FEATURE_PASSKEYS: booleanFromString,
    IDENTITY_FEATURE_WEBAUTHN: booleanFromString,
    IDENTITY_FEATURE_MAGIC_LINKS: booleanFromString,
    IDENTITY_FEATURE_PASSWORDLESS: booleanFromString,
    OTEL_SERVICE_NAME: z.string().min(1),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),
    OTEL_SDK_DISABLED: booleanFromString.default(false),
  })
  .superRefine((environment, context) => {
    if (environment.AUTH_TOKEN_HMAC_SECRET === environment.AUTH_RATE_LIMIT_HMAC_SECRET) {
      context.addIssue({
        code: 'custom',
        path: ['AUTH_RATE_LIMIT_HMAC_SECRET'],
        message: 'Token and rate-limit HMAC secrets must be independent',
      });
    }
    if (environment.DEV_LAN_HOST) {
      const host = environment.DEV_LAN_HOST;
      let valid = false;
      try {
        const parsed = new URL(`http://${host}`);
        valid =
          parsed.hostname === host.toLowerCase() &&
          parsed.port === '' &&
          parsed.pathname === '/' &&
          !parsed.username &&
          !parsed.password;
      } catch {
        valid = false;
      }
      if (!valid) {
        context.addIssue({
          code: 'custom',
          path: ['DEV_LAN_HOST'],
          message: 'DEV_LAN_HOST must be a hostname or IP without scheme, port or path',
        });
      }
      if (!environment.LOCAL_DEVELOPMENT) {
        context.addIssue({
          code: 'custom',
          path: ['DEV_LAN_HOST'],
          message: 'DEV_LAN_HOST is allowed only for explicit local development',
        });
      }
    }
    if (!environment.COOKIE_SECURE && !environment.LOCAL_DEVELOPMENT) {
      context.addIssue({
        code: 'custom',
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE=false is allowed only for explicit local development',
      });
    }
    if (environment.AUTH_IDLE_TTL_SECONDS > environment.AUTH_ABSOLUTE_TTL_SECONDS) {
      context.addIssue({
        code: 'custom',
        path: ['AUTH_IDLE_TTL_SECONDS'],
        message: 'Idle expiry cannot exceed absolute expiry',
      });
    }
    if (environment.AUTH_ABSOLUTE_TTL_SECONDS > environment.AUTH_REMEMBER_ABSOLUTE_TTL_SECONDS) {
      context.addIssue({
        code: 'custom',
        path: ['AUTH_REMEMBER_ABSOLUTE_TTL_SECONDS'],
        message: 'Remember-me expiry cannot be shorter than standard absolute expiry',
      });
    }
  });

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(environment: NodeJS.ProcessEnv): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}

export function identityConfigurationFromEnvironment(
  environment: ServerEnvironment,
): IdentityConfiguration {
  const expirationDays = environment.IDENTITY_PASSWORD_EXPIRATION_DAYS;
  return createIdentityConfiguration({
    defaultLocale: environment.IDENTITY_DEFAULT_LOCALE,
    defaultRegionalFormat: environment.IDENTITY_DEFAULT_REGIONAL_FORMAT,
    defaultTimeZone: environment.IDENTITY_DEFAULT_TIME_ZONE,
    features: {
      magicLinks: environment.IDENTITY_FEATURE_MAGIC_LINKS,
      oauth: environment.IDENTITY_FEATURE_OAUTH,
      passkeys: environment.IDENTITY_FEATURE_PASSKEYS,
      passwordless: environment.IDENTITY_FEATURE_PASSWORDLESS,
      sso: environment.IDENTITY_FEATURE_SSO,
      webauthn: environment.IDENTITY_FEATURE_WEBAUTHN,
    },
    password: {
      algorithm: 'argon2id',
      algorithmVersion: 1,
      historyDepth: environment.IDENTITY_PASSWORD_HISTORY_DEPTH,
      maximumLength: environment.IDENTITY_PASSWORD_MAX_LENGTH,
      memoryKiB: environment.IDENTITY_PASSWORD_ARGON2_MEMORY_KIB,
      minimumLength: environment.IDENTITY_PASSWORD_MIN_LENGTH,
      parallelism: environment.IDENTITY_PASSWORD_ARGON2_PARALLELISM,
      passes: environment.IDENTITY_PASSWORD_ARGON2_PASSES,
      ...(expirationDays > 0 ? { expirationDays } : {}),
    },
  });
}

export type AuthenticationConfiguration = Readonly<{
  tokenHmacSecret: string;
  rateLimitHmacSecret: string;
  allowedOrigins: ReadonlySet<string>;
  appBaseUrl: string;
  cookieSecure: boolean;
  accessTtlSeconds: number;
  idleTtlSeconds: number;
  absoluteTtlSeconds: number;
  rememberAbsoluteTtlSeconds: number;
  passwordResetTtlSeconds: number;
  emailVerificationTtlSeconds: number;
  deviceRecognitionTtlSeconds: number;
  maxLoginAttempts: number;
  lockTtlSeconds: number;
  passwordBlocklistFile: string;
  identity: IdentityConfiguration;
}>;

export function authenticationConfigurationFromEnvironment(
  environment: ServerEnvironment,
): AuthenticationConfiguration {
  return Object.freeze({
    absoluteTtlSeconds: environment.AUTH_ABSOLUTE_TTL_SECONDS,
    accessTtlSeconds: environment.AUTH_ACCESS_TTL_SECONDS,
    allowedOrigins: resolveTrustedWebOrigins(environment),
    appBaseUrl: new URL(environment.APP_BASE_URL).origin,
    cookieSecure: environment.COOKIE_SECURE,
    deviceRecognitionTtlSeconds: environment.AUTH_DEVICE_RECOGNITION_TTL_SECONDS,
    emailVerificationTtlSeconds: environment.AUTH_EMAIL_VERIFICATION_TTL_SECONDS,
    identity: identityConfigurationFromEnvironment(environment),
    idleTtlSeconds: environment.AUTH_IDLE_TTL_SECONDS,
    lockTtlSeconds: environment.AUTH_LOCK_TTL_SECONDS,
    maxLoginAttempts: environment.AUTH_MAX_LOGIN_ATTEMPTS,
    passwordBlocklistFile: environment.AUTH_PASSWORD_BLOCKLIST_FILE,
    passwordResetTtlSeconds: environment.AUTH_PASSWORD_RESET_TTL_SECONDS,
    rateLimitHmacSecret: environment.AUTH_RATE_LIMIT_HMAC_SECRET,
    rememberAbsoluteTtlSeconds: environment.AUTH_REMEMBER_ABSOLUTE_TTL_SECONDS,
    tokenHmacSecret: environment.AUTH_TOKEN_HMAC_SECRET,
  });
}

export function normalizeHttpOrigin(value: string): string {
  const parsed = new URL(value.trim());
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== '/' ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(`Invalid HTTP origin: ${value}`);
  }
  return parsed.origin;
}

/** Exact browser origins trusted by both CORS and CSRF. Never reflects request input. */
export function resolveTrustedWebOrigins(environment: ServerEnvironment): ReadonlySet<string> {
  const origins = new Set(
    environment.AUTH_ALLOWED_ORIGINS.split(',').map((origin) => normalizeHttpOrigin(origin)),
  );
  if (environment.LOCAL_DEVELOPMENT) {
    origins.add(`http://localhost:${String(environment.DEV_WEB_PORT)}`);
    origins.add(`http://127.0.0.1:${String(environment.DEV_WEB_PORT)}`);
    if (environment.DEV_LAN_HOST) {
      origins.add(`http://${environment.DEV_LAN_HOST}:${String(environment.DEV_WEB_PORT)}`);
    }
  }
  return origins;
}
