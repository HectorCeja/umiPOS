import { describe, expect, test } from 'vitest';
import {
  countDenominations,
  deriveExpected,
  reconcileCash,
  transitionCashSession,
  type CashLedgerEntry,
  type CashPolicy,
  type CashSessionSnapshot,
} from './index.js';

const policy: CashPolicy = {
  openingFloatRequired: true,
  defaultOpeningFloatMinor: '10000',
  manualOpeningAllowed: true,
  cashCountRequired: true,
  denominationCountRequired: false,
  blindCount: true,
  varianceToleranceMinor: '100',
  supervisorThresholdMinor: '500',
  withdrawalThresholdMinor: '50000',
  maximumDrawerMinor: '100000',
  sharedDrawerAllowed: false,
  oneActiveSessionPerCashier: true,
  cashRefundAllowed: true,
  negativeExpectedAllowed: false,
  forceCloseAllowed: true,
  reopenAllowed: true,
  transferAllowed: true,
  depositApprovalRequired: true,
  selfApprovalAllowed: false,
  sessionInactivitySeconds: 3600,
  businessDayCutoffMinutes: 240,
  pendingEventClosePolicy: 'BLOCK',
  dualControl: false,
};
const session: CashSessionSnapshot = {
  id: 's1',
  tenantId: 't1',
  organizationId: 't1',
  branchId: 'b1',
  registerId: 'r1',
  openedByUserId: 'u1',
  openedByMembershipId: 'm1',
  assignedCashierId: 'u1',
  currency: 'MXN',
  businessDate: '2026-07-14',
  openingFloatMinor: '10000',
  expectedAmountMinor: '10000',
  status: 'PENDING_OPEN',
  version: 1,
  correlationId: 'c1',
};
const entry = (direction: 'IN' | 'OUT', amountMinor: string): CashLedgerEntry => ({
  id: crypto.randomUUID(),
  tenantId: 't1',
  organizationId: 't1',
  branchId: 'b1',
  sessionId: 's1',
  registerId: 'r1',
  currency: 'MXN',
  direction,
  movementType: direction === 'IN' ? 'CASH_IN' : 'CASH_OUT',
  amountMinor,
  sourceType: 'TEST',
  sourceId: crypto.randomUUID(),
  reason: 'test',
  actorId: 'u1',
  membershipId: 'm1',
  occurredAt: '2026-07-14T00:00:00Z',
  businessDate: '2026-07-14',
  idempotencyKey: crypto.randomUUID(),
  correlationId: 'c1',
  metadata: {},
  createdAt: '2026-07-14T00:00:00Z',
});
describe('cash domain', () => {
  test('validates explicit session lifecycle', () => {
    const opened = transitionCashSession(session, 'OPEN', '2026-07-14T01:00:00Z');
    expect(opened.status).toBe('OPEN');
    expect(() => transitionCashSession(opened, 'CLOSED', '2026-07-14T02:00:00Z')).toThrow(
      'CASH_SESSION_INVALID_STATE',
    );
  });
  test('rebuilds expected cash exclusively from ledger', () => {
    expect(deriveExpected([entry('IN', '10000'), entry('IN', '2500'), entry('OUT', '300')])).toBe(
      '12200',
    );
  });
  test('recalculates denomination totals on the server', () => {
    expect(
      countDenominations([
        { denominationMinor: '10000', quantity: 2 },
        { denominationMinor: '5000', quantity: 1 },
        { denominationMinor: '500', quantity: 3 },
      ]),
    ).toBe('26500');
  });
  test('classifies matched, tolerance and approval variance deterministically', () => {
    expect(reconcileCash('10000', '10000', policy).status).toBe('MATCHED');
    expect(reconcileCash('10000', '10050', policy).status).toBe('WITHIN_TOLERANCE');
    expect(reconcileCash('10000', '9000', policy)).toMatchObject({
      varianceMinor: '-1000',
      status: 'APPROVAL_REQUIRED',
      severity: 'HIGH',
    });
  });
  test('rejects negative denomination quantities', () => {
    expect(() => countDenominations([{ denominationMinor: '100', quantity: -1 }])).toThrow(
      'CASH_COUNT_INVALID',
    );
  });
});
