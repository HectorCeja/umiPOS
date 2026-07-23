export const securityEventTypes = {
  accountLocked: 'ACCOUNT_LOCKED',
  emailVerificationRequested: 'EMAIL_VERIFICATION_REQUESTED',
  emailVerified: 'EMAIL_VERIFIED',
  loginFailed: 'LOGIN_FAILED',
  loginSucceeded: 'LOGIN_SUCCEEDED',
  logout: 'LOGOUT',
  logoutAll: 'LOGOUT_ALL',
  passwordChanged: 'PASSWORD_CHANGED',
  passwordResetCompleted: 'PASSWORD_RESET_COMPLETED',
  passwordResetRequested: 'PASSWORD_RESET_REQUESTED',
  profileUpdated: 'PROFILE_UPDATED',
  refreshReuse: 'REFRESH_REUSE_DETECTED',
  sessionRefreshed: 'SESSION_REFRESHED',
  sessionRevoked: 'SESSION_REVOKED',
  securityWarning: 'SECURITY_WARNING',
} as const;

export type SecurityEventType = (typeof securityEventTypes)[keyof typeof securityEventTypes];
