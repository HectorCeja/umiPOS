import type { SecurityEventType } from '../domain/security-events.js';

export type RequestEvidence = Readonly<{
  ipAddress: string;
  userAgent: string;
  location?: string;
}>;

export type LoginIdentity = Readonly<{
  userId: string;
  email: string;
  displayName: string;
  status: string;
  lockedUntil: Date | null;
  emailVerified: boolean;
  credential: Readonly<{
    hash: string;
    salt: string;
    memoryKiB: number;
    passes: number;
    parallelism: number;
  }> | null;
}>;

export type SessionIdentity = Readonly<{
  sessionId: string;
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  mfaStatus: 'NOT_ENROLLED' | 'ENROLLED' | 'REQUIRED';
  csrfTokenHash: string;
}>;

export type SessionSummary = Readonly<{
  id: string;
  deviceId: string | null;
  deviceName: string | null;
  ipAddress: string;
  userAgent: string;
  location: string | null;
  trustLevel: 'UNTRUSTED' | 'RECOGNIZED';
  createdAt: Date;
  lastActivityAt: Date;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
  current: boolean;
}>;

export type RotationResult =
  | Readonly<{ kind: 'rotated'; sessionId: string; userId: string; absoluteExpiresAt: Date }>
  | Readonly<{ kind: 'reused' }>
  | Readonly<{ kind: 'csrf_invalid' }>
  | Readonly<{ kind: 'invalid' }>;

export interface AuthenticationRepository {
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
  ): Promise<Readonly<{ previousObjectKey?: string }>>;
  removeProfileAvatar(userId: string): Promise<Readonly<{ previousObjectKey?: string }>>;
  updateProfile(
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
  ): Promise<void>;
  findLoginIdentity(normalizedEmail: string): Promise<LoginIdentity | null>;
  recordLoginFailure(userId: string | undefined, evidence: RequestEvidence): Promise<void>;
  createSession(
    input: Readonly<{
      sessionId: string;
      refreshTokenId: string;
      userId: string;
      accessTokenHash: string;
      refreshTokenHash: string;
      csrfTokenHash: string;
      fingerprintHash: string;
      deviceFingerprint: string;
      deviceName: string;
      trustLevel: 'UNTRUSTED' | 'RECOGNIZED';
      deviceTrustedUntil?: Date;
      idleExpiresAt: Date;
      absoluteExpiresAt: Date;
      evidence: RequestEvidence;
    }>,
  ): Promise<void>;
  authenticate(
    accessTokenHash: string,
    now: Date,
    nextIdleExpiry: Date,
  ): Promise<SessionIdentity | null>;
  rotateRefresh(
    input: Readonly<{
      oldRefreshTokenHash: string;
      csrfTokenHash: string;
      newRefreshTokenId: string;
      newRefreshTokenHash: string;
      newAccessTokenHash: string;
      newCsrfTokenHash: string;
      now: Date;
      nextIdleExpiry: Date;
      evidence: RequestEvidence;
    }>,
  ): Promise<RotationResult>;
  revokeSession(
    sessionId: string,
    userId: string,
    reason: string,
    evidence: RequestEvidence,
  ): Promise<boolean>;
  revokeAllSessions(userId: string, reason: string, evidence: RequestEvidence): Promise<number>;
  listSessions(
    userId: string,
    currentSessionId: string,
    now: Date,
  ): Promise<readonly SessionSummary[]>;
  issueActionToken(
    input: Readonly<{
      normalizedEmail: string;
      purpose: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION';
      tokenHash: string;
      expiresAt: Date;
      evidence: RequestEvidence;
    }>,
  ): Promise<Readonly<{ recipient: string }> | null>;
  completePasswordReset(
    input: Readonly<{
      tokenHash: string;
      credential: Readonly<{
        algorithm: string;
        algorithmVersion: number;
        changedAt: Date;
        hash: string;
        memoryKiB: number;
        parallelism: number;
        passes: number;
        salt: string;
      }>;
      now: Date;
      evidence: RequestEvidence;
    }>,
  ): Promise<boolean>;
  completeEmailVerification(
    tokenHash: string,
    now: Date,
    evidence: RequestEvidence,
  ): Promise<boolean>;
  recordSecurityEvent(
    input: Readonly<{
      type: SecurityEventType;
      outcome: string;
      evidence: RequestEvidence;
      userId?: string;
      metadata?: Readonly<Record<string, string | number | boolean>>;
    }>,
  ): Promise<void>;
}

export interface AbuseProtectionPort {
  consume(key: string, limit: number, windowSeconds: number): Promise<boolean>;
  reset(key: string): Promise<void>;
}

export interface AuthenticationMailerPort {
  send(message: Readonly<{ to: string; subject: string; text: string }>): Promise<void>;
}

export interface CompromisedPasswordPort {
  isCompromised(password: string): boolean;
}

export const AUTHENTICATION_REPOSITORY = Symbol('AUTHENTICATION_REPOSITORY');
export const ABUSE_PROTECTION = Symbol('ABUSE_PROTECTION');
export const AUTHENTICATION_CONFIGURATION = Symbol('AUTHENTICATION_CONFIGURATION');
export const COMPROMISED_PASSWORDS = Symbol('COMPROMISED_PASSWORDS');
