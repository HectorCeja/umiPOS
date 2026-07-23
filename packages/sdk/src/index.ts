import { openApiOperations } from './generated/openapi-operations.js';

export { openApiOperations } from './generated/openapi-operations.js';

export const identityFoundationOperationIds = [
  openApiOperations.getUser.operationId,
  openApiOperations.getIdentityFoundation.operationId,
  openApiOperations.listUserEmails.operationId,
] as const;

export const authenticationOperationIds = [
  openApiOperations.login.operationId,
  openApiOperations.refreshSession.operationId,
  openApiOperations.logout.operationId,
  openApiOperations.logoutAll.operationId,
  openApiOperations.requestPasswordReset.operationId,
  openApiOperations.completePasswordReset.operationId,
  openApiOperations.requestEmailVerification.operationId,
  openApiOperations.completeEmailVerification.operationId,
  openApiOperations.getCurrentIdentity.operationId,
  openApiOperations.listSessions.operationId,
  openApiOperations.revokeSession.operationId,
] as const;

export const authorizationOperationIds = [
  openApiOperations.getAuthorizationContext.operationId,
  openApiOperations.evaluatePermission.operationId,
  openApiOperations.listRoles.operationId,
  openApiOperations.listPermissions.operationId,
  openApiOperations.listFeatureFlags.operationId,
  openApiOperations.listMemberships.operationId,
] as const;

export type AuthorizationScope = 'GLOBAL' | 'ORGANIZATION' | 'BRANCH' | 'SELF' | 'CUSTOM';
export type AuthorizationRoleKey =
  | 'OWNER'
  | 'ADMINISTRATOR'
  | 'SUPERVISOR'
  | 'CASHIER'
  | 'EMPLOYEE'
  | 'READ_ONLY';

export type AuthorizationDecision = Readonly<{
  allowed: boolean;
  permission: string;
  registryVersion: number;
  reason: string;
  grantedBy?: Readonly<{
    assignmentId: string;
    role: AuthorizationRoleKey;
    scope: AuthorizationScope;
  }>;
}>;

export class AuthorizationClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImplementation: typeof fetch = fetch,
  ) {}

  async evaluate(
    organizationId: string,
    input: Readonly<{
      permission: string;
      resource: Readonly<{
        type: string;
        branchId?: string;
        ownerUserId?: string;
        status?: string;
      }>;
    }>,
  ): Promise<AuthorizationDecision> {
    const response = await this.fetchImplementation(
      new URL(
        `/v1/organizations/${encodeURIComponent(organizationId)}/authorization/evaluate`,
        this.baseUrl,
      ),
      {
        body: JSON.stringify(input),
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      },
    );
    if (!response.ok)
      throw new Error(`Authorization request failed with ${String(response.status)}`);
    return (await response.json()) as AuthorizationDecision;
  }
}

export type AuthenticatedIdentity = Readonly<{
  sessionId: string;
  userId: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  mfaStatus: 'NOT_ENROLLED' | 'ENROLLED' | 'REQUIRED';
}>;

export type Session = Readonly<{
  id: string;
  deviceId: string | null;
  deviceName: string | null;
  ipAddress: string;
  userAgent: string;
  location: string | null;
  trustLevel: 'UNTRUSTED' | 'RECOGNIZED';
  createdAt: string;
  lastActivityAt: string;
  idleExpiresAt: string;
  absoluteExpiresAt: string;
  current: boolean;
}>;

export class AuthenticationClient {
  constructor(
    private readonly baseUrl: string,
    private readonly fetchImplementation: typeof fetch = fetch,
  ) {}

  async login(
    input: Readonly<{
      email: string;
      password: string;
      deviceFingerprint: string;
      deviceName: string;
      rememberMe?: boolean;
      rememberDevice?: boolean;
    }>,
  ): Promise<void> {
    await this.request('/v1/auth/login', { method: 'POST', body: JSON.stringify(input) });
  }

  async identity(): Promise<AuthenticatedIdentity> {
    return this.request<AuthenticatedIdentity>('/v1/identity');
  }

  async sessions(): Promise<readonly Session[]> {
    return this.request<readonly Session[]>('/v1/sessions');
  }

  async logout(csrfToken: string): Promise<void> {
    await this.request('/v1/auth/logout', {
      method: 'POST',
      headers: { 'x-csrf-token': csrfToken },
    });
  }

  private async request<T = void>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body !== undefined && !headers.has('content-type'))
      headers.set('content-type', 'application/json');
    const response = await this.fetchImplementation(new URL(path, this.baseUrl), {
      credentials: 'include',
      ...init,
      headers,
    });
    if (!response.ok)
      throw new Error(`Authentication request failed with ${String(response.status)}`);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }
}

export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'LOCKED'
  | 'SUSPENDED'
  | 'DISABLED'
  | 'DELETED'
  | 'EXPIRED';

export type User = Readonly<{
  id: string;
  status: UserStatus;
  givenName: string;
  familyName: string;
  displayName: string;
  avatarUrl?: string | null;
  locale: string;
  timeZone: string;
  regionalFormat: string;
  createdAt: string;
  updatedAt: string;
  statusChangedAt: string;
  lastAccessedAt?: string | null;
  deletedAt?: string | null;
  preferences?: Readonly<Record<string, unknown>>;
  metadata?: Readonly<Record<string, unknown>>;
}>;

export type EmailIdentity = Readonly<{
  id: string;
  userId: string;
  address: string;
  status: 'PENDING' | 'VERIFIED' | 'REVOKED';
  primary: boolean;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}>;
