import type { AuthenticationConfiguration } from '@nexo/config';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { AUTHENTICATION_CONFIGURATION } from '../../authentication/application/authentication.ports.js';
import { AuthenticationService } from '../../authentication/application/authentication.service.js';
import { ControlPlaneService } from '../application/control-plane.service.js';
import {
  AcceptInvitationDto,
  BranchDto,
  BranchIdDto,
  CreateOrganizationDto,
  FeatureKeyDto,
  FeatureUpdateDto,
  InvitationDto,
  InvitationIdDto,
  MembershipIdDto,
  MembershipUpdateDto,
  OrganizationIdDto,
  SaveOnboardingDto,
  UpdateBranchDto,
  UpdateOrganizationDto,
  VersionDto,
} from './control-plane.dto.js';

@Controller({ path: 'v1', version: VERSION_NEUTRAL })
export class ControlPlaneController {
  private readonly accessCookie: string;
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly controlPlane: ControlPlaneService,
    @Inject(AUTHENTICATION_CONFIGURATION)
    private readonly configuration: AuthenticationConfiguration,
  ) {
    this.accessCookie = configuration.cookieSecure ? '__Host-nexo_session' : 'nexo_session';
  }

  @Get('organizations') organizations(@Req() req: FastifyRequest) {
    return this.principal(req).then((identity) => this.controlPlane.organizations(identity));
  }

  @Post('organizations') createOrganization(
    @Body() body: CreateOrganizationDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) => this.controlPlane.bootstrap(identity, body));
  }
  @Get('organizations/:organizationId') organization(
    @Param() p: OrganizationIdDto,
    @Req() req: FastifyRequest,
  ) {
    return this.principal(req).then((identity) =>
      this.controlPlane.organization(identity, p.organizationId),
    );
  }
  @Patch('organizations/:organizationId') updateOrganization(
    @Param() p: OrganizationIdDto,
    @Body() body: UpdateOrganizationDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.updateOrganization(identity, p.organizationId, body),
    );
  }
  @Delete('organizations/:organizationId') @HttpCode(204) archiveOrganization(
    @Param() p: OrganizationIdDto,
    @Query() q: VersionDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.archiveOrganization(identity, p.organizationId, q.version),
    );
  }

  @Get('organizations/:organizationId/branches') branches(
    @Param() p: OrganizationIdDto,
    @Req() req: FastifyRequest,
  ) {
    return this.principal(req).then((identity) =>
      this.controlPlane.branches(identity, p.organizationId),
    );
  }
  @Post('organizations/:organizationId/branches') createBranch(
    @Param() p: OrganizationIdDto,
    @Body() body: BranchDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.createBranch(identity, p.organizationId, body),
    );
  }
  @Patch('organizations/:organizationId/branches/:branchId') updateBranch(
    @Param() p: BranchIdDto,
    @Body() body: UpdateBranchDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.updateBranch(identity, p.organizationId, p.branchId, body),
    );
  }
  @Delete('organizations/:organizationId/branches/:branchId') archiveBranch(
    @Param() p: BranchIdDto,
    @Query() q: VersionDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.setBranchArchived(identity, p.organizationId, p.branchId, true, q.version),
    );
  }
  @Post('organizations/:organizationId/branches/:branchId/restore') @HttpCode(200) restoreBranch(
    @Param() p: BranchIdDto,
    @Body() body: VersionDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.setBranchArchived(
        identity,
        p.organizationId,
        p.branchId,
        false,
        body.version,
      ),
    );
  }

  @Get('business-templates') templates() {
    return this.controlPlane.templates();
  }
  @Get('organizations/:organizationId/onboarding') onboarding(
    @Param() p: OrganizationIdDto,
    @Req() req: FastifyRequest,
  ) {
    return this.principal(req).then((identity) =>
      this.controlPlane.onboarding(identity, p.organizationId),
    );
  }
  @Put('organizations/:organizationId/onboarding') saveOnboarding(
    @Param() p: OrganizationIdDto,
    @Body() body: SaveOnboardingDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.saveOnboarding(identity, p.organizationId, body),
    );
  }
  @Post('organizations/:organizationId/onboarding/complete') @HttpCode(200) completeOnboarding(
    @Param() p: OrganizationIdDto,
    @Body() body: VersionDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.completeOnboarding(identity, p.organizationId, body.version),
    );
  }
  @Post('organizations/:organizationId/onboarding/restart') @HttpCode(200) restartOnboarding(
    @Param() p: OrganizationIdDto,
    @Body() body: VersionDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.restartOnboarding(identity, p.organizationId, body.version),
    );
  }

  @Patch('organizations/:organizationId/features/:featureKey') setFeature(
    @Param() p: FeatureKeyDto,
    @Body() body: FeatureUpdateDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.setFeature(
        identity,
        p.organizationId,
        p.featureKey,
        body.enabled,
        body.version,
      ),
    );
  }
  @Get('organizations/:organizationId/invitations') invitations(
    @Param() p: OrganizationIdDto,
    @Req() req: FastifyRequest,
  ) {
    return this.principal(req).then((identity) =>
      this.controlPlane.invitations(identity, p.organizationId),
    );
  }
  @Post('organizations/:organizationId/invitations') invite(
    @Param() p: OrganizationIdDto,
    @Body() body: InvitationDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.invite(identity, p.organizationId, body),
    );
  }
  @Post('organizations/:organizationId/invitations/:invitationId/resend') @HttpCode(200) resend(
    @Param() p: InvitationIdDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.resend(identity, p.organizationId, p.invitationId),
    );
  }
  @Delete('organizations/:organizationId/invitations/:invitationId') @HttpCode(200) revoke(
    @Param() p: InvitationIdDto,
    @Query() q: VersionDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.revoke(identity, p.organizationId, p.invitationId, q.version),
    );
  }
  @Post('organizations/:organizationId/invitations/accept') accept(
    @Param() p: OrganizationIdDto,
    @Body() body: AcceptInvitationDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.accept(identity, p.organizationId, body.token),
    );
  }
  @Patch('organizations/:organizationId/memberships/:membershipId') updateMembership(
    @Param() p: MembershipIdDto,
    @Body() body: MembershipUpdateDto,
    @Req() req: FastifyRequest,
  ) {
    return this.write(req, (identity) =>
      this.controlPlane.updateMembership(identity, p.organizationId, p.membershipId, body),
    );
  }

  private principal(request: FastifyRequest) {
    return this.authentication.authenticate(request.cookies[this.accessCookie]);
  }
  private async write<T>(
    request: FastifyRequest,
    action: (identity: Awaited<ReturnType<AuthenticationService['authenticate']>>) => Promise<T>,
  ) {
    const origin = request.headers.origin;
    if (origin !== undefined && !this.configuration.allowedOrigins.has(origin))
      throw new ForbiddenException('Request origin is not allowed');
    const identity = await this.principal(request);
    const csrf = request.headers['x-csrf-token'];
    this.authentication.assertCsrf(identity, typeof csrf === 'string' ? csrf : undefined);
    return action(identity);
  }
}
