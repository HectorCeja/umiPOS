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
  Post,
  Patch,
  Req,
  Res,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

import {
  AuthenticationService,
  type IssuedSession,
} from '../application/authentication.service.js';
import {
  AUTHENTICATION_CONFIGURATION,
  type RequestEvidence,
} from '../application/authentication.ports.js';
import {
  EmailRequestDto,
  LoginDto,
  PasswordResetCompleteDto,
  SessionIdDto,
  TokenCompleteDto,
  UpdateProfileDto,
  PrepareProfileAvatarDto,
  CompleteProfileAvatarDto,
} from './authentication.dto.js';
import { authenticationRoutes } from './authentication.routes.js';

@Controller({ path: 'v1', version: VERSION_NEUTRAL })
export class AuthenticationController {
  private readonly accessCookie: string;
  private readonly refreshCookie: string;
  private readonly csrfCookie: string;

  constructor(
    private readonly authentication: AuthenticationService,
    @Inject(AUTHENTICATION_CONFIGURATION)
    private readonly configuration: AuthenticationConfiguration,
  ) {
    this.accessCookie = configuration.cookieSecure ? '__Host-nexo_session' : 'nexo_session';
    this.refreshCookie = configuration.cookieSecure ? '__Host-nexo_refresh' : 'nexo_refresh';
    this.csrfCookie = configuration.cookieSecure ? '__Host-nexo_csrf' : 'nexo_csrf';
  }

  @Post(authenticationRoutes.login)
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    this.assertOrigin(request);
    const issued = await this.authentication.login(body, this.evidence(request));
    this.setSessionCookies(response, issued);
    return { status: 'authenticated' };
  }

  @Post(authenticationRoutes.refresh)
  @HttpCode(200)
  async refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    this.assertOrigin(request);
    const issued = await this.authentication.refresh(
      request.cookies[this.refreshCookie],
      this.csrfHeader(request),
      this.evidence(request),
    );
    this.setSessionCookies(response, issued);
    return { status: 'refreshed' };
  }

  @Post(authenticationRoutes.logout)
  @HttpCode(204)
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) response: FastifyReply) {
    this.assertOrigin(request);
    const identity = await this.principal(request);
    this.authentication.assertCsrf(identity, this.csrfHeader(request));
    await this.authentication.logout(identity, this.evidence(request));
    this.clearSessionCookies(response);
  }

  @Post(authenticationRoutes.logoutAll)
  @HttpCode(204)
  async logoutAll(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    this.assertOrigin(request);
    const identity = await this.principal(request);
    this.authentication.assertCsrf(identity, this.csrfHeader(request));
    await this.authentication.logoutAll(identity, this.evidence(request));
    this.clearSessionCookies(response);
  }

  @Post(authenticationRoutes.requestPasswordReset)
  @HttpCode(202)
  async requestPasswordReset(@Body() body: EmailRequestDto, @Req() request: FastifyRequest) {
    this.assertOrigin(request);
    await this.authentication.requestPasswordReset(body.email, this.evidence(request));
    return { status: 'accepted' };
  }

  @Post(authenticationRoutes.completePasswordReset)
  @HttpCode(204)
  async completePasswordReset(
    @Body() body: PasswordResetCompleteDto,
    @Req() request: FastifyRequest,
  ) {
    this.assertOrigin(request);
    await this.authentication.completePasswordReset(
      body.token,
      body.password,
      this.evidence(request),
    );
  }

  @Post(authenticationRoutes.requestEmailVerification)
  @HttpCode(202)
  async requestEmailVerification(@Body() body: EmailRequestDto, @Req() request: FastifyRequest) {
    this.assertOrigin(request);
    await this.authentication.requestEmailVerification(body.email, this.evidence(request));
    return { status: 'accepted' };
  }

  @Post(authenticationRoutes.completeEmailVerification)
  @HttpCode(204)
  async completeEmailVerification(@Body() body: TokenCompleteDto, @Req() request: FastifyRequest) {
    this.assertOrigin(request);
    await this.authentication.completeEmailVerification(body.token, this.evidence(request));
  }

  @Get(authenticationRoutes.identity)
  async getIdentity(@Req() request: FastifyRequest) {
    const identity = await this.principal(request);
    return {
      displayName: identity.displayName,
      avatarUrl: identity.avatarUrl ?? null,
      email: identity.email,
      emailVerified: identity.emailVerified,
      mfaStatus: identity.mfaStatus,
      sessionId: identity.sessionId,
      userId: identity.userId,
    };
  }

  @Patch(authenticationRoutes.profile)
  async updateProfile(@Body() body: UpdateProfileDto, @Req() request: FastifyRequest) {
    this.assertOrigin(request);
    const identity = await this.principal(request);
    this.authentication.assertCsrf(identity, this.csrfHeader(request));
    return this.authentication.updateProfile(identity, body, this.evidence(request));
  }

  @Post(authenticationRoutes.prepareProfileAvatar)
  async prepareProfileAvatar(
    @Body() body: PrepareProfileAvatarDto,
    @Req() request: FastifyRequest,
  ) {
    this.assertOrigin(request);
    const identity = await this.principal(request);
    this.authentication.assertCsrf(identity, this.csrfHeader(request));
    return this.authentication.prepareProfileAvatar(identity, body);
  }

  @Post(authenticationRoutes.completeProfileAvatar)
  async completeProfileAvatar(
    @Body() body: CompleteProfileAvatarDto,
    @Req() request: FastifyRequest,
  ) {
    this.assertOrigin(request);
    const identity = await this.principal(request);
    this.authentication.assertCsrf(identity, this.csrfHeader(request));
    return this.authentication.completeProfileAvatar(identity, body.objectKey);
  }

  @Delete(authenticationRoutes.removeProfileAvatar)
  async removeProfileAvatar(@Req() request: FastifyRequest) {
    this.assertOrigin(request);
    const identity = await this.principal(request);
    this.authentication.assertCsrf(identity, this.csrfHeader(request));
    return this.authentication.removeProfileAvatar(identity);
  }

  @Get(authenticationRoutes.profileAvatar)
  async profileAvatar(
    @Param('token') token: string,
    @Req() request: FastifyRequest,
    @Res() response: FastifyReply,
  ) {
    const media = await this.authentication.getProfileAvatar(await this.principal(request), token);
    response.header(
      'content-type',
      String(media.metadata.metaData['content-type'] ?? 'application/octet-stream'),
    );
    response.header('cache-control', 'private, max-age=300');
    return response.send(media.stream);
  }

  @Get(authenticationRoutes.listSessions)
  async listSessions(@Req() request: FastifyRequest) {
    return this.authentication.listSessions(await this.principal(request));
  }

  @Delete(authenticationRoutes.revokeSession)
  @HttpCode(204)
  async revokeSession(
    @Param() parameter: SessionIdDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    this.assertOrigin(request);
    const identity = await this.principal(request);
    this.authentication.assertCsrf(identity, this.csrfHeader(request));
    await this.authentication.revokeSession(identity, parameter.sessionId, this.evidence(request));
    if (parameter.sessionId === identity.sessionId) this.clearSessionCookies(response);
  }

  private principal(request: FastifyRequest) {
    return this.authentication.authenticate(request.cookies[this.accessCookie]);
  }

  private csrfHeader(request: FastifyRequest): string | undefined {
    const value = request.headers['x-csrf-token'];
    return typeof value === 'string' ? value : undefined;
  }

  private assertOrigin(request: FastifyRequest): void {
    const origin = request.headers.origin;
    if (origin !== undefined && !this.configuration.allowedOrigins.has(origin)) {
      throw new ForbiddenException('Request origin is not allowed');
    }
  }

  private evidence(request: FastifyRequest): RequestEvidence {
    return {
      ipAddress: request.ip.slice(0, 64),
      userAgent: String(request.headers['user-agent'] ?? 'unknown').slice(0, 512),
    };
  }

  private setSessionCookies(response: FastifyReply, issued: IssuedSession): void {
    const common = {
      path: '/',
      sameSite: 'strict' as const,
      secure: this.configuration.cookieSecure,
    };
    response.setCookie(this.accessCookie, issued.accessToken, {
      ...common,
      httpOnly: true,
      maxAge: issued.accessMaxAgeSeconds,
    });
    response.setCookie(this.refreshCookie, issued.refreshToken, {
      ...common,
      httpOnly: true,
      maxAge: issued.refreshMaxAgeSeconds,
    });
    response.setCookie(this.csrfCookie, issued.csrfToken, {
      ...common,
      httpOnly: false,
      maxAge: issued.refreshMaxAgeSeconds,
    });
    response.header('Cache-Control', 'no-store');
  }

  private clearSessionCookies(response: FastifyReply): void {
    for (const cookie of [this.accessCookie, this.refreshCookie, this.csrfCookie]) {
      response.clearCookie(cookie, {
        path: '/',
        sameSite: 'strict',
        secure: this.configuration.cookieSecure,
      });
    }
    response.header('Cache-Control', 'no-store');
    if (this.configuration.cookieSecure) {
      response.header('Clear-Site-Data', '"cache", "cookies", "storage"');
    }
  }
}
