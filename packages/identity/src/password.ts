export type PasswordPolicy = Readonly<{
  minimumLength: number;
  maximumLength: number;
  algorithm: 'argon2id';
  algorithmVersion: number;
  memoryKiB: number;
  passes: number;
  parallelism: number;
  historyDepth: number;
  expirationDays?: number;
}>;

export type PasswordCredential = Readonly<{
  userId: string;
  hash: string;
  salt: string;
  algorithm: 'argon2id';
  algorithmVersion: number;
  memoryKiB: number;
  passes: number;
  parallelism: number;
  mustChange: boolean;
  createdAt: Date;
  changedAt: Date;
  expiresAt?: Date;
}>;

export class InvalidPasswordPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordPolicyError';
  }
}

export function validatePasswordPolicy(policy: PasswordPolicy): PasswordPolicy {
  if (policy.minimumLength < 15 || policy.maximumLength < 64) {
    throw new InvalidPasswordPolicyError('Password lengths violate the NIST/OWASP baseline');
  }
  if (policy.maximumLength < policy.minimumLength) {
    throw new InvalidPasswordPolicyError('Maximum length must not be below minimum length');
  }
  if (policy.memoryKiB < 19_456 || policy.passes < 2 || policy.parallelism < 1) {
    throw new InvalidPasswordPolicyError('Argon2id work factors are below the OWASP baseline');
  }
  if (
    policy.historyDepth < 0 ||
    (policy.expirationDays !== undefined && policy.expirationDays < 1)
  ) {
    throw new InvalidPasswordPolicyError('Password lifecycle values must be non-negative');
  }
  return Object.freeze({ ...policy });
}

export function credentialNeedsRehash(
  credential: PasswordCredential,
  policy: PasswordPolicy,
): boolean {
  return (
    credential.algorithmVersion !== policy.algorithmVersion ||
    credential.memoryKiB < policy.memoryKiB ||
    credential.passes < policy.passes ||
    credential.parallelism < policy.parallelism
  );
}
