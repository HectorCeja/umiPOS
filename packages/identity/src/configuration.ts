import { validatePasswordPolicy, type PasswordPolicy } from './password.js';

export const identityFeatures = [
  'oauth',
  'sso',
  'passkeys',
  'webauthn',
  'magicLinks',
  'passwordless',
] as const;

export type IdentityFeature = (typeof identityFeatures)[number];
export type IdentityFeatureConfiguration = Readonly<Record<IdentityFeature, boolean>>;

export type IdentityConfiguration = Readonly<{
  defaultLocale: string;
  defaultTimeZone: string;
  defaultRegionalFormat: string;
  password: PasswordPolicy;
  features: IdentityFeatureConfiguration;
}>;

export function createIdentityConfiguration(input: IdentityConfiguration): IdentityConfiguration {
  if (!input.defaultLocale || !input.defaultTimeZone || !input.defaultRegionalFormat) {
    throw new Error('Identity locale, time zone and regional format are required');
  }
  return Object.freeze({
    ...input,
    features: Object.freeze({ ...input.features }),
    password: validatePasswordPolicy(input.password),
  });
}
