import type { DatabaseClient } from '@nexo/database';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Redis } from 'ioredis';

import {
  DATABASE,
  MAILER,
  REDIS,
  type MailerPort,
} from '../../../infrastructure/infrastructure.module.js';
import { hashPassword, verifyPassword } from '../domain/password.js';
import { digestToken, issueOpaqueToken, normalizeEmail } from '../domain/tokens.js';

const DUMMY_HASH = Buffer.alloc(32).toString('base64url');
const DUMMY_SALT = Buffer.alloc(16, 7).toString('base64url');
const ACCESS_COOKIE_MAX_AGE_SECONDS = 30 * 60;

export type RequestEvidence = Readonly<{ ipAddress: string; userAgent: string }>;
export type IssuedSession = Readonly<{
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  accessMaxAgeSeconds: number;
  refreshMaxAgeSeconds: number;
}>;

export type AuthenticatedIdentity = Readonly<{
  sessionId: string;
  userId: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  mfaStatus: 'NOT_ENROLLED' | 'ENROLLED' | 'REQUIRED';
}>;

@Injectable()
export class IdentityService {
  constructor(
    @Inject(DATABASE) private readonly database: DatabaseClient,
    @Inject(REDIS) private readonly redis: Redis,
    @Inject(MAILER) private readonly mailer: MailerPort,
  ) {}

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
    const normalizedEmail = normalizeEmail(input.email);
    await this.enforceLoginRateLimit(normalizedEmail, evidence.ipAddress);
    const user = await this.database.user.findUnique({
      where: { normalizedEmail },
      include: { passwordCredential: true },
    });
    const credential = user?.passwordCredential;
    const passwordMatches = await verifyPassword(
      input.password,
      credential?.hash ?? DUMMY_HASH,
      credential?.salt ?? DUMMY_SALT,
    );
    const now = new Date();
    if (user === null) {
      await this.securityEvent(undefined, 'authentication.login', 'failure', evidence);
      throw new UnauthorizedException('Invalid email or password');
    }
    const allowed =
      passwordMatches &&
      user.status === 'ACTIVE' &&
      user.emailVerifiedAt !== null &&
      (user.lockedUntil === null || user.lockedUntil <= now);

    if (!allowed) {
      await this.recordFailedLogin(user.id, evidence);
      throw new UnauthorizedException('Invalid email or password');
    }

    const device = await this.database.device.upsert({
      where: { userId_fingerprint: { userId: user.id, fingerprint: input.deviceFingerprint } },
      create: {
        fingerprint: input.deviceFingerprint,
        name: input.deviceName,
        trustedUntil: input.rememberDevice ? this.addDays(now, 30) : null,
        userId: user.id,
      },
      update: {
        lastSeenAt: now,
        name: input.deviceName,
        revokedAt: null,
        ...(input.rememberDevice ? { trustedUntil: this.addDays(now, 30) } : {}),
      },
    });
    const issued = this.newSessionTokens();
    const absoluteExpiresAt = this.addMilliseconds(
      now,
      input.rememberMe ? 30 * 86_400_000 : 12 * 3_600_000,
    );
    const refreshMaxAgeSeconds = Math.floor((absoluteExpiresAt.getTime() - now.getTime()) / 1000);
    await this.database.$transaction([
      this.database.session.create({
        data: {
          absoluteExpiresAt,
          accessTokenHash: issued.access.digest,
          csrfTokenHash: issued.csrf.digest,
          deviceId: device.id,
          fingerprintHash: digestToken(input.deviceFingerprint),
          idleExpiresAt: this.addMilliseconds(now, ACCESS_COOKIE_MAX_AGE_SECONDS * 1000),
          ipAddress: evidence.ipAddress,
          refreshTokenHash: issued.refresh.digest,
          userAgent: evidence.userAgent,
          userId: user.id,
        },
      }),
      this.database.user.update({
        where: { id: user.id },
        data: { failedLoginCount: 0, firstFailedLoginAt: null, lockedUntil: null },
      }),
      this.database.securityEvent.create({
        data: {
          ipAddress: evidence.ipAddress,
          outcome: 'success',
          type: 'authentication.login',
          userAgent: evidence.userAgent,
          userId: user.id,
        },
      }),
    ]);
    return this.presentTokens(issued, refreshMaxAgeSeconds);
  }

  async authenticate(accessToken: string | undefined): Promise<AuthenticatedIdentity> {
    if (!accessToken) throw new UnauthorizedException();
    const now = new Date();
    const session = await this.database.session.findUnique({
      where: { accessTokenHash: digestToken(accessToken) },
      include: { user: true },
    });
    if (
      session === null ||
      session.status !== 'ACTIVE' ||
      session.idleExpiresAt <= now ||
      session.absoluteExpiresAt <= now ||
      session.user.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException();
    }
    await this.database.session.update({
      where: { id: session.id },
      data: {
        lastSeenAt: now,
        idleExpiresAt: new Date(
          Math.min(
            this.addMilliseconds(now, ACCESS_COOKIE_MAX_AGE_SECONDS * 1000).getTime(),
            session.absoluteExpiresAt.getTime(),
          ),
        ),
      },
    });
    return {
      displayName: session.user.displayName,
      email: session.user.email,
      emailVerified: session.user.emailVerifiedAt !== null,
      mfaStatus: session.user.mfaStatus,
      sessionId: session.id,
      userId: session.user.id,
    };
  }

  async refresh(
    refreshToken: string | undefined,
    evidence: RequestEvidence,
  ): Promise<IssuedSession> {
    if (!refreshToken) throw new UnauthorizedException();
    const now = new Date();
    const session = await this.database.session.findUnique({
      where: { refreshTokenHash: digestToken(refreshToken) },
      include: { user: true },
    });
    if (
      session === null ||
      session.status !== 'ACTIVE' ||
      session.absoluteExpiresAt <= now ||
      session.user.status !== 'ACTIVE'
    ) {
      throw new UnauthorizedException();
    }
    const issued = this.newSessionTokens();
    const refreshMaxAgeSeconds = Math.floor(
      (session.absoluteExpiresAt.getTime() - now.getTime()) / 1000,
    );
    await this.database.$transaction([
      this.database.session.update({
        where: { id: session.id },
        data: {
          accessTokenHash: issued.access.digest,
          csrfTokenHash: issued.csrf.digest,
          idleExpiresAt: new Date(
            Math.min(
              this.addMilliseconds(now, ACCESS_COOKIE_MAX_AGE_SECONDS * 1000).getTime(),
              session.absoluteExpiresAt.getTime(),
            ),
          ),
          ipAddress: evidence.ipAddress,
          lastSeenAt: now,
          refreshTokenHash: issued.refresh.digest,
          rotationCounter: { increment: 1 },
          userAgent: evidence.userAgent,
        },
      }),
      this.database.securityEvent.create({
        data: {
          ipAddress: evidence.ipAddress,
          outcome: 'success',
          type: 'session.refresh',
          userAgent: evidence.userAgent,
          userId: session.userId,
        },
      }),
    ]);
    return this.presentTokens(issued, refreshMaxAgeSeconds);
  }

  async logout(identity: AuthenticatedIdentity, evidence: RequestEvidence): Promise<void> {
    await this.revokeSession(identity.sessionId, identity.userId, 'user_logout', evidence);
  }

  async logoutAll(identity: AuthenticatedIdentity, evidence: RequestEvidence): Promise<void> {
    await this.database.$transaction([
      this.database.session.updateMany({
        where: { userId: identity.userId, status: 'ACTIVE' },
        data: { revokedAt: new Date(), revokedReason: 'global_logout', status: 'REVOKED' },
      }),
      this.database.securityEvent.create({
        data: {
          ipAddress: evidence.ipAddress,
          outcome: 'success',
          type: 'session.logout_all',
          userAgent: evidence.userAgent,
          userId: identity.userId,
        },
      }),
    ]);
  }

  async requestPasswordReset(email: string, evidence: RequestEvidence): Promise<void> {
    await this.enforceRecoveryRateLimit(normalizeEmail(email), evidence.ipAddress);
    const user = await this.database.user.findUnique({
      where: { normalizedEmail: normalizeEmail(email) },
    });
    if (user?.status === 'ACTIVE') {
      const token = issueOpaqueToken();
      await this.database.identityToken.create({
        data: {
          expiresAt: this.addMilliseconds(new Date(), 30 * 60_000),
          purpose: 'PASSWORD_RESET',
          tokenHash: token.digest,
          userId: user.id,
        },
      });
      await this.mailer.send({
        subject: 'Restablece tu contraseña de NEXO',
        text: `Usa este enlace durante los próximos 30 minutos: ${this.publicWebUrl('/password-reset', token.raw)}`,
        to: user.email,
      });
    }
    await this.securityEvent(user?.id, 'password.reset_requested', 'accepted', evidence);
  }

  async completePasswordReset(
    token: string,
    password: string,
    evidence: RequestEvidence,
  ): Promise<void> {
    const record = await this.database.identityToken.findUnique({
      where: { tokenHash: digestToken(token) },
    });
    const now = new Date();
    if (
      record === null ||
      record.purpose !== 'PASSWORD_RESET' ||
      record.usedAt !== null ||
      record.expiresAt <= now
    ) {
      throw new ForbiddenException('Invalid or expired token');
    }
    const credential = await hashPassword(password);
    await this.database.$transaction([
      this.database.passwordCredential.upsert({
        where: { userId: record.userId },
        create: { ...credential, userId: record.userId },
        update: credential,
      }),
      this.database.identityToken.update({ where: { id: record.id }, data: { usedAt: now } }),
      this.database.user.update({ where: { id: record.userId }, data: { passwordChangedAt: now } }),
      this.database.session.updateMany({
        where: { userId: record.userId, status: 'ACTIVE' },
        data: { revokedAt: now, revokedReason: 'password_reset', status: 'REVOKED' },
      }),
      this.database.securityEvent.create({
        data: {
          ipAddress: evidence.ipAddress,
          outcome: 'success',
          type: 'password.reset_completed',
          userAgent: evidence.userAgent,
          userId: record.userId,
        },
      }),
    ]);
  }

  async requestEmailVerification(email: string, evidence: RequestEvidence): Promise<void> {
    await this.enforceRecoveryRateLimit(normalizeEmail(email), evidence.ipAddress);
    const user = await this.database.user.findUnique({
      where: { normalizedEmail: normalizeEmail(email) },
    });
    if (user?.status === 'ACTIVE' && user.emailVerifiedAt === null) {
      const token = issueOpaqueToken();
      await this.database.identityToken.create({
        data: {
          expiresAt: this.addMilliseconds(new Date(), 24 * 60 * 60_000),
          purpose: 'EMAIL_VERIFICATION',
          tokenHash: token.digest,
          userId: user.id,
        },
      });
      await this.mailer.send({
        subject: 'Verifica tu correo de NEXO',
        text: `Usa este enlace durante las próximas 24 horas: ${this.publicWebUrl('/verify-email', token.raw)}`,
        to: user.email,
      });
    }
    await this.securityEvent(user?.id, 'email.verification_requested', 'accepted', evidence);
  }

  async verifyEmail(token: string, evidence: RequestEvidence): Promise<void> {
    const record = await this.database.identityToken.findUnique({
      where: { tokenHash: digestToken(token) },
    });
    const now = new Date();
    if (
      record === null ||
      record.purpose !== 'EMAIL_VERIFICATION' ||
      record.usedAt !== null ||
      record.expiresAt <= now
    ) {
      throw new ForbiddenException('Invalid or expired token');
    }
    await this.database.$transaction([
      this.database.identityToken.update({ where: { id: record.id }, data: { usedAt: now } }),
      this.database.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: now } }),
      this.database.securityEvent.create({
        data: {
          ipAddress: evidence.ipAddress,
          outcome: 'success',
          type: 'email.verified',
          userAgent: evidence.userAgent,
          userId: record.userId,
        },
      }),
    ]);
  }

  private publicWebUrl(path: string, token: string): string {
    const url = new URL(path, process.env.APP_BASE_URL ?? 'http://localhost:3000');
    url.searchParams.set('token', token);
    return url.toString();
  }

  async listSessions(userId: string) {
    const now = new Date();
    return this.database.session.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        absoluteExpiresAt: { gt: now },
        idleExpiresAt: { gt: now },
      },
      orderBy: { lastSeenAt: 'desc' },
      select: {
        id: true,
        deviceId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastSeenAt: true,
        idleExpiresAt: true,
        absoluteExpiresAt: true,
      },
    });
  }

  async revokeSession(
    sessionId: string,
    userId: string,
    reason: string,
    evidence: RequestEvidence,
  ): Promise<void> {
    await this.database.$transaction([
      this.database.session.updateMany({
        where: { id: sessionId, userId, status: 'ACTIVE' },
        data: { revokedAt: new Date(), revokedReason: reason, status: 'REVOKED' },
      }),
      this.database.securityEvent.create({
        data: {
          ipAddress: evidence.ipAddress,
          outcome: 'success',
          type: 'session.revoked',
          userAgent: evidence.userAgent,
          userId,
        },
      }),
    ]);
  }

  async listDevices(userId: string) {
    return this.database.device.findMany({
      where: { userId, revokedAt: null },
      orderBy: { lastSeenAt: 'desc' },
      select: { id: true, name: true, firstSeenAt: true, lastSeenAt: true, trustedUntil: true },
    });
  }

  async revokeDevice(deviceId: string, userId: string, evidence: RequestEvidence): Promise<void> {
    const now = new Date();
    await this.database.$transaction([
      this.database.device.updateMany({
        where: { id: deviceId, userId },
        data: { revokedAt: now, trustedUntil: null },
      }),
      this.database.session.updateMany({
        where: { deviceId, userId, status: 'ACTIVE' },
        data: { revokedAt: now, revokedReason: 'device_revoked', status: 'REVOKED' },
      }),
      this.database.securityEvent.create({
        data: {
          ipAddress: evidence.ipAddress,
          outcome: 'success',
          type: 'device.revoked',
          userAgent: evidence.userAgent,
          userId,
        },
      }),
    ]);
  }

  private newSessionTokens() {
    return { access: issueOpaqueToken(), csrf: issueOpaqueToken(), refresh: issueOpaqueToken() };
  }

  private presentTokens(
    tokens: ReturnType<IdentityService['newSessionTokens']>,
    refreshMaxAgeSeconds: number,
  ): IssuedSession {
    return {
      accessMaxAgeSeconds: ACCESS_COOKIE_MAX_AGE_SECONDS,
      accessToken: tokens.access.raw,
      csrfToken: tokens.csrf.raw,
      refreshMaxAgeSeconds,
      refreshToken: tokens.refresh.raw,
    };
  }

  private async enforceLoginRateLimit(email: string, ip: string): Promise<void> {
    await Promise.all([
      this.enforceRate(`auth:login:ip:${ip}`, 30, 60),
      this.enforceRate(`auth:login:account:${digestToken(email)}`, 10, 900),
    ]);
  }

  private async enforceRecoveryRateLimit(email: string, ip: string): Promise<void> {
    await Promise.all([
      this.enforceRate(`auth:recovery:ip:${ip}`, 20, 3600),
      this.enforceRate(`auth:recovery:account:${digestToken(email)}`, 5, 3600),
    ]);
  }

  private async enforceRate(key: string, limit: number, seconds: number): Promise<void> {
    const count = await this.redis.incr(key);
    if (count === 1) await this.redis.expire(key, seconds);
    if (count > limit) throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
  }

  private async recordFailedLogin(userId: string, evidence: RequestEvidence): Promise<void> {
    const user = await this.database.user.findUniqueOrThrow({ where: { id: userId } });
    const count = user.failedLoginCount + 1;
    await this.database.$transaction([
      this.database.user.update({
        where: { id: userId },
        data: {
          failedLoginCount: count,
          firstFailedLoginAt: user.firstFailedLoginAt ?? new Date(),
          ...(count >= 10 ? { lockedUntil: this.addMilliseconds(new Date(), 15 * 60_000) } : {}),
        },
      }),
      this.database.securityEvent.create({
        data: {
          ipAddress: evidence.ipAddress,
          outcome: 'failure',
          type: 'authentication.login',
          userAgent: evidence.userAgent,
          userId,
        },
      }),
    ]);
  }

  private async securityEvent(
    userId: string | undefined,
    type: string,
    outcome: string,
    evidence: RequestEvidence,
  ): Promise<void> {
    await this.database.securityEvent.create({
      data: {
        ipAddress: evidence.ipAddress,
        outcome,
        type,
        userAgent: evidence.userAgent,
        ...(userId ? { userId } : {}),
      },
    });
  }

  private addMilliseconds(value: Date, milliseconds: number): Date {
    return new Date(value.getTime() + milliseconds);
  }

  private addDays(value: Date, days: number): Date {
    return this.addMilliseconds(value, days * 86_400_000);
  }
}
