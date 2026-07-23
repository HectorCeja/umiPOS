import * as crypto from 'node:crypto';

export const PASSWORD_POLICY = Object.freeze({
  minimumLength: 15,
  maximumLength: 128,
  memoryKiB: 19_456,
  passes: 2,
  parallelism: 1,
  tagLength: 32,
});

const blockedPasswords = new Set([
  '123456789012345',
  'passwordpassword',
  'password123456',
  'qwertyuiopasdfg',
  'letmeinletmein',
  'administrador123',
  'contraseña123456',
  'nexonexonexonexo',
]);

export class PasswordPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordPolicyError';
  }
}

export function validatePassword(password: string): void {
  const length = Array.from(password).length;
  if (length < PASSWORD_POLICY.minimumLength || length > PASSWORD_POLICY.maximumLength) {
    throw new PasswordPolicyError(
      `Password length must be between ${String(PASSWORD_POLICY.minimumLength)} and ${String(PASSWORD_POLICY.maximumLength)} characters`,
    );
  }
  if (blockedPasswords.has(password.normalize('NFKC').toLocaleLowerCase('en-US'))) {
    throw new PasswordPolicyError('Password is present in the blocked-password list');
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

async function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    argon2(
      'argon2id',
      {
        memory: PASSWORD_POLICY.memoryKiB,
        message: password,
        nonce: salt,
        parallelism: PASSWORD_POLICY.parallelism,
        passes: PASSWORD_POLICY.passes,
        tagLength: PASSWORD_POLICY.tagLength,
      },
      (error, key) => {
        if (error === null) resolve(key);
        else reject(error);
      },
    );
  });
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  validatePassword(password);
  const salt = crypto.randomBytes(16);
  const hash = await derive(password, salt);
  return { hash: hash.toString('base64url'), salt: salt.toString('base64url') };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  const actual = await derive(password, Buffer.from(salt, 'base64url'));
  const expected = Buffer.from(hash, 'base64url');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
