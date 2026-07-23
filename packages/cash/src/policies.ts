import type { CashPolicy, CashPolicyOverride } from './types.js';

export const defaultCashPolicy: CashPolicy = {
  openingFloatRequired: true,
  defaultOpeningFloatMinor: '0',
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

export function resolveCashPolicy(
  global: CashPolicy = defaultCashPolicy,
  organization?: CashPolicyOverride,
  branch?: CashPolicyOverride,
  register?: CashPolicyOverride,
): CashPolicy {
  return { ...global, ...organization, ...branch, ...register };
}
