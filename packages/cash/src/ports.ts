import type {
  CashApproval,
  CashContext,
  CashEvent,
  CashLedgerEntry,
  CashPolicy,
  CashSessionSnapshot,
} from './types.js';
export interface CashAuthorizationPort {
  assert(
    input: Readonly<{
      context: CashContext;
      permission: string;
      resourceId?: string;
      attributes?: Readonly<Record<string, unknown>>;
    }>,
  ): Promise<void>;
}
export interface CashPolicyPort {
  get(context: CashContext, registerId: string): Promise<CashPolicy>;
}
export interface CashRepositoryPort {
  withTransaction<T>(
    context: CashContext,
    work: (transaction: CashTransactionPort) => Promise<T>,
  ): Promise<T>;
}
export interface CashTransactionPort {
  getSessionForUpdate(id: string): Promise<CashSessionSnapshot | null>;
  saveSession(session: CashSessionSnapshot): Promise<void>;
  appendLedger(entry: CashLedgerEntry): Promise<void>;
  findLedgerBySource(sourceType: string, sourceId: string): Promise<CashLedgerEntry | null>;
  appendEvents(events: readonly CashEvent[]): Promise<void>;
  saveApproval(approval: CashApproval): Promise<void>;
}
export interface SalesCashEventPort {
  consume(
    event: Readonly<{
      eventId: string;
      tenantId: string;
      organizationId: string;
      branchId: string;
      saleId: string;
      paymentAllocationId: string;
      currency: string;
      amountMinor: string;
      occurredAt: string;
      correlationId: string;
    }>,
  ): Promise<void>;
}
export interface UmiCashIntegrationPort {
  publish(
    event: Readonly<{
      eventId: string;
      eventType:
        | 'nexo.cash.session.opened'
        | 'nexo.cash.session.closed'
        | 'nexo.cash.session.force_closed'
        | 'nexo.cash.variance.detected'
        | 'nexo.cash.withdrawal.recorded'
        | 'nexo.cash.deposit.prepared'
        | 'nexo.cash.transfer.completed';
      eventVersion: 1;
      occurredAt: string;
      organizationId: string;
      branchId: string;
      registerId: string;
      sessionId: string;
      correlationId: string;
      payload: Readonly<Record<string, unknown>>;
    }>,
  ): Promise<void>;
}
