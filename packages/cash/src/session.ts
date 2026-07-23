import type { CashSessionSnapshot, CashSessionStatus } from './types.js';
const transitions: Readonly<Record<CashSessionStatus, readonly CashSessionStatus[]>> = {
  PENDING_OPEN: ['OPEN', 'CANCELLED'],
  OPEN: ['SUSPENDED', 'COUNTING', 'FORCE_CLOSED'],
  SUSPENDED: ['OPEN', 'COUNTING', 'FORCE_CLOSED'],
  COUNTING: ['RECONCILIATION_REQUIRED', 'PENDING_APPROVAL', 'CLOSED', 'OPEN', 'FORCE_CLOSED'],
  RECONCILIATION_REQUIRED: ['COUNTING', 'PENDING_APPROVAL', 'FORCE_CLOSED'],
  PENDING_APPROVAL: ['COUNTING', 'CLOSED', 'FORCE_CLOSED'],
  CLOSED: ['REOPENED'],
  FORCE_CLOSED: ['REOPENED'],
  REOPENED: ['COUNTING', 'CLOSED', 'FORCE_CLOSED'],
  CANCELLED: [],
};
export function transitionCashSession(
  session: CashSessionSnapshot,
  to: CashSessionStatus,
  now: string,
): CashSessionSnapshot {
  if (!transitions[session.status].includes(to)) throw new Error('CASH_SESSION_INVALID_STATE');
  return {
    ...session,
    status: to,
    version: session.version + 1,
    ...(to === 'OPEN' ? { openedAt: session.openedAt ?? now } : {}),
    ...(to === 'SUSPENDED' ? { suspendedAt: now } : {}),
    ...(to === 'CLOSED' || to === 'FORCE_CLOSED' ? { closedAt: now } : {}),
    ...(to === 'REOPENED' ? { reopenedAt: now } : {}),
  };
}
export function assertOrdinaryMovementAllowed(session: CashSessionSnapshot): void {
  if (!['OPEN', 'REOPENED'].includes(session.status)) throw new Error('CASH_SESSION_NOT_OPEN');
}
