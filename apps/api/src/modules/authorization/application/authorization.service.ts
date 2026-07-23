import { AuthorizationEngine, type AuthorizationResource } from '@nexo/authorization';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';

import type { SessionIdentity } from '../../authentication/application/authentication.ports.js';
import {
  AUTHORIZATION_REPOSITORY,
  type AuthorizationRepository,
  type AuthorizationSnapshot,
} from './authorization.ports.js';

@Injectable()
export class AuthorizationService {
  private readonly engine = new AuthorizationEngine();

  constructor(
    @Inject(AUTHORIZATION_REPOSITORY)
    private readonly repository: AuthorizationRepository,
  ) {}

  async context(identity: SessionIdentity, tenantId: string, branchId?: string) {
    const snapshot = await this.snapshot(identity, tenantId, branchId);
    this.require(snapshot, 'authorization.context.read', {
      tenantId,
      type: 'authorization_context',
      ...(branchId === undefined ? {} : { branchId }),
    });
    return snapshot.context;
  }

  async roles(identity: SessionIdentity, tenantId: string, branchId?: string) {
    const snapshot = await this.snapshot(identity, tenantId, branchId);
    this.require(snapshot, 'authorization.roles.read', {
      tenantId,
      type: 'authorization_role',
      ...(branchId === undefined ? {} : { branchId }),
    });
    return snapshot.roles;
  }

  async permissions(identity: SessionIdentity, tenantId: string, branchId?: string) {
    const snapshot = await this.snapshot(identity, tenantId, branchId);
    this.require(snapshot, 'authorization.permissions.read', {
      tenantId,
      type: 'permission',
      ...(branchId === undefined ? {} : { branchId }),
    });
    return snapshot.permissions;
  }

  async features(identity: SessionIdentity, tenantId: string, branchId?: string) {
    const snapshot = await this.snapshot(identity, tenantId, branchId);
    this.require(snapshot, 'feature_flags.read', {
      tenantId,
      type: 'feature_flag',
      ...(branchId === undefined ? {} : { branchId }),
    });
    return snapshot.features;
  }

  async memberships(identity: SessionIdentity, tenantId: string, branchId?: string) {
    const snapshot = await this.snapshot(identity, tenantId, branchId);
    this.require(snapshot, 'membership.read', {
      tenantId,
      type: 'membership',
      ...(branchId === undefined ? {} : { branchId }),
    });
    return snapshot.memberships;
  }

  async activeMembershipId(
    identity: SessionIdentity,
    tenantId: string,
    branchId?: string,
  ): Promise<string> {
    const snapshot = await this.snapshot(identity, tenantId, branchId);
    const membership = snapshot.memberships.find(
      (candidate) =>
        candidate.status === 'ACTIVE' &&
        (branchId === undefined ||
          candidate.accessScope === 'ORGANIZATION' ||
          candidate.accessScope === 'ALL_BRANCHES' ||
          candidate.branchIds.includes(branchId)),
    );
    if (membership === undefined) throw new ForbiddenException('Authorization context denied');
    return membership.id;
  }

  async evaluate(
    identity: SessionIdentity,
    tenantId: string,
    input: Readonly<{
      permission: string;
      branchId?: string;
      resourceType: string;
      ownerUserId?: string;
      resourceStatus?: string;
    }>,
  ) {
    const snapshot = await this.snapshot(identity, tenantId, input.branchId);
    this.require(snapshot, 'authorization.evaluate', {
      tenantId,
      type: 'authorization',
      ...(input.branchId === undefined ? {} : { branchId: input.branchId }),
    });
    return this.engine.can(
      snapshot.actor,
      input.permission,
      {
        tenantId,
        type: input.resourceType,
        ...(input.branchId === undefined ? {} : { branchId: input.branchId }),
        ...(input.ownerUserId === undefined ? {} : { ownerUserId: input.ownerUserId }),
        ...(input.resourceStatus === undefined ? {} : { status: input.resourceStatus }),
      },
      snapshot.context,
    );
  }

  async assert(
    identity: SessionIdentity,
    tenantId: string,
    permission: string,
    resource: Omit<AuthorizationResource, 'tenantId'>,
    branchId?: string,
  ): Promise<void> {
    const snapshot = await this.snapshot(identity, tenantId, branchId);
    this.require(snapshot, permission, { ...resource, tenantId });
  }

  private async snapshot(
    identity: SessionIdentity,
    tenantId: string,
    branchId?: string,
  ): Promise<AuthorizationSnapshot> {
    const snapshot = await this.repository.resolve({
      tenantId,
      userId: identity.userId,
      ...(branchId === undefined ? {} : { branchId }),
    });
    if (snapshot === null) throw new ForbiddenException('Authorization context denied');
    return snapshot;
  }

  private require(
    snapshot: AuthorizationSnapshot,
    permission: string,
    resource: AuthorizationResource,
  ): void {
    const decision = this.engine.can(snapshot.actor, permission, resource, snapshot.context);
    if (!decision.allowed) throw new ForbiddenException('Authorization denied');
  }
}
