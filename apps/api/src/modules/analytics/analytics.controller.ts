import type { AuthenticationConfiguration } from '@nexo/config';
import { Controller, Get, Inject, Param, Query, Req, VERSION_NEUTRAL } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

import { AUTHENTICATION_CONFIGURATION } from '../authentication/application/authentication.ports.js';
import { AuthenticationService } from '../authentication/application/authentication.service.js';
import { AnalyticsPathDto, AnalyticsQueryDto } from './analytics.dto.js';
import { AnalyticsService } from './analytics.service.js';

@Controller({ path: 'v1', version: VERSION_NEUTRAL })
export class AnalyticsController {
  private readonly cookie: string;
  constructor(
    private readonly auth: AuthenticationService,
    private readonly analytics: AnalyticsService,
    @Inject(AUTHENTICATION_CONFIGURATION) config: AuthenticationConfiguration,
  ) {
    this.cookie = config.cookieSecure ? '__Host-nexo_session' : 'nexo_session';
  }

  @Get('organizations/:organizationId/analytics/overview')
  overview(
    @Param() path: AnalyticsPathDto,
    @Query() query: AnalyticsQueryDto,
    @Req() request: FastifyRequest,
  ) {
    return this.auth
      .authenticate(request.cookies[this.cookie])
      .then((identity) => this.analytics.overview(identity, path.organizationId, query));
  }
}
