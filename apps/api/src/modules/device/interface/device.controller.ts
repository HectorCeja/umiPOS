import type { AuthenticationConfiguration } from '@nexo/config';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AUTHENTICATION_CONFIGURATION } from '../../authentication/application/authentication.ports.js';
import { AuthenticationService } from '../../authentication/application/authentication.service.js';
import { DeviceService } from '../application/device.service.js';
import {
  ConsumeEnrollmentDto,
  CreateEnrollmentDto,
  DeviceOrganizationPathDto,
  DevicePathDto,
  DeviceRevokeDto,
  DeviceStatusDto,
  RotateCredentialDto,
} from './device.dto.js';

@Controller({ path: 'v1', version: VERSION_NEUTRAL })
export class DeviceController {
  private readonly cookie: string;
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly devices: DeviceService,
    @Inject(AUTHENTICATION_CONFIGURATION) private readonly config: AuthenticationConfiguration,
  ) {
    this.cookie = config.cookieSecure ? '__Host-nexo_session' : 'nexo_session';
  }

  @Post('organizations/:organizationId/device-enrollments')
  create(
    @Param() p: DeviceOrganizationPathDto,
    @Body() body: CreateEnrollmentDto,
    @Req() request: FastifyRequest,
  ) {
    return this.write(request, (identity) =>
      this.devices.createEnrollment(identity, p.organizationId, body),
    );
  }

  @Post('organizations/:organizationId/device-enrollments/consume')
  consume(@Param() p: DeviceOrganizationPathDto, @Body() body: ConsumeEnrollmentDto) {
    return this.devices.consume(p.organizationId, body);
  }

  @Get('organizations/:organizationId/devices/current')
  current(
    @Param() p: DeviceOrganizationPathDto,
    @Headers('x-nexo-device-credential') credential?: string,
  ) {
    return this.devices.authenticate(p.organizationId, credential);
  }

  @Post('organizations/:organizationId/devices/current/heartbeat')
  heartbeat(
    @Param() p: DeviceOrganizationPathDto,
    @Headers('x-nexo-device-credential') credential?: string,
  ) {
    return this.devices.authenticate(p.organizationId, credential);
  }

  @Get('organizations/:organizationId/devices')
  list(@Param() p: DeviceOrganizationPathDto, @Req() request: FastifyRequest) {
    return this.principal(request).then((identity) =>
      this.devices.list(identity, p.organizationId),
    );
  }

  @Post('organizations/:organizationId/devices/:deviceId/revoke')
  revoke(@Param() p: DevicePathDto, @Body() body: DeviceRevokeDto, @Req() request: FastifyRequest) {
    return this.write(request, (identity) =>
      this.devices.revoke(identity, p.organizationId, p.deviceId, body.reason),
    );
  }

  @Patch('organizations/:organizationId/devices/:deviceId/status')
  status(@Param() p: DevicePathDto, @Body() body: DeviceStatusDto, @Req() request: FastifyRequest) {
    return this.write(request, (identity) =>
      this.devices.setStatus(identity, p.organizationId, p.deviceId, body.status, body.reason),
    );
  }

  @Post('organizations/:organizationId/devices/:deviceId/rotate-credential')
  rotate(
    @Param() p: DevicePathDto,
    @Body() body: RotateCredentialDto,
    @Req() request: FastifyRequest,
  ) {
    return this.write(request, (identity) =>
      this.devices.rotate(identity, p.organizationId, p.deviceId, body.idempotencyKey),
    );
  }

  private principal(request: FastifyRequest) {
    return this.authentication.authenticate(request.cookies[this.cookie]);
  }
  private async write<T>(
    request: FastifyRequest,
    operation: (identity: Awaited<ReturnType<AuthenticationService['authenticate']>>) => Promise<T>,
  ) {
    const origin = request.headers.origin;
    if (origin && !this.config.allowedOrigins.has(origin))
      throw new ForbiddenException('Request origin is not allowed');
    const identity = await this.principal(request);
    const csrf = request.headers['x-csrf-token'];
    this.authentication.assertCsrf(identity, typeof csrf === 'string' ? csrf : undefined);
    return operation(identity);
  }
}
