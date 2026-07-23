import type { AuthenticationConfiguration } from '@nexo/config';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
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
import { SalesService } from '../application/sales.service.js';
import {
  AddSaleItemDto,
  CreateSaleDto,
  PaymentDto,
  PaymentAttemptPath,
  ReasonDto,
  RefundDto,
  SalePath,
  SalesListQuery,
  SalesAdminQueryDto,
  SalesTenantPath,
  SalesPolicyDto,
} from './sales.dto.js';

@Controller({ path: 'v1', version: VERSION_NEUTRAL })
export class SalesController {
  private readonly cookie: string;
  constructor(
    private readonly auth: AuthenticationService,
    private readonly sales: SalesService,
    @Inject(AUTHENTICATION_CONFIGURATION) private readonly config: AuthenticationConfiguration,
  ) {
    this.cookie = config.cookieSecure ? '__Host-nexo_session' : 'nexo_session';
  }
  @Post('organizations/:organizationId/sales') create(
    @Param() p: SalesTenantPath,
    @Body() b: CreateSaleDto,
    @Headers('idempotency-key') k: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.sales.create(i, p.organizationId, b, this.key(k)));
  }
  @Get('organizations/:organizationId/sales-administration/overview') overview(
    @Param() p: SalesTenantPath,
    @Query() q: SalesAdminQueryDto,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.overview(i, p.organizationId, q));
  }
  @Get('organizations/:organizationId/sales-administration/history') history(
    @Param() p: SalesTenantPath,
    @Query() q: SalesAdminQueryDto,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.search(i, p.organizationId, q));
  }
  @Get('organizations/:organizationId/sales-administration/refunds') refunds(
    @Param() p: SalesTenantPath,
    @Query() q: SalesAdminQueryDto,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.refunds(i, p.organizationId, q));
  }
  @Get('organizations/:organizationId/sales-administration/receipts') receipts(
    @Param() p: SalesTenantPath,
    @Query() q: SalesAdminQueryDto,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.receipts(i, p.organizationId, q));
  }
  @Get('organizations/:organizationId/sales-administration/exceptions') exceptions(
    @Param() p: SalesTenantPath,
    @Query() q: SalesAdminQueryDto,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.exceptions(i, p.organizationId, q));
  }
  @Get('organizations/:organizationId/sales-administration/:saleId/detail') detail(
    @Param() p: SalePath,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.detail(i, p.organizationId, p.saleId));
  }
  @Get('organizations/:organizationId/sales-administration/:saleId/timeline') timeline(
    @Param() p: SalePath,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.timeline(i, p.organizationId, p.saleId));
  }
  @Get('organizations/:organizationId/sales-administration/:saleId/diagnostic') diagnostic(
    @Param() p: SalePath,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.diagnostic(i, p.organizationId, p.saleId));
  }
  @Get('organizations/:organizationId/sales') list(
    @Param() p: SalesTenantPath,
    @Query() q: SalesListQuery,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.list(i, p.organizationId, q.branchId));
  }
  @Get('organizations/:organizationId/sales/:saleId') get(
    @Param() p: SalePath,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.get(i, p.organizationId, p.saleId));
  }
  @Post('organizations/:organizationId/sales/:saleId/items') add(
    @Param() p: SalePath,
    @Body() b: AddSaleItemDto,
    @Headers('idempotency-key') k: string,
    @Headers('if-match') v: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.sales.add(i, p.organizationId, p.saleId, this.version(v), this.key(k), b),
    );
  }
  @Post('organizations/:organizationId/sales/:saleId/checkout') checkout(
    @Param() p: SalePath,
    @Headers('idempotency-key') k: string,
    @Headers('if-match') v: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.sales.prepare(i, p.organizationId, p.saleId, this.version(v), this.key(k)),
    );
  }
  @Post('organizations/:organizationId/sales/:saleId/payments') payment(
    @Param() p: SalePath,
    @Body() b: PaymentDto,
    @Headers('idempotency-key') k: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.sales.payment(i, p.organizationId, p.saleId, this.key(k), b));
  }
  @Get('organizations/:organizationId/sales/:saleId/payments/:paymentAttemptId/outcome') outcome(
    @Param() p: PaymentAttemptPath,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) =>
      this.sales.paymentOutcome(i, p.organizationId, p.saleId, p.paymentAttemptId),
    );
  }
  @Get('organizations/:organizationId/sales/:saleId/payment-outcome') outcomeByKey(
    @Param() p: SalePath,
    @Query('idempotencyKey') key: string,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) =>
      this.sales.paymentOutcomeByKey(i, p.organizationId, p.saleId, this.key(key)),
    );
  }
  @Post('organizations/:organizationId/sales/:saleId/complete') complete(
    @Param() p: SalePath,
    @Headers('idempotency-key') k: string,
    @Headers('if-match') v: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.sales.complete(i, p.organizationId, p.saleId, this.version(v), this.key(k)),
    );
  }
  @Post('organizations/:organizationId/sales/:saleId/suspend') suspend(
    @Param() p: SalePath,
    @Headers('idempotency-key') k: string,
    @Headers('if-match') v: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.sales.transition(
        i,
        p.organizationId,
        p.saleId,
        this.version(v),
        this.key(k),
        'SUSPENDED',
        'sales.suspend',
      ),
    );
  }
  @Post('organizations/:organizationId/sales/:saleId/resume') resume(
    @Param() p: SalePath,
    @Headers('idempotency-key') k: string,
    @Headers('if-match') v: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.sales.transition(
        i,
        p.organizationId,
        p.saleId,
        this.version(v),
        this.key(k),
        'OPEN',
        'sales.resume',
      ),
    );
  }
  @Post('organizations/:organizationId/sales/:saleId/cancel') cancel(
    @Param() p: SalePath,
    @Body() b: ReasonDto,
    @Headers('idempotency-key') k: string,
    @Headers('if-match') v: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.sales.transition(
        i,
        p.organizationId,
        p.saleId,
        this.version(v),
        this.key(k),
        'CANCELLED',
        'sales.cancel',
        b.reason,
      ),
    );
  }
  @Post('organizations/:organizationId/sales/:saleId/refunds') @HttpCode(202) refund(
    @Param() p: SalePath,
    @Body() b: RefundDto,
    @Headers('idempotency-key') k: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.sales.refund(i, p.organizationId, p.saleId, this.key(k), b));
  }
  @Post('organizations/:organizationId/sales/:saleId/receipt') receipt(
    @Param() p: SalePath,
    @Headers('idempotency-key') k: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.sales.receipt(i, p.organizationId, p.saleId, this.key(k)));
  }
  @Post('organizations/:organizationId/sales/:saleId/refunds/:refundId/approve')
  @HttpCode(200)
  approveRefund(
    @Param('organizationId') organizationId: string,
    @Param('saleId') saleId: string,
    @Param('refundId') refundId: string,
    @Body() b: ReasonDto,
    @Headers('idempotency-key') k: string,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.sales.approveRefund(i, organizationId, saleId, refundId, this.key(k), b.reason),
    );
  }
  @Get('organizations/:organizationId/sales/policies') policy(
    @Param() p: SalesTenantPath,
    @Query() q: SalesListQuery,
    @Req() r: FastifyRequest,
  ) {
    const branchId = q.branchId;
    if (!branchId) throw new ForbiddenException('branchId required');
    return this.principal(r).then((i) => this.sales.policy(i, p.organizationId, branchId));
  }
  @Put('organizations/:organizationId/sales/policies') updatePolicy(
    @Param() p: SalesTenantPath,
    @Query() q: SalesListQuery,
    @Body() b: SalesPolicyDto,
    @Headers('idempotency-key') k: string,
    @Req() r: FastifyRequest,
  ) {
    this.key(k);
    const branchId = q.branchId;
    if (!branchId) throw new ForbiddenException('branchId required');
    return this.write(r, (i) => this.sales.updatePolicy(i, p.organizationId, branchId, b));
  }
  @Get('organizations/:organizationId/external-mappings') mappings(
    @Param() p: SalesTenantPath,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.sales.mappings(i, p.organizationId));
  }
  private principal(r: FastifyRequest) {
    return this.auth.authenticate(r.cookies[this.cookie]);
  }
  private key(value: string | undefined) {
    if (!value || value.length < 8 || value.length > 160)
      throw new ForbiddenException('Idempotency-Key required');
    return value;
  }
  private version(value: string | undefined) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1)
      throw new ForbiddenException('If-Match version required');
    return parsed;
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
