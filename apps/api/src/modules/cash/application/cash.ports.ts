import type {
  CashApproval,
  CashLedgerEntry,
  CashPolicy,
  CashPolicyOverride,
  CashReconciliation,
  CashRegister,
  CashSessionSnapshot,
} from '@nexo/cash';
export const CASH_REPOSITORY = Symbol('CASH_REPOSITORY');
export interface CashRepository {
  createRegister(
    tenantId: string,
    actorId: string,
    input: Readonly<{
      branchId: string;
      name: string;
      code: string;
      currency: string;
      openingFloatMinor?: string;
    }>,
  ): Promise<CashRegister>;
  updateRegister(
    tenantId: string,
    actorId: string,
    registerId: string,
    input: Readonly<{ name: string; status: string; version: number }>,
  ): Promise<unknown>;
  createDrawer(
    tenantId: string,
    actorId: string,
    input: Readonly<{ branchId: string; name: string; code: string; registerId?: string }>,
  ): Promise<unknown>;
  updateDrawer(
    tenantId: string,
    actorId: string,
    drawerId: string,
    input: Readonly<{ name: string; status: string; registerId?: string; version: number }>,
  ): Promise<unknown>;
  open(
    tenantId: string,
    actorId: string,
    membershipId: string,
    input: Readonly<{
      branchId: string;
      registerId: string;
      drawerId?: string;
      currency: string;
      businessDate: string;
      openingFloatMinor: string;
      idempotencyKey: string;
      correlationId: string;
    }>,
  ): Promise<CashSessionSnapshot>;
  movement(
    tenantId: string,
    actorId: string,
    membershipId: string,
    sessionId: string,
    input: Readonly<{
      type: string;
      amountMinor: string;
      currency: string;
      reason: string;
      reference?: string;
      idempotencyKey: string;
      sourceType?: string;
      sourceId?: string;
      correlationId: string;
    }>,
  ): Promise<CashLedgerEntry>;
  count(
    tenantId: string,
    actorId: string,
    sessionId: string,
    input: Readonly<{
      currency: string;
      totalMinor?: string;
      denominations?: readonly Readonly<{ denominationMinor: string; quantity: number }>[];
      idempotencyKey: string;
    }>,
  ): Promise<unknown>;
  reconcile(
    tenantId: string,
    actorId: string,
    sessionId: string,
    idempotencyKey: string,
  ): Promise<CashReconciliation>;
  close(
    tenantId: string,
    actorId: string,
    sessionId: string,
    input: Readonly<{ version: number; idempotencyKey: string; force?: boolean; reason?: string }>,
  ): Promise<CashSessionSnapshot>;
  get(tenantId: string, sessionId: string): Promise<CashSessionSnapshot>;
  active(tenantId: string, branchId: string): Promise<CashSessionSnapshot | null>;
  timeline(tenantId: string, sessionId: string): Promise<readonly CashLedgerEntry[]>;
  summary(tenantId: string, sessionId: string): Promise<unknown>;
  transition(
    tenantId: string,
    actorId: string,
    sessionId: string,
    input: Readonly<{
      to: 'SUSPENDED' | 'OPEN';
      version: number;
      reason: string;
      idempotencyKey: string;
    }>,
  ): Promise<CashSessionSnapshot>;
  policy(tenantId: string, branchId?: string, registerId?: string): Promise<CashPolicy>;
  savePolicy(
    tenantId: string,
    actorId: string,
    input: Readonly<{
      branchId?: string;
      registerId?: string;
      configuration: CashPolicyOverride;
      idempotencyKey: string;
    }>,
  ): Promise<CashPolicy>;
  requestApproval(
    tenantId: string,
    actorId: string,
    input: Readonly<{
      branchId: string;
      actionType: string;
      resourceId: string;
      requiredPermission: string;
      thresholdMinor?: string;
      reason: string;
      expiresAt: string;
      correlationId: string;
      idempotencyKey: string;
    }>,
  ): Promise<CashApproval>;
  decideApproval(
    tenantId: string,
    actorId: string,
    approvalId: string,
    input: Readonly<{
      decision: 'APPROVED' | 'REJECTED' | 'CANCELLED';
      reason: string;
      version: number;
      idempotencyKey: string;
    }>,
  ): Promise<CashApproval>;
  approvals(tenantId: string, branchId: string): Promise<readonly CashApproval[]>;
  prepareDeposit(
    tenantId: string,
    actorId: string,
    membershipId: string,
    sessionId: string,
    input: Readonly<{
      amountMinor: string;
      currency: string;
      destination: string;
      reference?: string;
      bagReference?: string;
      reason: string;
      approvalId?: string;
      correlationId: string;
      idempotencyKey: string;
    }>,
  ): Promise<unknown>;
  updateDeposit(
    tenantId: string,
    actorId: string,
    membershipId: string,
    depositId: string,
    input: Readonly<{
      status: 'HANDED_OVER' | 'CONFIRMED_MANUALLY' | 'CANCELLED';
      reason: string;
      idempotencyKey: string;
    }>,
  ): Promise<unknown>;
  transfer(
    tenantId: string,
    actorId: string,
    membershipId: string,
    input: Readonly<{
      sourceSessionId: string;
      destinationSessionId: string;
      amountMinor: string;
      currency: string;
      reason: string;
      approvalId?: string;
      correlationId: string;
      idempotencyKey: string;
    }>,
  ): Promise<unknown>;
  reopen(
    tenantId: string,
    actorId: string,
    sessionId: string,
    input: Readonly<{
      version: number;
      reason: string;
      approvalId: string;
      correlationId: string;
      idempotencyKey: string;
    }>,
  ): Promise<CashSessionSnapshot>;
  initiateHandoff(
    tenantId: string,
    actorId: string,
    membershipId: string,
    sessionId: string,
    input: Readonly<{
      incomingCashierId: string;
      reason: string;
      notes?: string;
      expiresAt: string;
      correlationId: string;
      idempotencyKey: string;
    }>,
  ): Promise<unknown>;
  countHandoff(
    tenantId: string,
    actorId: string,
    handoffId: string,
    input: Readonly<{
      totalMinor?: string;
      denominations?: readonly Readonly<{ denominationMinor: string; quantity: number }>[];
      version: number;
      idempotencyKey: string;
    }>,
  ): Promise<unknown>;
  decideHandoff(
    tenantId: string,
    actorId: string,
    handoffId: string,
    input: Readonly<{
      decision: 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
      reason: string;
      version: number;
      idempotencyKey: string;
    }>,
  ): Promise<unknown>;
  completeHandoff(
    tenantId: string,
    actorId: string,
    handoffId: string,
    input: Readonly<{
      approvalId?: string;
      version: number;
      idempotencyKey: string;
    }>,
  ): Promise<unknown>;
  getHandoff(tenantId: string, handoffId: string): Promise<unknown>;
  registers(tenantId: string, branchId: string): Promise<readonly unknown[]>;
  drawers(tenantId: string, branchId: string): Promise<readonly unknown[]>;
  quarantine(
    tenantId: string,
    branchId: string | undefined,
    sourceModule: 'CASH' | 'SALES' | undefined,
    offset: number,
    limit: number,
  ): Promise<unknown>;
  operations(tenantId: string, branchId?: string): Promise<unknown>;
}
