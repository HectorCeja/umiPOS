import type { AuthenticationConfiguration } from '@nexo/config';
import type { DatabaseClient, DatabaseTransaction, Prisma } from '@nexo/database';
import { withUserTransaction } from '@nexo/database';
import { Inject, Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

import { DATABASE } from '../../../infrastructure/infrastructure.module.js';
import type {
  AuthenticationRepository,
  RequestEvidence,
  RotationResult,
} from '../application/authentication.ports.js';
import { AUTHENTICATION_CONFIGURATION } from '../application/authentication.ports.js';
import { securityEventTypes, type SecurityEventType } from '../domain/security-events.js';

@Injectable()
export class PrismaAuthenticationRepository implements AuthenticationRepository {
  constructor(
    @Inject(DATABASE) private readonly database: DatabaseClient,
    @Inject(AUTHENTICATION_CONFIGURATION)
    private readonly configuration: AuthenticationConfiguration,
  ) {}

  commitProfileAvatar(
    input: Readonly<{
      userId: string;
      objectKey: string;
      avatarUrl: string;
      contentType: string;
      sizeBytes: number;
      checksum: string;
      etag?: string;
    }>,
  ) {
    return withUserTransaction(this.database, input.userId, async (tx) => {
      const previous = await tx.profileAvatarMediaRecord.findFirst({
        where: { userId: input.userId, status: 'ACTIVE' },
      });
      await tx.profileAvatarMediaRecord.updateMany({
        where: { userId: input.userId, status: 'ACTIVE' },
        data: { status: 'SUPERSEDED', removedAt: new Date() },
      });
      await tx.profileAvatarMediaRecord.upsert({
        where: { objectKey: input.objectKey },
        create: {
          userId: input.userId,
          objectKey: input.objectKey,
          contentType: input.contentType,
          sizeBytes: input.sizeBytes,
          checksum: input.checksum,
          ...(input.etag ? { etag: input.etag } : {}),
        },
        update: {
          status: 'ACTIVE',
          removedAt: null,
          contentType: input.contentType,
          sizeBytes: input.sizeBytes,
          checksum: input.checksum,
          ...(input.etag ? { etag: input.etag } : {}),
        },
      });
      await tx.user.update({ where: { id: input.userId }, data: { avatarUrl: input.avatarUrl } });
      return previous ? { previousObjectKey: previous.objectKey } : {};
    });
  }

  removeProfileAvatar(userId: string) {
    return withUserTransaction(this.database, userId, async (tx) => {
      const previous = await tx.profileAvatarMediaRecord.findFirst({
        where: { userId, status: 'ACTIVE' },
      });
      await tx.profileAvatarMediaRecord.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'REMOVED', removedAt: new Date() },
      });
      await tx.user.update({ where: { id: userId }, data: { avatarUrl: null } });
      return previous ? { previousObjectKey: previous.objectKey } : {};
    });
  }

  async updateProfile(
    userId: string,
    input: Readonly<{
      displayName: string;
      givenName: string;
      familyName: string;
      locale: string;
      timeZone: string;
      avatarUrl?: string;
      preferences: Record<string, unknown>;
    }>,
  ): Promise<void> {
    await this.database.user.update({
      where: { id: userId },
      data: {
        displayName: input.displayName,
        givenName: input.givenName,
        familyName: input.familyName,
        locale: input.locale,
        timeZone: input.timeZone,
        preferences: JSON.parse(JSON.stringify(input.preferences)) as Prisma.InputJsonValue,
        ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {}),
      },
    });
  }

  async findLoginIdentity(normalizedEmail: string) {
    const email = await this.database.userEmail.findUnique({
      where: { normalizedAddress: normalizedEmail },
      include: { user: { include: { passwordCredential: true } } },
    });
    if (email === null) return null;
    return {
      credential: email.user.passwordCredential,
      displayName: email.user.displayName,
      email: email.address,
      emailVerified: email.status === 'VERIFIED',
      lockedUntil: email.user.lockedUntil,
      status: email.user.status,
      userId: email.userId,
    };
  }

  async recordLoginFailure(userId: string | undefined, evidence: RequestEvidence): Promise<void> {
    if (userId === undefined) {
      await this.createEvent(this.database, securityEventTypes.loginFailed, 'failure', evidence);
      return;
    }
    await this.database.$transaction(async (transaction) => {
      const user = await transaction.user.findUniqueOrThrow({ where: { id: userId } });
      const failures = user.failedLoginCount + 1;
      const locked = failures >= this.configuration.maxLoginAttempts;
      const now = new Date();
      await transaction.user.update({
        where: { id: userId },
        data: {
          failedLoginCount: failures,
          firstFailedLoginAt: user.firstFailedLoginAt ?? now,
          ...(locked && ['ACTIVE', 'LOCKED'].includes(user.status)
            ? {
                lockedUntil: this.addSeconds(now, this.configuration.lockTtlSeconds),
                status: 'LOCKED' as const,
                statusChangedAt: now,
                statusReason: 'authentication_failures',
              }
            : {}),
        },
      });
      await this.createEvent(
        transaction,
        securityEventTypes.loginFailed,
        'failure',
        evidence,
        userId,
      );
      if (locked)
        await this.createEvent(
          transaction,
          securityEventTypes.accountLocked,
          'success',
          evidence,
          userId,
        );
    });
  }

  async createSession(
    input: Parameters<AuthenticationRepository['createSession']>[0],
  ): Promise<void> {
    const now = new Date();
    await this.database.$transaction(async (transaction) => {
      const device = await transaction.device.upsert({
        where: {
          userId_fingerprint: {
            fingerprint: input.deviceFingerprint,
            userId: input.userId,
          },
        },
        create: {
          fingerprint: input.deviceFingerprint,
          name: input.deviceName,
          trustedUntil: input.deviceTrustedUntil ?? null,
          userId: input.userId,
        },
        update: {
          lastSeenAt: now,
          name: input.deviceName,
          revokedAt: null,
          trustedUntil: input.deviceTrustedUntil ?? null,
        },
      });
      await transaction.session.create({
        data: {
          absoluteExpiresAt: input.absoluteExpiresAt,
          accessTokenHash: input.accessTokenHash,
          csrfTokenHash: input.csrfTokenHash,
          deviceId: device.id,
          fingerprintHash: input.fingerprintHash,
          idleExpiresAt: input.idleExpiresAt,
          ipAddress: input.evidence.ipAddress,
          location: input.evidence.location ?? null,
          refreshTokenHash: input.refreshTokenHash,
          trustLevel: input.trustLevel,
          userAgent: input.evidence.userAgent,
          userId: input.userId,
          id: input.sessionId,
          refreshTokens: {
            create: {
              expiresAt: input.absoluteExpiresAt,
              generation: 0,
              id: input.refreshTokenId,
              tokenHash: input.refreshTokenHash,
              userId: input.userId,
            },
          },
        },
      });
      await transaction.user.update({
        where: { id: input.userId },
        data: {
          failedLoginCount: 0,
          firstFailedLoginAt: null,
          lastAccessedAt: now,
          lockedUntil: null,
          status: 'ACTIVE',
          statusChangedAt: now,
          statusReason: null,
        },
      });
      await this.createEvent(
        transaction,
        securityEventTypes.loginSucceeded,
        'success',
        input.evidence,
        input.userId,
        { deviceId: device.id, sessionId: input.sessionId },
      );
    });
  }

  async authenticate(accessTokenHash: string, now: Date, nextIdleExpiry: Date) {
    const session = await this.database.session.findUnique({
      where: { accessTokenHash },
      include: {
        user: {
          include: { emailIdentities: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });
    if (
      session === null ||
      session.status !== 'ACTIVE' ||
      session.idleExpiresAt <= now ||
      session.absoluteExpiresAt <= now ||
      session.user.status !== 'ACTIVE'
    )
      return null;
    const idleExpiresAt = new Date(
      Math.min(nextIdleExpiry.getTime(), session.absoluteExpiresAt.getTime()),
    );
    const updated = await this.database.session.updateMany({
      where: {
        absoluteExpiresAt: { gt: now },
        id: session.id,
        idleExpiresAt: { gt: now },
        status: 'ACTIVE',
      },
      data: { idleExpiresAt, lastSeenAt: now },
    });
    if (updated.count !== 1) return null;
    const primary = session.user.emailIdentities[0];
    return {
      csrfTokenHash: session.csrfTokenHash,
      displayName: session.user.displayName,
      ...(session.user.avatarUrl ? { avatarUrl: session.user.avatarUrl } : {}),
      email: primary?.address ?? session.user.email,
      emailVerified: primary?.status === 'VERIFIED',
      mfaStatus: session.user.mfaStatus,
      sessionId: session.id,
      userId: session.userId,
    };
  }

  async rotateRefresh(
    input: Parameters<AuthenticationRepository['rotateRefresh']>[0],
  ): Promise<RotationResult> {
    return this.withSerializableRetry(async (transaction) => {
      const token = await transaction.refreshToken.findUnique({
        where: { tokenHash: input.oldRefreshTokenHash },
        include: { session: { include: { user: true } } },
      });
      if (token === null) return { kind: 'invalid' };
      if (token.status !== 'ACTIVE') {
        await this.closeForReuse(transaction, token.id, token.sessionId, token.userId, input);
        return { kind: 'reused' };
      }
      const session = token.session;
      if (
        session.status !== 'ACTIVE' ||
        session.absoluteExpiresAt <= input.now ||
        session.idleExpiresAt <= input.now ||
        session.user.status !== 'ACTIVE'
      ) {
        await this.closeSession(transaction, session.id, 'expired', input.now);
        return { kind: 'invalid' };
      }
      if (!this.constantTimeHexEqual(session.csrfTokenHash, input.csrfTokenHash))
        return { kind: 'csrf_invalid' };

      const consumed = await transaction.refreshToken.updateMany({
        where: { id: token.id, status: 'ACTIVE' },
        data: { rotatedAt: input.now, status: 'ROTATED' },
      });
      if (consumed.count !== 1) {
        await this.closeForReuse(transaction, token.id, token.sessionId, token.userId, input);
        return { kind: 'reused' };
      }
      const idleExpiresAt = new Date(
        Math.min(input.nextIdleExpiry.getTime(), session.absoluteExpiresAt.getTime()),
      );
      await transaction.refreshToken.create({
        data: {
          expiresAt: session.absoluteExpiresAt,
          generation: token.generation + 1,
          id: input.newRefreshTokenId,
          sessionId: session.id,
          tokenHash: input.newRefreshTokenHash,
          userId: session.userId,
        },
      });
      await transaction.session.update({
        where: { id: session.id },
        data: {
          accessTokenHash: input.newAccessTokenHash,
          csrfTokenHash: input.newCsrfTokenHash,
          idleExpiresAt,
          ipAddress: input.evidence.ipAddress,
          lastSeenAt: input.now,
          location: input.evidence.location ?? null,
          refreshTokenHash: input.newRefreshTokenHash,
          rotationCounter: { increment: 1 },
          userAgent: input.evidence.userAgent,
        },
      });
      await this.createEvent(
        transaction,
        securityEventTypes.sessionRefreshed,
        'success',
        input.evidence,
        session.userId,
        { generation: token.generation + 1, sessionId: session.id },
      );
      return {
        absoluteExpiresAt: session.absoluteExpiresAt,
        kind: 'rotated',
        sessionId: session.id,
        userId: session.userId,
      };
    });
  }

  async revokeSession(
    sessionId: string,
    userId: string,
    reason: string,
    evidence: RequestEvidence,
  ): Promise<boolean> {
    return this.database.$transaction(async (transaction) => {
      const count = await this.closeOwnedSession(
        transaction,
        sessionId,
        userId,
        reason,
        new Date(),
      );
      if (count === 1)
        await this.createEvent(
          transaction,
          reason === 'user_logout' ? securityEventTypes.logout : securityEventTypes.sessionRevoked,
          'success',
          evidence,
          userId,
          { reason, sessionId },
        );
      return count === 1;
    });
  }

  async revokeAllSessions(
    userId: string,
    reason: string,
    evidence: RequestEvidence,
  ): Promise<number> {
    const now = new Date();
    return this.database.$transaction(async (transaction) => {
      const sessions = await transaction.session.updateMany({
        where: { status: 'ACTIVE', userId },
        data: { revokedAt: now, revokedReason: reason, status: 'REVOKED' },
      });
      await transaction.refreshToken.updateMany({
        where: { status: 'ACTIVE', userId },
        data: { revokedAt: now, status: 'REVOKED' },
      });
      await this.createEvent(
        transaction,
        securityEventTypes.logoutAll,
        'success',
        evidence,
        userId,
        { revokedSessions: sessions.count },
      );
      return sessions.count;
    });
  }

  async listSessions(userId: string, currentSessionId: string, now: Date) {
    const sessions = await this.database.session.findMany({
      where: {
        absoluteExpiresAt: { gt: now },
        idleExpiresAt: { gt: now },
        status: 'ACTIVE',
        userId,
      },
      include: { device: true },
      orderBy: { lastSeenAt: 'desc' },
    });
    return sessions.map((session) => ({
      absoluteExpiresAt: session.absoluteExpiresAt,
      createdAt: session.createdAt,
      current: session.id === currentSessionId,
      deviceId: session.deviceId,
      deviceName: session.device?.name ?? null,
      id: session.id,
      idleExpiresAt: session.idleExpiresAt,
      ipAddress: session.ipAddress,
      lastActivityAt: session.lastSeenAt,
      location: session.location,
      trustLevel: session.trustLevel,
      userAgent: session.userAgent,
    }));
  }

  async issueActionToken(input: Parameters<AuthenticationRepository['issueActionToken']>[0]) {
    return this.database.$transaction(async (transaction) => {
      const email = await transaction.userEmail.findUnique({
        where: { normalizedAddress: input.normalizedEmail },
        include: { user: true },
      });
      const eligible =
        email !== null &&
        ((input.purpose === 'PASSWORD_RESET' &&
          email.status === 'VERIFIED' &&
          ['ACTIVE', 'LOCKED'].includes(email.user.status)) ||
          (input.purpose === 'EMAIL_VERIFICATION' &&
            email.status === 'PENDING' &&
            email.user.status === 'PENDING_VERIFICATION'));
      if (!eligible) {
        await this.createEvent(
          transaction,
          input.purpose === 'PASSWORD_RESET'
            ? securityEventTypes.passwordResetRequested
            : securityEventTypes.emailVerificationRequested,
          'accepted',
          input.evidence,
        );
        return null;
      }
      const now = new Date();
      await transaction.identityToken.updateMany({
        where: {
          expiresAt: { gt: now },
          purpose: input.purpose,
          revokedAt: null,
          usedAt: null,
          userId: email.userId,
        },
        data: { revokedAt: now },
      });
      await transaction.identityToken.create({
        data: {
          emailId: email.id,
          expiresAt: input.expiresAt,
          purpose: input.purpose,
          tokenHash: input.tokenHash,
          userId: email.userId,
        },
      });
      await this.createEvent(
        transaction,
        input.purpose === 'PASSWORD_RESET'
          ? securityEventTypes.passwordResetRequested
          : securityEventTypes.emailVerificationRequested,
        'accepted',
        input.evidence,
        email.userId,
      );
      return { recipient: email.address };
    });
  }

  async completePasswordReset(
    input: Parameters<AuthenticationRepository['completePasswordReset']>[0],
  ): Promise<boolean> {
    return this.database.$transaction(async (transaction) => {
      const token = await transaction.identityToken.findUnique({
        where: { tokenHash: input.tokenHash },
        include: { email: true, user: true },
      });
      if (
        token === null ||
        token.purpose !== 'PASSWORD_RESET' ||
        token.email?.status !== 'VERIFIED' ||
        !['ACTIVE', 'LOCKED'].includes(token.user.status) ||
        token.usedAt !== null ||
        token.revokedAt !== null ||
        token.expiresAt <= input.now
      )
        return false;
      const consumed = await transaction.identityToken.updateMany({
        where: { id: token.id, revokedAt: null, usedAt: null },
        data: { usedAt: input.now },
      });
      if (consumed.count !== 1) return false;
      await transaction.passwordCredential.upsert({
        where: { userId: token.userId },
        create: { ...input.credential, userId: token.userId },
        update: { ...input.credential, expiresAt: null, mustChange: false },
      });
      await transaction.user.update({
        where: { id: token.userId },
        data: {
          failedLoginCount: 0,
          firstFailedLoginAt: null,
          lockedUntil: null,
          passwordChangedAt: input.now,
          status: 'ACTIVE',
          statusChangedAt: input.now,
          statusReason: null,
        },
      });
      await this.revokeUserSessions(transaction, token.userId, 'password_reset', input.now);
      await transaction.identityToken.updateMany({
        where: {
          id: { not: token.id },
          purpose: 'PASSWORD_RESET',
          revokedAt: null,
          usedAt: null,
          userId: token.userId,
        },
        data: { revokedAt: input.now },
      });
      await this.createEvent(
        transaction,
        securityEventTypes.passwordResetCompleted,
        'success',
        input.evidence,
        token.userId,
      );
      await this.createEvent(
        transaction,
        securityEventTypes.passwordChanged,
        'success',
        input.evidence,
        token.userId,
        { reason: 'password_reset' },
      );
      return true;
    });
  }

  async completeEmailVerification(
    tokenHash: string,
    now: Date,
    evidence: RequestEvidence,
  ): Promise<boolean> {
    return this.database.$transaction(async (transaction) => {
      const token = await transaction.identityToken.findUnique({
        where: { tokenHash },
        include: { email: true, user: true },
      });
      if (
        token === null ||
        token.purpose !== 'EMAIL_VERIFICATION' ||
        token.email === null ||
        token.email.status !== 'PENDING' ||
        token.user.status !== 'PENDING_VERIFICATION' ||
        token.usedAt !== null ||
        token.revokedAt !== null ||
        token.expiresAt <= now
      )
        return false;
      const consumed = await transaction.identityToken.updateMany({
        where: { id: token.id, revokedAt: null, usedAt: null },
        data: { usedAt: now },
      });
      if (consumed.count !== 1) return false;
      await transaction.userEmail.update({
        where: { id: token.email.id },
        data: { status: 'VERIFIED', verifiedAt: now },
      });
      await transaction.user.update({
        where: { id: token.userId },
        data: {
          ...(token.email.isPrimary
            ? {
                email: token.email.address,
                emailVerifiedAt: now,
                normalizedEmail: token.email.normalizedAddress,
              }
            : {}),
          status: 'ACTIVE',
          statusChangedAt: now,
          statusReason: null,
        },
      });
      await transaction.identityToken.updateMany({
        where: {
          id: { not: token.id },
          purpose: 'EMAIL_VERIFICATION',
          revokedAt: null,
          usedAt: null,
          userId: token.userId,
        },
        data: { revokedAt: now },
      });
      await this.createEvent(
        transaction,
        securityEventTypes.emailVerified,
        'success',
        evidence,
        token.userId,
        { emailId: token.email.id },
      );
      return true;
    });
  }

  async recordSecurityEvent(
    input: Parameters<AuthenticationRepository['recordSecurityEvent']>[0],
  ): Promise<void> {
    await this.createEvent(
      this.database,
      input.type,
      input.outcome,
      input.evidence,
      input.userId,
      input.metadata,
    );
  }

  private async closeForReuse(
    transaction: DatabaseTransaction,
    tokenId: string,
    sessionId: string,
    userId: string,
    input: Parameters<AuthenticationRepository['rotateRefresh']>[0],
  ): Promise<void> {
    await transaction.refreshToken.update({
      where: { id: tokenId },
      data: {
        reuseDetectedAt: input.now,
        revokedAt: input.now,
        status: 'REUSED',
      },
    });
    await this.closeSession(transaction, sessionId, 'refresh_reuse', input.now);
    await this.createEvent(
      transaction,
      securityEventTypes.refreshReuse,
      'blocked',
      input.evidence,
      userId,
      { sessionId },
    );
  }

  private async closeOwnedSession(
    transaction: DatabaseTransaction,
    sessionId: string,
    userId: string,
    reason: string,
    now: Date,
  ): Promise<number> {
    const sessions = await transaction.session.updateMany({
      where: { id: sessionId, status: 'ACTIVE', userId },
      data: { revokedAt: now, revokedReason: reason, status: 'REVOKED' },
    });
    await transaction.refreshToken.updateMany({
      where: { sessionId, status: 'ACTIVE', userId },
      data: { revokedAt: now, status: 'REVOKED' },
    });
    return sessions.count;
  }

  private async closeSession(
    transaction: DatabaseTransaction,
    sessionId: string,
    reason: string,
    now: Date,
  ): Promise<void> {
    await transaction.session.updateMany({
      where: { id: sessionId, status: 'ACTIVE' },
      data: { revokedAt: now, revokedReason: reason, status: 'REVOKED' },
    });
    await transaction.refreshToken.updateMany({
      where: { sessionId, status: 'ACTIVE' },
      data: { revokedAt: now, status: 'REVOKED' },
    });
  }

  private async revokeUserSessions(
    transaction: DatabaseTransaction,
    userId: string,
    reason: string,
    now: Date,
  ): Promise<void> {
    await transaction.session.updateMany({
      where: { status: 'ACTIVE', userId },
      data: { revokedAt: now, revokedReason: reason, status: 'REVOKED' },
    });
    await transaction.refreshToken.updateMany({
      where: { status: 'ACTIVE', userId },
      data: { revokedAt: now, status: 'REVOKED' },
    });
  }

  private async createEvent(
    database: DatabaseClient | DatabaseTransaction,
    type: SecurityEventType,
    outcome: string,
    evidence: RequestEvidence,
    userId?: string,
    metadata: Readonly<Record<string, string | number | boolean>> = {},
  ): Promise<void> {
    await database.securityEvent.create({
      data: {
        ipAddress: evidence.ipAddress,
        metadata,
        outcome,
        type,
        userAgent: evidence.userAgent,
        ...(userId === undefined ? {} : { userId }),
      },
    });
  }

  private constantTimeHexEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left, 'hex');
    const rightBuffer = Buffer.from(right, 'hex');
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }

  private addSeconds(value: Date, seconds: number): Date {
    return new Date(value.getTime() + seconds * 1000);
  }

  private async withSerializableRetry<T>(
    operation: (transaction: DatabaseTransaction) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.database.$transaction(operation, { isolationLevel: 'Serializable' });
      } catch (error) {
        const code =
          typeof error === 'object' && error !== null && 'code' in error
            ? String(error.code)
            : undefined;
        if (code !== 'P2034' || attempt === 1) throw error;
      }
    }
    throw new Error('Serializable authentication transaction retry exhausted');
  }
}
