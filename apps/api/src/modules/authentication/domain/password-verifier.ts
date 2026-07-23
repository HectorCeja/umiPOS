import * as crypto from 'node:crypto';

import type { PasswordPolicy } from '@nexo/identity';

export class PasswordPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordPolicyError';
  }
}

type Argon2Function = (
  algorithm: 'argon2id',
  parameters: {
    message: string;
    nonce: Buffer;
    parallelism: number;
    tagLength: number;
    memory: number;
    passes: number;
  },
  callback: (error: Error | null, derivedKey: Buffer) => void,
) => void;

const argon2 = (crypto as unknown as { argon2: Argon2Function }).argon2;

async function derive(password: string, salt: Buffer, policy: PasswordPolicy): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    argon2(
      'argon2id',
      {
        memory: policy.memoryKiB,
        message: password,
        nonce: salt,
        parallelism: policy.parallelism,
        passes: policy.passes,
        tagLength: 32,
      },
      (error, key) => {
        if (error === null) resolve(key);
        else reject(error);
      },
    );
  });
}

export function validatePassword(password: string, policy: PasswordPolicy): void {
  const length = Array.from(password).length;
  if (length < policy.minimumLength || length > policy.maximumLength) {
    throw new PasswordPolicyError(
      `Password length must be between ${String(policy.minimumLength)} and ${String(policy.maximumLength)} characters`,
    );
  }
}

export async function hashPassword(password: string, policy: PasswordPolicy) {
  validatePassword(password, policy);
  const salt = crypto.randomBytes(16);
  const hash = await derive(password, salt, policy);
  return Object.freeze({
    algorithm: 'argon2id-v1',
    algorithmVersion: policy.algorithmVersion,
    changedAt: new Date(),
    hash: hash.toString('base64url'),
    memoryKiB: policy.memoryKiB,
    parallelism: policy.parallelism,
    passes: policy.passes,
    salt: salt.toString('base64url'),
  });
}

export async function verifyPassword(
  password: string,
  credential: Readonly<{
    hash: string;
    salt: string;
    memoryKiB: number;
    passes: number;
    parallelism: number;
  }>,
): Promise<boolean> {
  const policy: PasswordPolicy = {
    algorithm: 'argon2id',
    algorithmVersion: 1,
    historyDepth: 0,
    maximumLength: 1_048_576,
    memoryKiB: credential.memoryKiB,
    minimumLength: 1,
    parallelism: credential.parallelism,
    passes: credential.passes,
  };
  const actual = await derive(password, Buffer.from(credential.salt, 'base64url'), policy);
  const expected = Buffer.from(credential.hash, 'base64url');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
