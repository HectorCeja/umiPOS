import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type {} from '@fastify/cookie';
import type { FastifyReply, FastifyRequest } from 'fastify';

import {
  IdentityService,
  type AuthenticatedIdentity,
  type IssuedSession,
  type RequestEvidence,
} from '../application/identity.service.js';
import {
  LoginDto,
  DeviceIdDto,
  PasswordResetCompleteDto,
  PasswordResetRequestDto,
  SessionIdDto,
  VerifyEmailDto,
} from './identity.dto.js';

const COOKIE_SECURE = process.env.COOKIE_SECURE !== 'false';
const ACCESS_COOKIE = COOKIE_SECURE ? '__Host-nexo_session' : 'nexo_session';
const REFRESH_COOKIE = COOKIE_SECURE ? '__Host-nexo_refresh' : 'nexo_refresh';
const CSRF_COOKIE = COOKIE_SECURE ? '__Host-nexo_csrf' : 'nexo_csrf';

@Controller({ path: 'v1', version: VERSION_NEUTRAL })
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Post('auth/login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const issued = await this.identity.login(body, this.evidence(request));
    this.setSessionCookies(response, issued);
    return { status: 'authenticated' };
  }

  @Post('auth/refresh')
  @HttpCode(200)
  async refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    this.assertCsrf(request);
    const issued = await this.identity.refresh(
      request.cookies[REFRESH_COOKIE],
      this.evidence(request),
    );
    this.setSessionCookies(response, issued);
    return { status: 'refreshed' };
  }

  @Post('auth/logout')
  @HttpCode(204)
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) response: FastifyReply) {
    this.assertCsrf(request);
    const principal = await this.principal(request);
    await this.identity.logout(principal, this.evidence(request));
    this.clearSessionCookies(response);
  }

  @Post('auth/logout-all')
  @HttpCode(204)
  async logoutAll(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    this.assertCsrf(request);
    const principal = await this.principal(request);
    await this.identity.logoutAll(principal, this.evidence(request));
    this.clearSessionCookies(response);
  }

  @Post('auth/password-reset/request')
  @HttpCode(202)
  async requestPasswordReset(
    @Body() body: PasswordResetRequestDto,
    @Req() request: FastifyRequest,
  ) {
    await this.identity.requestPasswordReset(body.email, this.evidence(request));
    return { status: 'accepted' };
  }

  @Post('auth/password-reset/complete')
  @HttpCode(204)
  async completePasswordReset(
    @Body() body: PasswordResetCompleteDto,
    @Req() request: FastifyRequest,
  ) {
    await this.identity.completePasswordReset(body.token, body.password, this.evidence(request));
  }

  @Post('auth/email-verification/request')
  @HttpCode(202)
  async requestEmailVerification(
    @Body() body: PasswordResetRequestDto,
    @Req() request: FastifyRequest,
  ) {
    await this.identity.requestEmailVerification(body.email, this.evidence(request));
    return { status: 'accepted' };
  }

  @Post('auth/email-verification/complete')
  @HttpCode(204)
  async verifyEmail(@Body() body: VerifyEmailDto, @Req() request: FastifyRequest) {
    await this.identity.verifyEmail(body.token, this.evidence(request));
  }

  @Get('identity')
  async getIdentity(@Req() request: FastifyRequest) {
    return this.principal(request);
  }

  @Get('sessions')
  async listSessions(@Req() request: FastifyRequest) {
    const principal = await this.principal(request);
    return this.identity.listSessions(principal.userId);
  }

  @Delete('sessions/:sessionId')
  @HttpCode(204)
  async revokeSession(@Param() parameter: SessionIdDto, @Req() request: FastifyRequest) {
    this.assertCsrf(request);
    const principal = await this.principal(request);
    await this.identity.revokeSession(
      parameter.sessionId,
      principal.userId,
      'remote_revoke',
      this.evidence(request),
    );
  }

  @Get('devices')
  async listDevices(@Req() request: FastifyRequest) {
    const principal = await this.principal(request);
    return this.identity.listDevices(principal.userId);
  }

  @Delete('devices/:deviceId')
  @HttpCode(204)
  async revokeDevice(@Param() parameter: DeviceIdDto, @Req() request: FastifyRequest) {
    this.assertCsrf(request);
    const principal = await this.principal(request);
    await this.identity.revokeDevice(parameter.deviceId, principal.userId, this.evidence(request));
  }

  private principal(request: FastifyRequest): Promise<AuthenticatedIdentity> {
    return this.identity.authenticate(request.cookies[ACCESS_COOKIE]);
  }

  private assertCsrf(request: FastifyRequest): void {
    const cookie = request.cookies[CSRF_COOKIE];
    const header = request.headers['x-csrf-token'];
    if (!cookie || typeof header !== 'string' || cookie !== header)
      throw new UnauthorizedException();
  }

  private evidence(request: FastifyRequest): RequestEvidence {
    return {
      ipAddress: request.ip,
      userAgent: String(request.headers['user-agent'] ?? 'unknown').slice(0, 512),
    };
  }

  private setSessionCookies(response: FastifyReply, issued: IssuedSession): void {
    const common = {
      httpOnly: true,
      path: '/',
      sameSite: 'strict' as const,
      secure: COOKIE_SECURE,
    };
    response.setCookie(ACCESS_COOKIE, issued.accessToken, {
      ...common,
      maxAge: issued.accessMaxAgeSeconds,
    });
    response.setCookie(REFRESH_COOKIE, issued.refreshToken, {
      ...common,
      maxAge: issued.refreshMaxAgeSeconds,
    });
    response.setCookie(CSRF_COOKIE, issued.csrfToken, {
      ...common,
      httpOnly: false,
      maxAge: issued.refreshMaxAgeSeconds,
    });
  }

  private clearSessionCookies(response: FastifyReply): void {
    for (const cookie of [ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE])
      response.clearCookie(cookie, { path: '/' });
    if (COOKIE_SECURE) response.header('Clear-Site-Data', '"cache", "cookies", "storage"');
  }
}
