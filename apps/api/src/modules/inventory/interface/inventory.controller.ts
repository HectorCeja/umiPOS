import type { AuthenticationConfiguration } from '@nexo/config';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AUTHENTICATION_CONFIGURATION } from '../../authentication/application/authentication.ports.js';
import { AuthenticationService } from '../../authentication/application/authentication.service.js';
import { InventoryService } from '../application/inventory.service.js';
import {
  AvailabilityQuery,
  CompleteDto,
  CountDto,
  LocationDto,
  LocationPath,
  MovementDto,
  PolicyDto,
  ReleaseDto,
  ReservationDto,
  ReservationPath,
  TenantPath,
  TransferDto,
  TransferPath,
  UpdateLocationDto,
} from './inventory.dto.js';
@Controller({ path: 'v1', version: VERSION_NEUTRAL })
export class InventoryController {
  private readonly cookie: string;
  constructor(
    private readonly auth: AuthenticationService,
    private readonly inventory: InventoryService,
    @Inject(AUTHENTICATION_CONFIGURATION) private readonly config: AuthenticationConfiguration,
  ) {
    this.cookie = config.cookieSecure ? '__Host-nexo_session' : 'nexo_session';
  }
  @Get('organizations/:organizationId/inventory/locations') locations(
    @Param() p: TenantPath,
    @Query('branchId') branchId: string | undefined,
    @Query('includeArchived') includeArchived: string | undefined,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) =>
      this.inventory.locations(i, p.organizationId, branchId, includeArchived === 'true'),
    );
  }
  @Put('organizations/:organizationId/inventory/locations/:locationId') updateLocation(
    @Param() p: LocationPath,
    @Body() b: UpdateLocationDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.inventory.updateLocation(i, p.organizationId, p.locationId, b),
    );
  }
  @Post('organizations/:organizationId/inventory/locations') location(
    @Param() p: TenantPath,
    @Body() b: LocationDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.inventory.location(i, p.organizationId, b));
  }
  @Post('organizations/:organizationId/inventory/movements') movement(
    @Param() p: TenantPath,
    @Body() b: MovementDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.inventory.record(i, p.organizationId, b));
  }
  @Get('organizations/:organizationId/inventory/availability') availability(
    @Param() p: TenantPath,
    @Query() q: AvailabilityQuery,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) =>
      this.inventory.availability(i, p.organizationId, q.variantId, q.locationId),
    );
  }
  @Get('organizations/:organizationId/inventory/movements') timeline(
    @Param() p: TenantPath,
    @Query() q: AvailabilityQuery,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) =>
      this.inventory.timeline(i, p.organizationId, q.variantId, q.locationId),
    );
  }
  @Post('organizations/:organizationId/inventory/reservations') reserve(
    @Param() p: TenantPath,
    @Body() b: ReservationDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.inventory.reserve(i, p.organizationId, b));
  }
  @Post('organizations/:organizationId/inventory/reservations/:reservationId/release') release(
    @Param() p: ReservationPath,
    @Body() b: ReleaseDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.inventory.release(i, p.organizationId, p.reservationId, b.reason, b.idempotencyKey),
    );
  }
  @Post('organizations/:organizationId/inventory/transfers') transfer(
    @Param() p: TenantPath,
    @Body() b: TransferDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.inventory.transfer(i, p.organizationId, b));
  }
  @Post('organizations/:organizationId/inventory/transfers/:transferId/complete') complete(
    @Param() p: TransferPath,
    @Body() b: CompleteDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.inventory.completeTransfer(i, p.organizationId, p.transferId, b.idempotencyKey),
    );
  }
  @Post('organizations/:organizationId/inventory/counts') count(
    @Param() p: TenantPath,
    @Body() b: CountDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.inventory.count(i, p.organizationId, b));
  }
  @Put('organizations/:organizationId/inventory/policies') policy(
    @Param() p: TenantPath,
    @Body() b: PolicyDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.inventory.policy(i, p.organizationId, b));
  }
  private principal(r: FastifyRequest) {
    return this.auth.authenticate(r.cookies[this.cookie]);
  }
  private async write<T>(
    r: FastifyRequest,
    fn: (i: Awaited<ReturnType<AuthenticationService['authenticate']>>) => Promise<T>,
  ) {
    const origin = r.headers.origin;
    if (origin && !this.config.allowedOrigins.has(origin))
      throw new ForbiddenException('Request origin is not allowed');
    const i = await this.principal(r);
    const csrf = r.headers['x-csrf-token'];
    this.auth.assertCsrf(i, typeof csrf === 'string' ? csrf : undefined);
    return fn(i);
  }
}
