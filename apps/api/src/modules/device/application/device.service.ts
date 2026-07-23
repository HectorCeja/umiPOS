import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { DatabaseClient, Prisma } from '@nexo/database';
import { withTenantTransaction } from '@nexo/database';
import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DATABASE } from '../../../infrastructure/infrastructure.module.js';
import type { SessionIdentity } from '../../authentication/application/authentication.ports.js';
import { AuthorizationService } from '../../authorization/application/authorization.service.js';

type EnrollmentInput = Readonly<{
  branchId?: string;
  idempotencyKey: string;
  capabilities?: Record<string, unknown>;
  expiresInMinutes?: number;
}>;
type ConsumeInput = Readonly<{
  token: string;
  name: string;
  platform: string;
  appVersion: string;
  fingerprintHash: string;
  idempotencyKey: string;
  capabilities?: Record<string, unknown>;
}>;

const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');
const publicDevice = (device: {
  id: string;
  tenantId: string;
  branchId: string | null;
  name: string;
  platform: string;
  appVersion: string;
  status: string;
  capabilities: unknown;
  enrolledAt: Date;
  lastSeenAt: Date | null;
  version: number;
}) => ({
  id: device.id,
  organizationId: device.tenantId,
  branchId: device.branchId,
  name: device.name,
  platform: device.platform,
  appVersion: device.appVersion,
  status: device.status,
  capabilities: device.capabilities,
  enrolledAt: device.enrolledAt,
  lastSeenAt: device.lastSeenAt,
  version: device.version,
});

@Injectable()
export class DeviceService {
  constructor(
    @Inject(DATABASE) private readonly db: DatabaseClient,
    private readonly authorization: AuthorizationService,
  ) {}

  async createEnrollment(identity: SessionIdentity, tenantId: string, input: EnrollmentInput) {
    await this.authorization.assert(
      identity,
      tenantId,
      'device.enrollment.create',
      { type: 'pos_device_enrollment', ...(input.branchId ? { branchId: input.branchId } : {}) },
      input.branchId,
    );
    const plaintext = randomBytes(32).toString('base64url');
    const tokenHash = digest(plaintext);
    const expiresAt = new Date(Date.now() + Math.min(input.expiresInMinutes ?? 15, 30) * 60_000);
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const previous = await tx.posDeviceEnrollmentRecord.findFirst({
        where: { tenantId, idempotencyKey: input.idempotencyKey },
      });
      if (previous)
        throw new ConflictException('Enrollment invitation idempotency key already used');
      if (input.branchId) {
        const branch = await tx.branch.findFirst({
          where: { tenantId, id: input.branchId, status: 'ACTIVE' },
        });
        if (!branch) throw new NotFoundException('Branch not found');
      }
      const enrollment = await tx.posDeviceEnrollmentRecord.create({
        data: {
          tenantId,
          ...(input.branchId ? { branchId: input.branchId } : {}),
          tokenHash,
          idempotencyKey: input.idempotencyKey,
          capabilities: (input.capabilities ?? {}) as Prisma.InputJsonValue,
          createdBy: identity.userId,
          expiresAt,
        },
      });
      return {
        id: enrollment.id,
        organizationId: tenantId,
        branchId: enrollment.branchId,
        token: plaintext,
        expiresAt,
        status: enrollment.status,
      };
    });
  }

  consume(tenantId: string, input: ConsumeInput) {
    const tokenHash = digest(input.token);
    const requestFingerprint = digest(
      JSON.stringify({
        name: input.name,
        platform: input.platform,
        appVersion: input.appVersion,
        fingerprintHash: input.fingerprintHash,
      }),
    );
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const enrollment = await tx.posDeviceEnrollmentRecord.findUnique({ where: { tokenHash } });
      if (!enrollment || enrollment.tenantId !== tenantId)
        throw new UnauthorizedException('Enrollment token is invalid');
      if (enrollment.revokedAt || enrollment.status === 'REVOKED')
        throw new GoneException('Enrollment token was revoked');
      if (enrollment.expiresAt <= new Date()) throw new GoneException('Enrollment token expired');
      if (enrollment.status === 'CONSUMED') {
        if (enrollment.requestFingerprint !== requestFingerprint || !enrollment.enrolledDeviceId)
          throw new ConflictException('Enrollment token was already consumed');
        throw new ConflictException(
          'Enrollment credential was already delivered and cannot be disclosed again',
        );
      }
      const claimed = await tx.posDeviceEnrollmentRecord.updateMany({
        where: { tenantId, id: enrollment.id, status: 'PENDING', revokedAt: null },
        data: { status: 'CONSUMED', consumedAt: new Date(), requestFingerprint },
      });
      if (claimed.count !== 1) throw new ConflictException('Enrollment token was already consumed');
      const credentialSecret = randomBytes(32).toString('base64url');
      const credentialId = randomUUID();
      const device = await tx.posDeviceRecord.upsert({
        where: { tenantId_fingerprintHash: { tenantId, fingerprintHash: input.fingerprintHash } },
        create: {
          tenantId,
          branchId: enrollment.branchId,
          name: input.name,
          platform: input.platform,
          appVersion: input.appVersion,
          fingerprintHash: input.fingerprintHash,
          capabilities: enrollment.capabilities as Prisma.InputJsonValue,
        },
        update: {
          name: input.name,
          appVersion: input.appVersion,
          capabilities: enrollment.capabilities as Prisma.InputJsonValue,
        },
      });
      if (device.status === 'REVOKED') throw new ForbiddenException('Device is revoked');
      await tx.posDeviceCredentialRecord.create({
        data: {
          tenantId,
          id: credentialId,
          deviceId: device.id,
          secretHash: digest(credentialSecret),
        },
      });
      await tx.posDeviceEnrollmentRecord.update({
        where: { tenantId_id: { tenantId, id: enrollment.id } },
        data: {
          enrolledDeviceId: device.id,
        },
      });
      await tx.posDeviceOutboxRecord.create({
        data: {
          tenantId,
          aggregateId: device.id,
          aggregateVersion: device.version,
          eventType: 'DeviceEnrolled',
          payload: { deviceId: device.id, branchId: device.branchId, platform: device.platform },
        },
      });
      return { device: publicDevice(device), credential: `${credentialId}.${credentialSecret}` };
    });
  }

  async authenticate(tenantId: string, credential: string | undefined) {
    const [credentialId, secret, extra] = credential?.split('.') ?? [];
    if (!credentialId || !secret || extra)
      throw new UnauthorizedException('Device credential required');
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const row = await tx.posDeviceCredentialRecord.findFirst({
        where: { tenantId, id: credentialId, secretHash: digest(secret), status: 'ACTIVE' },
        include: { device: true },
      });
      if (!row || row.device.status !== 'ACTIVE')
        throw new UnauthorizedException('Device credential invalid or inactive');
      await tx.posDeviceCredentialRecord.update({
        where: { tenantId_id: { tenantId, id: row.id } },
        data: { lastUsedAt: new Date() },
      });
      await tx.posDeviceRecord.update({
        where: { tenantId_id: { tenantId, id: row.deviceId } },
        data: { lastSeenAt: new Date() },
      });
      return publicDevice(row.device);
    });
  }

  async list(identity: SessionIdentity, tenantId: string) {
    await this.authorization.assert(identity, tenantId, 'device.read', { type: 'pos_device' });
    return withTenantTransaction(this.db, tenantId, (tx) =>
      tx.posDeviceRecord
        .findMany({ where: { tenantId }, orderBy: { enrolledAt: 'desc' } })
        .then((rows) => rows.map(publicDevice)),
    );
  }

  async revoke(identity: SessionIdentity, tenantId: string, deviceId: string, reason: string) {
    await this.authorization.assert(identity, tenantId, 'device.revoke', { type: 'pos_device' });
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const existing = await tx.posDeviceRecord.findFirst({ where: { tenantId, id: deviceId } });
      if (!existing) throw new NotFoundException('Device not found');
      if (existing.status === 'REVOKED') return publicDevice(existing);
      const device = await tx.posDeviceRecord.update({
        where: { tenantId_id: { tenantId, id: deviceId } },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokedBy: identity.userId,
          revocationReason: reason,
          version: { increment: 1 },
        },
      });
      await tx.posDeviceCredentialRecord.updateMany({
        where: { tenantId, deviceId, status: 'ACTIVE' },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });
      await tx.posDeviceOutboxRecord.create({
        data: {
          tenantId,
          aggregateId: device.id,
          aggregateVersion: device.version,
          eventType: 'DeviceRevoked',
          payload: { deviceId, revokedBy: identity.userId },
        },
      });
      return publicDevice(device);
    });
  }

  async setStatus(
    identity: SessionIdentity,
    tenantId: string,
    deviceId: string,
    status: 'ACTIVE' | 'DISABLED',
    reason: string,
  ) {
    await this.authorization.assert(identity, tenantId, 'device.update', { type: 'pos_device' });
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const current = await tx.posDeviceRecord.findFirst({ where: { tenantId, id: deviceId } });
      if (!current) throw new NotFoundException('Device not found');
      if (current.status === 'REVOKED')
        throw new ConflictException('Revoked devices cannot be reactivated');
      const device = await tx.posDeviceRecord.update({
        where: { tenantId_id: { tenantId, id: deviceId } },
        data: { status, revocationReason: reason, version: { increment: 1 } },
      });
      return publicDevice(device);
    });
  }

  async rotate(
    identity: SessionIdentity,
    tenantId: string,
    deviceId: string,
    idempotencyKey: string,
  ) {
    await this.authorization.assert(identity, tenantId, 'device.rotate_credential', {
      type: 'pos_device',
    });
    return withTenantTransaction(this.db, tenantId, async (tx) => {
      const prior = await tx.posDeviceCredentialRecord.findFirst({
        where: { tenantId, rotationKey: idempotencyKey },
      });
      if (prior)
        throw new ConflictException(
          'Rotated credential was already delivered and cannot be disclosed again',
        );
      const device = await tx.posDeviceRecord.findFirst({ where: { tenantId, id: deviceId } });
      if (!device || device.status !== 'ACTIVE')
        throw new ConflictException('Only active devices can rotate credentials');
      const secret = randomBytes(32).toString('base64url');
      const id = randomUUID();
      await tx.posDeviceCredentialRecord.updateMany({
        where: { tenantId, deviceId, status: 'ACTIVE' },
        data: { status: 'ROTATED', rotatedAt: new Date(), replacedById: id },
      });
      await tx.posDeviceCredentialRecord.create({
        data: { tenantId, id, deviceId, secretHash: digest(secret), rotationKey: idempotencyKey },
      });
      return { deviceId, credential: `${id}.${secret}` };
    });
  }
}
