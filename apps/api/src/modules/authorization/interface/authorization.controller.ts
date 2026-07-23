import type { AuthenticationConfiguration } from '@nexo/config';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  Req,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { AUTHENTICATION_CONFIGURATION } from '../../authentication/application/authentication.ports.js';
import { AuthenticationService } from '../../authentication/application/authentication.service.js';
import { AuthorizationService } from '../application/authorization.service.js';
import {
  AuthorizationQueryDto,
  OrganizationIdDto,
  PermissionEvaluationDto,
} from './authorization.dto.js';
import { authorizationRoutes } from './authorization.routes.js';

@Controller({ path: 'v1/organizations/:organizationId', version: VERSION_NEUTRAL })
export class AuthorizationController {
  private readonly accessCookie: string;

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly authorization: AuthorizationService,
    @Inject(AUTHENTICATION_CONFIGURATION)
    configuration: AuthenticationConfiguration,
  ) {
    this.accessCookie = configuration.cookieSecure ? '__Host-nexo_session' : 'nexo_session';
  }

  @Get(authorizationRoutes.context)
  async context(
    @Param() parameter: OrganizationIdDto,
    @Query() query: AuthorizationQueryDto,
    @Req() request: FastifyRequest,
  ) {
    return this.authorization.context(
      await this.principal(request),
      parameter.organizationId,
      query.branchId,
    );
  }

  @Get(authorizationRoutes.roles)
  async roles(
    @Param() parameter: OrganizationIdDto,
    @Query() query: AuthorizationQueryDto,
    @Req() request: FastifyRequest,
  ) {
    return this.authorization.roles(
      await this.principal(request),
      parameter.organizationId,
      query.branchId,
    );
  }

  @Get(authorizationRoutes.permissions)
  async permissions(
    @Param() parameter: OrganizationIdDto,
    @Query() query: AuthorizationQueryDto,
    @Req() request: FastifyRequest,
  ) {
    return this.authorization.permissions(
      await this.principal(request),
      parameter.organizationId,
      query.branchId,
    );
  }

  @Get(authorizationRoutes.featureFlags)
  async features(
    @Param() parameter: OrganizationIdDto,
    @Query() query: AuthorizationQueryDto,
    @Req() request: FastifyRequest,
  ) {
    return this.authorization.features(
      await this.principal(request),
      parameter.organizationId,
      query.branchId,
    );
  }

  @Get(authorizationRoutes.memberships)
  async memberships(
    @Param() parameter: OrganizationIdDto,
    @Query() query: AuthorizationQueryDto,
    @Req() request: FastifyRequest,
  ) {
    return this.authorization.memberships(
      await this.principal(request),
      parameter.organizationId,
      query.branchId,
    );
  }

  @Post(authorizationRoutes.evaluate)
  @HttpCode(200)
  async evaluate(
    @Param() parameter: OrganizationIdDto,
    @Body() body: PermissionEvaluationDto,
    @Req() request: FastifyRequest,
  ) {
    return this.authorization.evaluate(await this.principal(request), parameter.organizationId, {
      permission: body.permission,
      resourceType: body.resource.type,
      ...(body.resource.branchId === undefined ? {} : { branchId: body.resource.branchId }),
      ...(body.resource.ownerUserId === undefined
        ? {}
        : { ownerUserId: body.resource.ownerUserId }),
      ...(body.resource.status === undefined ? {} : { resourceStatus: body.resource.status }),
    });
  }

  private principal(request: FastifyRequest) {
    return this.authentication.authenticate(request.cookies[this.accessCookie]);
  }
}
