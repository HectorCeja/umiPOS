import { createHash, randomUUID } from 'node:crypto';

import type { AuthenticationConfiguration } from '@nexo/config';
import { normalizeEmailAddress } from '@nexo/identity';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  MAILER,
  OBJECT_STORAGE,
  type MailerPort,
} from '../../../infrastructure/infrastructure.module.js';
import { Client as MinioClient } from 'minio';
import {
  ABUSE_PROTECTION,
  AUTHENTICATION_CONFIGURATION,
  AUTHENTICATION_REPOSITORY,
  type AbuseProtectionPort,
  type AuthenticationRepository,
  type RequestEvidence,
  type SessionIdentity,
  COMPROMISED_PASSWORDS,
  type CompromisedPasswordPort,
} from './authentication.ports.js';
import { hashPassword, verifyPassword, validatePassword } from '../domain/password-verifier.js';
import { securityEventTypes } from '../domain/security-events.js';
import { digestSecret, issueOpaqueSecret, secretDigestMatches } from '../domain/secrets.js';

const DUMMY_CREDENTIAL = Object.freeze({
  hash: Buffer.alloc(32).toString('base64url'),
  memoryKiB: 19_456,
  parallelism: 1,
  passes: 2,
  salt: Buffer.alloc(16, 7).toString('base64url'),
});

export type IssuedSession = Readonly<{
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  accessMaxAgeSeconds: number;
  refreshMaxAgeSeconds: number;
}>;

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(AUTHENTICATION_REPOSITORY)
    private readonly repository: AuthenticationRepository,
    @Inject(ABUSE_PROTECTION) private readonly abuseProtection: AbuseProtectionPort,
    @Inject(AUTHENTICATION_CONFIGURATION)
    private readonly configuration: AuthenticationConfiguration,
    @Inject(MAILER) private readonly mailer: MailerPort,
    @Inject(COMPROMISED_PASSWORDS)
    private readonly compromisedPasswords: CompromisedPasswordPort,
    @Inject(OBJECT_STORAGE) private readonly storage: MinioClient,
  ) {}

  async prepareProfileAvatar(
    identity: SessionIdentity,
    input: Readonly<{ contentType: string; fileName: string; size: number }>,
  ) {
    const extension =
      input.contentType === 'image/png'
        ? 'png'
        : input.contentType === 'image/webp'
          ? 'webp'
          : 'jpg';
    const objectKey = `profiles/${identity.userId}/avatars/${randomUUID()}.${extension}`;
    const publicEndpoint = new URL(process.env.S3_PUBLIC_ENDPOINT ?? 'http://localhost:9000');
    const publicStorage = new MinioClient({
      endPoint: publicEndpoint.hostname,
      port: Number(publicEndpoint.port || (publicEndpoint.protocol === 'https:' ? 443 : 80)),
      useSSL: publicEndpoint.protocol === 'https:',
      accessKey: process.env.S3_ACCESS_KEY ?? '',
      secretKey: process.env.S3_SECRET_KEY ?? '',
      region: process.env.S3_REGION ?? 'us-east-1',
    });
    const uploadUrl = await publicStorage.presignedPutObject(
      process.env.S3_BUCKET ?? 'nexo',
      objectKey,
      15 * 60,
    );
    return { objectKey, uploadUrl, expiresInSeconds: 900, maximumBytes: 5_242_880 };
  }

  async completeProfileAvatar(identity: SessionIdentity, objectKey: string) {
    this.assertOwnedAvatar(identity, objectKey);
    const object = await this.storage.statObject(process.env.S3_BUCKET ?? 'nexo', objectKey);
    if (object.size < 1 || object.size > 5_242_880)
      throw new HttpException(
        'El archivo debe pesar menos de 5 MB.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    const bucket = process.env.S3_BUCKET ?? 'nexo';
    const stream = await this.storage.getObject(bucket, objectKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream as AsyncIterable<Uint8Array>) chunks.push(Buffer.from(chunk));
    const bytes = Buffer.concat(chunks);
    const contentType = this.detectAvatarType(bytes);
    const expectedExtension =
      contentType === 'image/png' ? '.png' : contentType === 'image/webp' ? '.webp' : '.jpg';
    if (!objectKey.endsWith(expectedExtension))
      throw new HttpException(
        'El contenido del archivo no coincide con su formato.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    const token = Buffer.from(objectKey).toString('base64url');
    const publicBase = process.env.PUBLIC_API_URL ?? 'http://localhost:3001';
    const avatarUrl = `${publicBase}/v1/profile/avatar/${token}`;
    const committed = await this.repository.commitProfileAvatar({
      userId: identity.userId,
      objectKey,
      avatarUrl,
      contentType,
      sizeBytes: object.size,
      checksum: createHash('sha256').update(bytes).digest('hex'),
      ...(object.etag ? { etag: object.etag } : {}),
    });
    if (committed.previousObjectKey && committed.previousObjectKey !== objectKey) {
      await this.storage.removeObject(bucket, committed.previousObjectKey).catch(() => undefined);
    }
    return { avatarUrl, size: object.size, contentType };
  }

  async removeProfileAvatar(identity: SessionIdentity) {
    const removed = await this.repository.removeProfileAvatar(identity.userId);
    if (removed.previousObjectKey)
      await this.storage
        .removeObject(process.env.S3_BUCKET ?? 'nexo', removed.previousObjectKey)
        .catch(() => undefined);
    return { avatarUrl: null };
  }

  async getProfileAvatar(identity: SessionIdentity, token: string) {
    const objectKey = Buffer.from(token, 'base64url').toString('utf8');
    this.assertOwnedAvatar(identity, objectKey);
    const bucket = process.env.S3_BUCKET ?? 'nexo';
    try {
      const metadata = await this.storage.statObject(bucket, objectKey);
      return { stream: await this.storage.getObject(bucket, objectKey), metadata };
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'NoSuchKey' || code === 'NotFound')
        throw new NotFoundException('La foto de perfil ya no está disponible.');
      throw error;
    }
  }

  private assertOwnedAvatar(identity: SessionIdentity, objectKey: string) {
    if (!objectKey.startsWith(`profiles/${identity.userId}/avatars/`))
      throw new ForbiddenException('No puedes acceder a este archivo.');
  }

  private detectAvatarType(bytes: Buffer): 'image/png' | 'image/jpeg' | 'image/webp' {
    const png =
      bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const webp =
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
      bytes.subarray(8, 12).toString('ascii') === 'WEBP';
    if (png) return 'image/png';
    if (jpeg) return 'image/jpeg';
    if (webp) return 'image/webp';
    throw new HttpException(
      'El archivo no es una imagen PNG, JPEG o WebP válida.',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  async updateProfile(
    identity: SessionIdentity,
    input: Readonly<{
      displayName: string;
      givenName: string;
      familyName: string;
      locale: string;
      timeZone: string;
      avatarUrl?: string;
      preferences: Record<string, unknown>;
    }>,
    evidence: RequestEvidence,
  ) {
    if (input.avatarUrl) {
      const token = new URL(input.avatarUrl).pathname.split('/').at(-1);
      if (!token) throw new ForbiddenException('La referencia de avatar no es válida.');
      this.assertOwnedAvatar(identity, Buffer.from(token, 'base64url').toString('utf8'));
    }
    await this.repository.updateProfile(identity.userId, input);
    await this.repository.recordSecurityEvent({
      type: securityEventTypes.profileUpdated,
      outcome: 'success',
      evidence,
      userId: identity.userId,
    });
    return { ...input, email: identity.email, emailVerified: identity.emailVerified };
  }

  async login(
    input: Readonly<{
      email: string;
      password: string;
      rememberMe: boolean;
      rememberDevice: boolean;
      deviceFingerprint: string;
      deviceName: string;
    }>,
    evidence: RequestEvidence,
  ): Promise<IssuedSession> {
    const normalizedEmail = normalizeEmailAddress(input.email);
    await this.enforceLoginRateLimit(normalizedEmail, evidence.ipAddress);
    const identity = await this.repository.findLoginIdentity(normalizedEmail);
    const matches = await verifyPassword(input.password, identity?.credential ?? DUMMY_CREDENTIAL);
    const now = new Date();
    const lifecycleAllowsLogin =
      identity?.status === 'ACTIVE' ||
      (identity?.status === 'LOCKED' &&
        identity.lockedUntil !== null &&
        identity.lockedUntil <= now);
    if (
      !matches ||
      identity?.credential === null ||
      !identity?.emailVerified ||
      !lifecycleAllowsLogin
    ) {
      await this.repository.recordLoginFailure(identity?.userId, evidence);
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.abuseProtection.reset(this.rateKey('login-account', normalizedEmail));

    const tokens = this.issueSessionSecrets();
    const absoluteSeconds = input.rememberMe
      ? this.configuration.rememberAbsoluteTtlSeconds
      : this.configuration.absoluteTtlSeconds;
    const absoluteExpiresAt = this.addSeconds(now, absoluteSeconds);
    const idleExpiresAt = new Date(
      Math.min(
        this.addSeconds(now, this.configuration.idleTtlSeconds).getTime(),
        absoluteExpiresAt.getTime(),
      ),
    );
    await this.repository.createSession({
      absoluteExpiresAt,
      accessTokenHash: tokens.access.digest,
      csrfTokenHash: tokens.csrf.digest,
      deviceFingerprint: digestSecret(input.deviceFingerprint, this.configuration.tokenHmacSecret),
      deviceName: input.deviceName,
      ...(input.rememberDevice
        ? {
            deviceTrustedUntil: this.addSeconds(
              now,
              this.configuration.deviceRecognitionTtlSeconds,
            ),
          }
        : {}),
      evidence,
      fingerprintHash: digestSecret(
        `${input.deviceFingerprint}\u0000${evidence.userAgent}`,
        this.configuration.tokenHmacSecret,
      ),
      idleExpiresAt,
      refreshTokenHash: tokens.refresh.digest,
      refreshTokenId: randomUUID(),
      sessionId: randomUUID(),
      trustLevel: input.rememberDevice ? 'RECOGNIZED' : 'UNTRUSTED',
      userId: identity.userId,
    });
    return this.present(tokens, absoluteSeconds);
  }

  async authenticate(accessToken: string | undefined): Promise<SessionIdentity> {
    if (!accessToken) throw new UnauthorizedException();
    const now = new Date();
    const identity = await this.repository.authenticate(
      digestSecret(accessToken, this.configuration.tokenHmacSecret),
      now,
      this.addSeconds(now, this.configuration.idleTtlSeconds),
    );
    if (identity === null) throw new UnauthorizedException();
    return identity;
  }

  async refresh(
    refreshToken: string | undefined,
    csrfToken: string | undefined,
    evidence: RequestEvidence,
  ): Promise<IssuedSession> {
    if (!refreshToken || !csrfToken) throw new ForbiddenException('CSRF validation failed');
    const now = new Date();
    const tokens = this.issueSessionSecrets();
    const result = await this.repository.rotateRefresh({
      csrfTokenHash: digestSecret(csrfToken, this.configuration.tokenHmacSecret),
      evidence,
      newAccessTokenHash: tokens.access.digest,
      newCsrfTokenHash: tokens.csrf.digest,
      newRefreshTokenHash: tokens.refresh.digest,
      newRefreshTokenId: randomUUID(),
      nextIdleExpiry: this.addSeconds(now, this.configuration.idleTtlSeconds),
      now,
      oldRefreshTokenHash: digestSecret(refreshToken, this.configuration.tokenHmacSecret),
    });
    if (result.kind === 'csrf_invalid') throw new ForbiddenException('CSRF validation failed');
    if (result.kind !== 'rotated') throw new UnauthorizedException();
    return this.present(
      tokens,
      Math.max(0, Math.floor((result.absoluteExpiresAt.getTime() - now.getTime()) / 1000)),
    );
  }

  assertCsrf(identity: SessionIdentity, csrfToken: string | undefined): void {
    if (
      !csrfToken ||
      !secretDigestMatches(csrfToken, identity.csrfTokenHash, this.configuration.tokenHmacSecret)
    )
      throw new ForbiddenException('CSRF validation failed');
  }

  async logout(identity: SessionIdentity, evidence: RequestEvidence): Promise<void> {
    await this.repository.revokeSession(
      identity.sessionId,
      identity.userId,
      'user_logout',
      evidence,
    );
  }

  async logoutAll(identity: SessionIdentity, evidence: RequestEvidence): Promise<void> {
    await this.repository.revokeAllSessions(identity.userId, 'global_logout', evidence);
  }

  async listSessions(identity: SessionIdentity) {
    return this.repository.listSessions(identity.userId, identity.sessionId, new Date());
  }

  async revokeSession(
    identity: SessionIdentity,
    sessionId: string,
    evidence: RequestEvidence,
  ): Promise<void> {
    await this.repository.revokeSession(sessionId, identity.userId, 'remote_revoke', evidence);
  }

  async forceAdministrativeRevocation(
    actorUserId: string,
    targetUserId: string,
    sessionId: string,
    reason: string,
    evidence: RequestEvidence,
  ): Promise<void> {
    if (!reason.trim()) throw new Error('Administrative revocation requires a reason');
    await this.repository.revokeSession(sessionId, targetUserId, 'administrative_revoke', evidence);
    await this.repository.recordSecurityEvent({
      evidence,
      metadata: { actorUserId, reason, sessionId, targetUserId },
      outcome: 'success',
      type: securityEventTypes.securityWarning,
      userId: targetUserId,
    });
  }

  async requestPasswordReset(email: string, evidence: RequestEvidence): Promise<void> {
    const startedAt = Date.now();
    const normalized = normalizeEmailAddress(email);
    await this.enforceRecoveryRateLimit(normalized, evidence.ipAddress);
    const token = issueOpaqueSecret(this.configuration.tokenHmacSecret);
    const delivery = await this.repository.issueActionToken({
      evidence,
      expiresAt: this.addSeconds(new Date(), this.configuration.passwordResetTtlSeconds),
      normalizedEmail: normalized,
      purpose: 'PASSWORD_RESET',
      tokenHash: token.digest,
    });
    if (delivery !== null) {
      try {
        await this.mailer.send({
          subject: 'Restablece tu contraseña de NEXO',
          text: `Usa este enlace de un solo uso: ${this.configuration.appBaseUrl}/password-reset?token=${token.raw}`,
          to: delivery.recipient,
        });
      } catch {
        await this.repository.recordSecurityEvent({
          evidence,
          metadata: { channel: 'email', purpose: 'password_reset' },
          outcome: 'failure',
          type: securityEventTypes.securityWarning,
        });
      }
    }
    await this.minimumResponseTime(startedAt, 250);
  }

  async completePasswordReset(
    token: string,
    password: string,
    evidence: RequestEvidence,
  ): Promise<void> {
    validatePassword(password, this.configuration.identity.password);
    if (this.compromisedPasswords.isCompromised(password)) {
      throw new ForbiddenException('Password is present in the compromised-password blocklist');
    }
    const credential = await hashPassword(password, this.configuration.identity.password);
    const completed = await this.repository.completePasswordReset({
      credential,
      evidence,
      now: new Date(),
      tokenHash: digestSecret(token, this.configuration.tokenHmacSecret),
    });
    if (!completed) throw new ForbiddenException('Invalid or expired token');
  }

  async requestEmailVerification(email: string, evidence: RequestEvidence): Promise<void> {
    const startedAt = Date.now();
    const normalized = normalizeEmailAddress(email);
    await this.enforceRecoveryRateLimit(normalized, evidence.ipAddress);
    const token = issueOpaqueSecret(this.configuration.tokenHmacSecret);
    const delivery = await this.repository.issueActionToken({
      evidence,
      expiresAt: this.addSeconds(new Date(), this.configuration.emailVerificationTtlSeconds),
      normalizedEmail: normalized,
      purpose: 'EMAIL_VERIFICATION',
      tokenHash: token.digest,
    });
    if (delivery !== null) {
      try {
        await this.mailer.send({
          subject: 'Verifica tu correo de NEXO',
          text: `Usa este enlace de un solo uso: ${this.configuration.appBaseUrl}/verify-email?token=${token.raw}`,
          to: delivery.recipient,
        });
      } catch {
        await this.repository.recordSecurityEvent({
          evidence,
          metadata: { channel: 'email', purpose: 'email_verification' },
          outcome: 'failure',
          type: securityEventTypes.securityWarning,
        });
      }
    }
    await this.minimumResponseTime(startedAt, 250);
  }

  async completeEmailVerification(token: string, evidence: RequestEvidence): Promise<void> {
    const completed = await this.repository.completeEmailVerification(
      digestSecret(token, this.configuration.tokenHmacSecret),
      new Date(),
      evidence,
    );
    if (!completed) throw new ForbiddenException('Invalid or expired token');
  }

  private issueSessionSecrets() {
    return Object.freeze({
      access: issueOpaqueSecret(this.configuration.tokenHmacSecret),
      csrf: issueOpaqueSecret(this.configuration.tokenHmacSecret),
      refresh: issueOpaqueSecret(this.configuration.tokenHmacSecret),
    });
  }

  private present(
    tokens: ReturnType<AuthenticationService['issueSessionSecrets']>,
    refreshMaxAgeSeconds: number,
  ): IssuedSession {
    return {
      accessMaxAgeSeconds: this.configuration.accessTtlSeconds,
      accessToken: tokens.access.raw,
      csrfToken: tokens.csrf.raw,
      refreshMaxAgeSeconds,
      refreshToken: tokens.refresh.raw,
    };
  }

  private async enforceLoginRateLimit(email: string, ip: string): Promise<void> {
    const [ipAllowed, accountAllowed] = await Promise.all([
      this.abuseProtection.consume(this.rateKey('login-ip', ip), 30, 60),
      this.abuseProtection.consume(
        this.rateKey('login-account', email),
        this.configuration.maxLoginAttempts,
        this.configuration.lockTtlSeconds,
      ),
    ]);
    if (!ipAllowed || !accountAllowed)
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
  }

  private async enforceRecoveryRateLimit(email: string, ip: string): Promise<void> {
    const [ipAllowed, accountAllowed] = await Promise.all([
      this.abuseProtection.consume(this.rateKey('recovery-ip', ip), 20, 3600),
      this.abuseProtection.consume(this.rateKey('recovery-account', email), 5, 3600),
    ]);
    if (!ipAllowed || !accountAllowed)
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
  }

  private rateKey(kind: string, value: string): string {
    return `auth:${kind}:${digestSecret(value, this.configuration.rateLimitHmacSecret)}`;
  }

  private addSeconds(value: Date, seconds: number): Date {
    return new Date(value.getTime() + seconds * 1000);
  }

  private async minimumResponseTime(startedAt: number, minimumMs: number): Promise<void> {
    const remaining = minimumMs - (Date.now() - startedAt);
    if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}
