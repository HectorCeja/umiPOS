import type { BusinessType } from '@nexo/control-plane';

export type OrganizationInput = Readonly<{
  name: string;
  slug: string;
  countryCode: string;
  defaultCurrency: string;
  defaultLocale: string;
  timeZone: string;
  businessType: BusinessType;
  templateKey?: string;
}>;

export type OrganizationSettingsInput = Readonly<{
  name?: string;
  legalTaxId?: string | null;
  branding?: Record<string, unknown>;
  address?: Record<string, unknown>;
  countryCode?: string;
  defaultCurrency?: string;
  defaultLocale?: string;
  timeZone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  moneyFormat?: string;
  regionalSettings?: Record<string, unknown>;
  version: number;
}>;

export type BranchInput = Readonly<{
  code: string;
  name: string;
  timeZone?: string;
  locale?: string;
  currency?: string;
  businessHours?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}>;

export type InvitationInput = Readonly<{
  email: string;
  roleKey: string;
  accessScope: 'ALL_BRANCHES' | 'RESTRICTED';
  branchIds: readonly string[];
}>;

export interface ControlPlaneRepository {
  organizationsForUser(userId: string): Promise<readonly unknown[]>;
  bootstrap(userId: string, organizationId: string, input: OrganizationInput): Promise<unknown>;
  organization(tenantId: string): Promise<unknown>;
  updateOrganization(
    tenantId: string,
    actorUserId: string,
    input: OrganizationSettingsInput,
  ): Promise<unknown>;
  archiveOrganization(tenantId: string, actorUserId: string, version: number): Promise<void>;
  branches(tenantId: string): Promise<readonly unknown[]>;
  createBranch(tenantId: string, actorUserId: string, input: BranchInput): Promise<unknown>;
  updateBranch(
    tenantId: string,
    branchId: string,
    actorUserId: string,
    input: BranchInput & { version: number },
  ): Promise<unknown>;
  setBranchArchived(
    tenantId: string,
    branchId: string,
    actorUserId: string,
    archived: boolean,
    version: number,
  ): Promise<unknown>;
  templates(): Promise<readonly unknown[]>;
  onboarding(tenantId: string): Promise<unknown>;
  saveOnboarding(
    tenantId: string,
    actorUserId: string,
    input: Readonly<{
      currentStep: number;
      businessType: BusinessType;
      templateKey: string;
      answers: Record<string, unknown>;
      version: number;
    }>,
  ): Promise<unknown>;
  completeOnboarding(tenantId: string, actorUserId: string, version: number): Promise<unknown>;
  restartOnboarding(tenantId: string, actorUserId: string, version: number): Promise<unknown>;
  setFeature(
    tenantId: string,
    actorUserId: string,
    featureKey: string,
    enabled: boolean,
    version: number,
  ): Promise<unknown>;
  invitations(tenantId: string): Promise<readonly unknown[]>;
  createInvitation(
    tenantId: string,
    actorUserId: string,
    input: InvitationInput,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<Readonly<{ invitation: unknown; organizationName: string }>>;
  rotateInvitation(
    tenantId: string,
    invitationId: string,
    actorUserId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<Readonly<{ invitation: unknown; email: string; organizationName: string }>>;
  revokeInvitation(
    tenantId: string,
    invitationId: string,
    actorUserId: string,
    version: number,
  ): Promise<unknown>;
  acceptInvitation(
    tenantId: string,
    userId: string,
    normalizedEmail: string,
    tokenHash: string,
  ): Promise<unknown>;
  updateMembership(
    tenantId: string,
    membershipId: string,
    actorUserId: string,
    input: Readonly<{
      roleKey: string;
      status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
      accessScope: 'ALL_BRANCHES' | 'RESTRICTED';
      branchIds: readonly string[];
      version: number;
    }>,
  ): Promise<unknown>;
}

export const CONTROL_PLANE_REPOSITORY = Symbol('CONTROL_PLANE_REPOSITORY');
