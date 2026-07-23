import type { AuthenticationConfiguration } from '@nexo/config';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AUTHENTICATION_CONFIGURATION } from '../../authentication/application/authentication.ports.js';
import { AuthenticationService } from '../../authentication/application/authentication.service.js';
import { CashService } from '../application/cash.service.js';
import {
  ApprovalDecisionDto,
  ApprovalRequestDto,
  CashSessionPath,
  CashTenantPath,
  CloseDto,
  CountDto,
  DepositDto,
  DepositTransitionDto,
  DrawerDto,
  CompleteHandoffDto,
  CountHandoffDto,
  DecideHandoffDto,
  IdempotencyDto,
  InitiateHandoffDto,
  MovementDto,
  OpenSessionDto,
  PolicyDto,
  RegisterDto,
  UpdateDrawerDto,
  UpdateRegisterDto,
  ReopenDto,
  TransferDto,
  TransitionSessionDto,
} from './cash.dto.js';
@Controller({ path: 'v1', version: VERSION_NEUTRAL })
export class CashController {
  private readonly cookie: string;
  private readonly allowedOrigins: ReadonlySet<string>;
  constructor(
    private readonly auth: AuthenticationService,
    private readonly cash: CashService,
    @Inject(AUTHENTICATION_CONFIGURATION) config: AuthenticationConfiguration,
  ) {
    this.cookie = config.cookieSecure ? '__Host-nexo_session' : 'nexo_session';
    this.allowedOrigins = config.allowedOrigins;
  }
  @Post('organizations/:organizationId/cash/registers') register(
    @Param() p: CashTenantPath,
    @Body() b: RegisterDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.register(i, p.organizationId, b));
  }
  @Patch('organizations/:organizationId/cash/registers/:registerId') updateRegister(
    @Param('organizationId') t: string,
    @Param('registerId') id: string,
    @Body() b: UpdateRegisterDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.updateRegister(i, t, id, b));
  }
  @Post('organizations/:organizationId/cash/drawers') drawer(
    @Param() p: CashTenantPath,
    @Body() b: DrawerDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.drawer(i, p.organizationId, b));
  }
  @Patch('organizations/:organizationId/cash/drawers/:drawerId') updateDrawer(
    @Param('organizationId') t: string,
    @Param('drawerId') id: string,
    @Body() b: UpdateDrawerDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.updateDrawer(i, t, id, b));
  }
  @Post('organizations/:organizationId/cash/sessions/open') open(
    @Param() p: CashTenantPath,
    @Body() b: OpenSessionDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.open(i, p.organizationId, b));
  }
  @Post('organizations/:organizationId/cash/sessions/:sessionId/movements') movement(
    @Param() p: CashSessionPath,
    @Body() b: MovementDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.movement(i, p.organizationId, p.sessionId, b));
  }
  @Post('organizations/:organizationId/cash/sessions/:sessionId/counts') count(
    @Param() p: CashSessionPath,
    @Body() b: CountDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.count(i, p.organizationId, p.sessionId, b));
  }
  @Post('organizations/:organizationId/cash/sessions/:sessionId/reconcile') reconcile(
    @Param() p: CashSessionPath,
    @Body() b: IdempotencyDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.cash.reconcile(i, p.organizationId, p.sessionId, b.idempotencyKey),
    );
  }
  @Post('organizations/:organizationId/cash/sessions/:sessionId/close') close(
    @Param() p: CashSessionPath,
    @Body() b: CloseDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.close(i, p.organizationId, p.sessionId, b));
  }
  @Get('organizations/:organizationId/cash/sessions/active') active(
    @Param() p: CashTenantPath,
    @Query('branchId') branchId: string,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.cash.active(i, p.organizationId, branchId));
  }
  @Get('organizations/:organizationId/cash/sessions/:sessionId') get(
    @Param() p: CashSessionPath,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.cash.get(i, p.organizationId, p.sessionId));
  }
  @Get('organizations/:organizationId/cash/sessions/:sessionId/timeline') timeline(
    @Param() p: CashSessionPath,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.cash.timeline(i, p.organizationId, p.sessionId));
  }
  @Get('organizations/:organizationId/cash/sessions/:sessionId/summary') summary(
    @Param() p: CashSessionPath,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.cash.summary(i, p.organizationId, p.sessionId));
  }
  @Post('organizations/:organizationId/cash/sessions/:sessionId/suspend') suspend(
    @Param() p: CashSessionPath,
    @Body() b: TransitionSessionDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) =>
      this.cash.transition(i, p.organizationId, p.sessionId, 'SUSPENDED', b),
    );
  }
  @Post('organizations/:organizationId/cash/sessions/:sessionId/resume') resume(
    @Param() p: CashSessionPath,
    @Body() b: TransitionSessionDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.transition(i, p.organizationId, p.sessionId, 'OPEN', b));
  }
  @Get('organizations/:organizationId/cash/policies') policy(
    @Param() p: CashTenantPath,
    @Query('branchId') b: string | undefined,
    @Query('registerId') reg: string | undefined,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.cash.policy(i, p.organizationId, b, reg));
  }
  @Post('organizations/:organizationId/cash/policies') savePolicy(
    @Param() p: CashTenantPath,
    @Body() b: PolicyDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.savePolicy(i, p.organizationId, b));
  }
  @Post('organizations/:organizationId/cash/approvals') requestApproval(
    @Param() p: CashTenantPath,
    @Body() b: ApprovalRequestDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.requestApproval(i, p.organizationId, b));
  }
  @Get('organizations/:organizationId/cash/approvals') approvals(
    @Param() p: CashTenantPath,
    @Query('branchId') b: string,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.cash.approvals(i, p.organizationId, b));
  }
  @Post('organizations/:organizationId/cash/approvals/:approvalId/decision') decideApproval(
    @Param('organizationId') t: string,
    @Param('approvalId') id: string,
    @Body() b: ApprovalDecisionDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.decideApproval(i, t, id, b));
  }
  @Post('organizations/:organizationId/cash/sessions/:sessionId/deposits') deposit(
    @Param() p: CashSessionPath,
    @Body() b: DepositDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.deposit(i, p.organizationId, p.sessionId, b));
  }
  @Post('organizations/:organizationId/cash/deposits/:depositId/transition') depositTransition(
    @Param('organizationId') t: string,
    @Param('depositId') id: string,
    @Body() b: DepositTransitionDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.depositTransition(i, t, id, b));
  }
  @Post('organizations/:organizationId/cash/transfers') transfer(
    @Param() p: CashTenantPath,
    @Body() b: TransferDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.transfer(i, p.organizationId, b));
  }
  @Post('organizations/:organizationId/cash/sessions/:sessionId/reopen') reopen(
    @Param() p: CashSessionPath,
    @Body() b: ReopenDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.reopen(i, p.organizationId, p.sessionId, b));
  }
  @Post('organizations/:organizationId/cash/sessions/:sessionId/handoffs') initiateHandoff(
    @Param() p: CashSessionPath,
    @Body() b: InitiateHandoffDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.initiateHandoff(i, p.organizationId, p.sessionId, b));
  }
  @Post('organizations/:organizationId/cash/handoffs/:handoffId/count') countHandoff(
    @Param('organizationId') t: string,
    @Param('handoffId') id: string,
    @Body() b: CountHandoffDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.countHandoff(i, t, id, b));
  }
  @Post('organizations/:organizationId/cash/handoffs/:handoffId/decision') decideHandoff(
    @Param('organizationId') t: string,
    @Param('handoffId') id: string,
    @Body() b: DecideHandoffDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.decideHandoff(i, t, id, b));
  }
  @Post('organizations/:organizationId/cash/handoffs/:handoffId/complete') completeHandoff(
    @Param('organizationId') t: string,
    @Param('handoffId') id: string,
    @Body() b: CompleteHandoffDto,
    @Req() r: FastifyRequest,
  ) {
    return this.write(r, (i) => this.cash.completeHandoff(i, t, id, b));
  }
  @Get('organizations/:organizationId/cash/handoffs/:handoffId') getHandoff(
    @Param('organizationId') t: string,
    @Param('handoffId') id: string,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.cash.getHandoff(i, t, id));
  }
  @Get('organizations/:organizationId/cash/registers') registers(
    @Param() p: CashTenantPath,
    @Query('branchId') b: string,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.cash.registers(i, p.organizationId, b));
  }
  @Get('organizations/:organizationId/cash/drawers') drawers(
    @Param() p: CashTenantPath,
    @Query('branchId') b: string,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.cash.drawers(i, p.organizationId, b));
  }
  @Get('organizations/:organizationId/cash/integrations/quarantine') quarantine(
    @Param() p: CashTenantPath,
    @Query('branchId') branchId: string | undefined,
    @Query('sourceModule') sourceModule: 'CASH' | 'SALES' | undefined,
    @Query('offset') rawOffset: string | undefined,
    @Query('limit') rawLimit: string | undefined,
    @Req() r: FastifyRequest,
  ) {
    const offset = Math.max(0, Number.parseInt(rawOffset ?? '0', 10) || 0);
    const limit = Math.min(100, Math.max(1, Number.parseInt(rawLimit ?? '50', 10) || 50));
    return this.principal(r).then((i) =>
      this.cash.quarantine(i, p.organizationId, branchId, sourceModule, offset, limit),
    );
  }
  @Get('organizations/:organizationId/cash/integrations/status') operations(
    @Param() p: CashTenantPath,
    @Query('branchId') branchId: string | undefined,
    @Req() r: FastifyRequest,
  ) {
    return this.principal(r).then((i) => this.cash.operations(i, p.organizationId, branchId));
  }
  private principal(r: FastifyRequest) {
    return this.auth.authenticate(r.cookies[this.cookie]);
  }
  private async write<T>(
    r: FastifyRequest,
    fn: (i: Awaited<ReturnType<AuthenticationService['authenticate']>>) => Promise<T>,
  ) {
    const origin = r.headers.origin;
    if (origin && !this.allowedOrigins.has(origin))
      throw new ForbiddenException('Request origin is not allowed');
    const i = await this.principal(r);
    const csrf = r.headers['x-csrf-token'];
    this.auth.assertCsrf(i, typeof csrf === 'string' ? csrf : undefined);
    return fn(i);
  }
}
