import { randomUUID } from 'node:crypto';

import { traceOperation } from '@nexo/observability';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';

import type { SessionIdentity } from '../../authentication/application/authentication.ports.js';
import { digestSecret, issueOpaqueSecret } from '../../authentication/domain/secrets.js';
import { AuthorizationService } from '../../authorization/application/authorization.service.js';
import { MAILER, type MailerPort } from '../../../infrastructure/infrastructure.module.js';
import {
  CONTROL_PLANE_REPOSITORY,
  type BranchInput,
  type ControlPlaneRepository,
  type InvitationInput,
  type OrganizationInput,
  type OrganizationSettingsInput,
} from './control-plane.ports.js';

@Injectable()
export class ControlPlaneService {
  private readonly logger = new Logger(ControlPlaneService.name);
  private readonly tokenKey = process.env.AUTH_TOKEN_HMAC_SECRET ?? '';
  private readonly appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';

  constructor(
    @Inject(CONTROL_PLANE_REPOSITORY) private readonly repository: ControlPlaneRepository,
    @Inject(MAILER) private readonly mailer: MailerPort,
    private readonly authorization: AuthorizationService,
  ) {
    if (this.tokenKey.length < 32) throw new Error('AUTH_TOKEN_HMAC_SECRET is required');
  }

  bootstrap(identity: SessionIdentity, input: OrganizationInput) {
    if (!identity.emailVerified) throw new BadRequestException('Verified email required');
    const organizationId = randomUUID();
    return this.traced('control_plane.organization.create', organizationId, identity.userId, () =>
      this.repository.bootstrap(identity.userId, organizationId, input),
    );
  }

  organizations(identity: SessionIdentity) {
    return this.repository.organizationsForUser(identity.userId);
  }

  async organization(identity: SessionIdentity, tenantId: string) {
    await this.authorize(identity, tenantId, 'organization.read', 'organization');
    return this.repository.organization(tenantId);
  }

  async updateOrganization(
    identity: SessionIdentity,
    tenantId: string,
    input: OrganizationSettingsInput,
  ) {
    await this.authorize(identity, tenantId, 'organization.update', 'organization');
    return this.traced('control_plane.organization.update', tenantId, identity.userId, () =>
      this.repository.updateOrganization(tenantId, identity.userId, input),
    );
  }

  async archiveOrganization(identity: SessionIdentity, tenantId: string, version: number) {
    await this.authorize(identity, tenantId, 'organization.archive', 'organization');
    return this.repository.archiveOrganization(tenantId, identity.userId, version);
  }

  async branches(identity: SessionIdentity, tenantId: string) {
    await this.authorize(identity, tenantId, 'branch.read', 'branch');
    return this.repository.branches(tenantId);
  }

  async createBranch(identity: SessionIdentity, tenantId: string, input: BranchInput) {
    await this.authorize(identity, tenantId, 'branch.create', 'branch');
    return this.traced('control_plane.branch.create', tenantId, identity.userId, () =>
      this.repository.createBranch(tenantId, identity.userId, input),
    );
  }

  async updateBranch(
    identity: SessionIdentity,
    tenantId: string,
    branchId: string,
    input: BranchInput & { version: number },
  ) {
    await this.authorize(identity, tenantId, 'branch.update', 'branch', branchId);
    return this.repository.updateBranch(tenantId, branchId, identity.userId, input);
  }

  async setBranchArchived(
    identity: SessionIdentity,
    tenantId: string,
    branchId: string,
    archived: boolean,
    version: number,
  ) {
    await this.authorization.assert(
      identity,
      tenantId,
      archived ? 'branch.archive' : 'branch.restore',
      { branchId, type: 'branch' },
    );
    return this.repository.setBranchArchived(
      tenantId,
      branchId,
      identity.userId,
      archived,
      version,
    );
  }

  templates() {
    return this.repository.templates();
  }

  async onboarding(identity: SessionIdentity, tenantId: string) {
    await this.authorize(identity, tenantId, 'onboarding.read', 'onboarding');
    return this.repository.onboarding(tenantId);
  }

  async saveOnboarding(
    identity: SessionIdentity,
    tenantId: string,
    input: Parameters<ControlPlaneRepository['saveOnboarding']>[2],
  ) {
    await this.authorize(identity, tenantId, 'onboarding.manage', 'onboarding');
    return this.traced('control_plane.onboarding.save', tenantId, identity.userId, () =>
      this.repository.saveOnboarding(tenantId, identity.userId, input),
    );
  }

  async completeOnboarding(identity: SessionIdentity, tenantId: string, version: number) {
    await this.authorize(identity, tenantId, 'onboarding.manage', 'onboarding');
    return this.traced('control_plane.onboarding.complete', tenantId, identity.userId, () =>
      this.repository.completeOnboarding(tenantId, identity.userId, version),
    );
  }

  async restartOnboarding(identity: SessionIdentity, tenantId: string, version: number) {
    await this.authorize(identity, tenantId, 'onboarding.manage', 'onboarding');
    return this.repository.restartOnboarding(tenantId, identity.userId, version);
  }

  async setFeature(
    identity: SessionIdentity,
    tenantId: string,
    featureKey: string,
    enabled: boolean,
    version: number,
  ) {
    await this.authorize(identity, tenantId, 'feature_flags.update', 'feature_flag');
    return this.repository.setFeature(tenantId, identity.userId, featureKey, enabled, version);
  }

  async invitations(identity: SessionIdentity, tenantId: string) {
    await this.authorize(identity, tenantId, 'invitation.read', 'invitation');
    return this.repository.invitations(tenantId);
  }

  async invite(identity: SessionIdentity, tenantId: string, input: InvitationInput) {
    await this.authorize(identity, tenantId, 'invitation.create', 'invitation');
    const token = issueOpaqueSecret(this.tokenKey);
    const result = await this.repository.createInvitation(
      tenantId,
      identity.userId,
      input,
      token.digest,
      new Date(Date.now() + 72 * 60 * 60 * 1000),
    );
    await this.sendInvitation(input.email, result.organizationName, tenantId, token.raw);
    return result.invitation;
  }

  async resend(identity: SessionIdentity, tenantId: string, invitationId: string) {
    await this.authorize(identity, tenantId, 'invitation.resend', 'invitation');
    const token = issueOpaqueSecret(this.tokenKey);
    const result = await this.repository.rotateInvitation(
      tenantId,
      invitationId,
      identity.userId,
      token.digest,
      new Date(Date.now() + 72 * 60 * 60 * 1000),
    );
    await this.sendInvitation(result.email, result.organizationName, tenantId, token.raw);
    return result.invitation;
  }

  async revoke(identity: SessionIdentity, tenantId: string, invitationId: string, version: number) {
    await this.authorize(identity, tenantId, 'invitation.revoke', 'invitation');
    return this.repository.revokeInvitation(tenantId, invitationId, identity.userId, version);
  }

  accept(identity: SessionIdentity, tenantId: string, rawToken: string) {
    return this.repository.acceptInvitation(
      tenantId,
      identity.userId,
      identity.email.toLowerCase(),
      digestSecret(rawToken, this.tokenKey),
    );
  }

  async updateMembership(
    identity: SessionIdentity,
    tenantId: string,
    membershipId: string,
    input: Parameters<ControlPlaneRepository['updateMembership']>[3],
  ) {
    await this.authorize(identity, tenantId, 'membership.update', 'membership');
    return this.repository.updateMembership(tenantId, membershipId, identity.userId, input);
  }

  private authorize(
    identity: SessionIdentity,
    tenantId: string,
    permission: string,
    type: string,
    branchId?: string,
  ) {
    return this.authorization.assert(
      identity,
      tenantId,
      permission,
      { type, ...(branchId === undefined ? {} : { branchId }) },
      branchId,
    );
  }

  private async sendInvitation(
    email: string,
    organization: string,
    tenantId: string,
    token: string,
  ) {
    const url = `${this.appBaseUrl}/invitations/accept?organization=${encodeURIComponent(tenantId)}&token=${encodeURIComponent(token)}`;
    await this.mailer.send({
      to: email,
      subject: `Invitación a ${organization}`,
      text: `Acepta tu invitación de NEXO: ${url}`,
    });
  }

  private traced<T>(
    name: string,
    tenantId: string,
    actorUserId: string,
    operation: () => Promise<T>,
  ) {
    this.logger.log({ actorUserId, event: name, tenantId });
    return traceOperation(
      name,
      { 'nexo.actor.id': actorUserId, 'nexo.tenant.id': tenantId },
      operation,
    );
  }
}
