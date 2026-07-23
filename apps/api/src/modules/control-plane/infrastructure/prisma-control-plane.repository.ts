import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { DatabaseClient, DatabaseTransaction, Prisma } from '@nexo/database';
import { withTenantTransaction, withUserTransaction } from '@nexo/database';

import { DATABASE } from '../../../infrastructure/infrastructure.module.js';
import { assertTransactionalAuthorization } from '../../authorization/infrastructure/transactional-authorization.js';
import type {
  BranchInput,
  ControlPlaneRepository,
  InvitationInput,
  OrganizationInput,
  OrganizationSettingsInput,
} from '../application/control-plane.ports.js';

@Injectable()
export class PrismaControlPlaneRepository implements ControlPlaneRepository {
  constructor(@Inject(DATABASE) private readonly database: DatabaseClient) {}

  organizationsForUser(userId: string) {
    return withUserTransaction(
      this.database,
      userId,
      (tx) =>
        tx.$queryRaw<
          { id: string; name: string; status: string; role: string; accessScope: string }[]
        >`SELECT id,name,status,role,access_scope AS "accessScope" FROM app.active_organizations_for_current_user()`,
    );
  }

  bootstrap(userId: string, organizationId: string, input: OrganizationInput) {
    return withTenantTransaction(this.database, organizationId, async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user?.status !== 'ACTIVE' || user.emailVerifiedAt === null)
        throw new ForbiddenException('Verified active identity required');
      const template = input.templateKey
        ? await tx.businessTemplate.findFirst({
            where: { key: input.templateKey, status: 'ACTIVE' },
          })
        : null;
      if (input.templateKey && template === null) throw new NotFoundException('Template not found');
      const organization = await tx.organization.create({
        data: {
          countryCode: input.countryCode,
          defaultCurrency: input.defaultCurrency,
          defaultLocale: input.defaultLocale,
          id: organizationId,
          name: input.name,
          slug: input.slug,
          timeZone: input.timeZone,
        },
      });
      const branch = await tx.branch.create({
        data: { code: 'MAIN', name: 'Sucursal principal', tenantId: organizationId },
      });
      const membership = await tx.membership.create({
        data: { principalId: userId, role: 'OWNER', tenantId: organizationId },
      });
      await tx.membershipAuthorizationRole.create({
        data: { membershipId: membership.id, roleKey: 'OWNER', tenantId: organizationId },
      });
      await tx.organizationOnboarding.create({
        data: {
          answers: {
            businessName: input.name,
            country: input.countryCode,
            currency: input.defaultCurrency,
            language: input.defaultLocale,
            timeZone: input.timeZone,
          },
          businessType: input.businessType,
          currentStep: template === null ? 2 : 4,
          ...(template === null
            ? {}
            : { templateKey: template.key, templateVersion: template.version }),
          tenantId: organizationId,
        },
      });
      await this.event(
        tx,
        organizationId,
        userId,
        'ORGANIZATION_CREATED',
        'organization',
        organizationId,
      );
      await this.event(tx, organizationId, userId, 'BRANCH_CREATED', 'branch', branch.id);
      return { ...organization, ownerMembershipId: membership.id, primaryBranchId: branch.id };
    });
  }

  organization(tenantId: string) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      const value = await tx.organization.findUnique({ where: { id: tenantId } });
      if (!value) throw new NotFoundException('Organization not found');
      return value;
    });
  }

  updateOrganization(tenantId: string, actorUserId: string, input: OrganizationSettingsInput) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'organization.update', 'organization');
      const result = await tx.organization.updateMany({
        where: { id: tenantId, version: input.version },
        data: {
          ...(input.name === undefined ? {} : { name: input.name }),
          ...(input.legalTaxId === undefined ? {} : { legalTaxId: input.legalTaxId }),
          ...(input.branding === undefined ? {} : { branding: this.json(input.branding) }),
          ...(input.address === undefined ? {} : { address: this.json(input.address) }),
          ...(input.countryCode === undefined ? {} : { countryCode: input.countryCode }),
          ...(input.defaultCurrency === undefined
            ? {}
            : { defaultCurrency: input.defaultCurrency }),
          ...(input.defaultLocale === undefined ? {} : { defaultLocale: input.defaultLocale }),
          ...(input.timeZone === undefined ? {} : { timeZone: input.timeZone }),
          ...(input.dateFormat === undefined ? {} : { dateFormat: input.dateFormat }),
          ...(input.timeFormat === undefined ? {} : { timeFormat: input.timeFormat }),
          ...(input.moneyFormat === undefined ? {} : { moneyFormat: input.moneyFormat }),
          ...(input.regionalSettings === undefined
            ? {}
            : { regionalSettings: this.json(input.regionalSettings) }),
          version: { increment: 1 },
        },
      });
      this.assertUpdated(result.count);
      await this.event(tx, tenantId, actorUserId, 'ORGANIZATION_UPDATED', 'organization', tenantId);
      return tx.organization.findUniqueOrThrow({ where: { id: tenantId } });
    });
  }

  archiveOrganization(tenantId: string, actorUserId: string, version: number) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'organization.archive', 'organization');
      const result = await tx.organization.updateMany({
        where: { id: tenantId, status: 'ACTIVE', version },
        data: { status: 'OFFBOARDING', version: { increment: 1 } },
      });
      this.assertUpdated(result.count);
      await this.event(
        tx,
        tenantId,
        actorUserId,
        'ORGANIZATION_ARCHIVED',
        'organization',
        tenantId,
      );
    });
  }

  branches(tenantId: string) {
    return withTenantTransaction(this.database, tenantId, (tx) =>
      tx.branch.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } }),
    );
  }

  createBranch(tenantId: string, actorUserId: string, input: BranchInput) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'branch.create', 'branch');
      const branch = await tx.branch.create({
        data: {
          code: input.code,
          name: input.name,
          tenantId,
          ...(input.timeZone === undefined ? {} : { timeZone: input.timeZone }),
          ...(input.locale === undefined ? {} : { locale: input.locale }),
          ...(input.currency === undefined ? {} : { currency: input.currency }),
          ...(input.businessHours === undefined
            ? {}
            : { businessHours: this.json(input.businessHours) }),
          ...(input.settings === undefined ? {} : { settings: this.json(input.settings) }),
        },
      });
      await this.event(tx, tenantId, actorUserId, 'BRANCH_CREATED', 'branch', branch.id);
      return branch;
    });
  }

  updateBranch(
    tenantId: string,
    branchId: string,
    actorUserId: string,
    input: BranchInput & { version: number },
  ) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      const existing = await tx.branch.findUnique({
        where: { tenantId_id: { id: branchId, tenantId } },
      });
      await this.authorize(
        tx,
        actorUserId,
        tenantId,
        'branch.update',
        'branch',
        branchId,
        existing?.status,
      );
      const { version } = input;
      const result = await tx.branch.updateMany({
        where: { id: branchId, tenantId, version },
        data: {
          code: input.code,
          name: input.name,
          ...(input.timeZone === undefined ? {} : { timeZone: input.timeZone }),
          ...(input.locale === undefined ? {} : { locale: input.locale }),
          ...(input.currency === undefined ? {} : { currency: input.currency }),
          ...(input.businessHours === undefined
            ? {}
            : { businessHours: this.json(input.businessHours) }),
          ...(input.settings === undefined ? {} : { settings: this.json(input.settings) }),
          version: { increment: 1 },
        },
      });
      this.assertUpdated(result.count);
      await this.event(tx, tenantId, actorUserId, 'BRANCH_UPDATED', 'branch', branchId);
      return tx.branch.findUniqueOrThrow({ where: { tenantId_id: { id: branchId, tenantId } } });
    });
  }

  setBranchArchived(
    tenantId: string,
    branchId: string,
    actorUserId: string,
    archived: boolean,
    version: number,
  ) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      const existing = await tx.branch.findUnique({
        where: { tenantId_id: { id: branchId, tenantId } },
      });
      await this.authorize(
        tx,
        actorUserId,
        tenantId,
        archived ? 'branch.archive' : 'branch.restore',
        'branch',
        branchId,
        existing?.status,
      );
      const result = await tx.branch.updateMany({
        where: { id: branchId, tenantId, version },
        data: { status: archived ? 'ARCHIVED' : 'ACTIVE', version: { increment: 1 } },
      });
      this.assertUpdated(result.count);
      await this.event(
        tx,
        tenantId,
        actorUserId,
        archived ? 'BRANCH_ARCHIVED' : 'BRANCH_RESTORED',
        'branch',
        branchId,
      );
      return tx.branch.findUniqueOrThrow({ where: { tenantId_id: { id: branchId, tenantId } } });
    });
  }

  templates() {
    return this.database.businessTemplate.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ businessType: 'asc' }, { name: 'asc' }],
    });
  }

  onboarding(tenantId: string) {
    return withTenantTransaction(this.database, tenantId, (tx) =>
      tx.organizationOnboarding.findUniqueOrThrow({
        where: { tenantId },
        include: { template: true },
      }),
    );
  }

  saveOnboarding(
    tenantId: string,
    actorUserId: string,
    input: Parameters<ControlPlaneRepository['saveOnboarding']>[2],
  ) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'onboarding.manage', 'onboarding');
      this.assertOnboardingAnswers(input.answers);
      const template = await tx.businessTemplate.findFirst({
        where: { key: input.templateKey, status: 'ACTIVE' },
      });
      if (!template) throw new NotFoundException('Template not found');
      const result = await tx.organizationOnboarding.updateMany({
        where: { tenantId, status: 'DRAFT', version: input.version },
        data: {
          answers: this.json(input.answers),
          businessType: input.businessType,
          currentStep: input.currentStep,
          templateKey: template.key,
          templateVersion: template.version,
          version: { increment: 1 },
        },
      });
      this.assertUpdated(result.count);
      await this.event(tx, tenantId, actorUserId, 'ONBOARDING_UPDATED', 'onboarding', tenantId);
      return tx.organizationOnboarding.findUniqueOrThrow({ where: { tenantId } });
    });
  }

  completeOnboarding(tenantId: string, actorUserId: string, version: number) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'onboarding.manage', 'onboarding');
      const state = await tx.organizationOnboarding.findUnique({
        where: { tenantId },
        include: { template: true },
      });
      if (
        !state ||
        state.version !== version ||
        state.status !== 'DRAFT' ||
        state.currentStep < 4 ||
        !state.template
      )
        throw new ConflictException('Onboarding state changed or is incomplete');
      const features = this.stringArray(state.template.features);
      const answers =
        state.answers && typeof state.answers === 'object' && !Array.isArray(state.answers)
          ? (state.answers as Record<string, unknown>)
          : {};
      const answer = (key: string) =>
        typeof answers[key] === 'string' && String(answers[key]).trim()
          ? String(answers[key]).trim()
          : undefined;
      this.assertOnboardingAnswers({ ...answers, journeyStep: 10 });
      for (const featureKey of features) {
        await tx.organizationFeature.upsert({
          where: { tenantId_featureKey: { featureKey, tenantId } },
          create: { enabled: true, featureKey, tenantId },
          update: { enabled: true, version: { increment: 1 } },
        });
      }
      const organizationData: Prisma.OrganizationUpdateInput = {
        settings: this.json(state.template.initialSettings),
        version: { increment: 1 },
      };
      const businessName = answer('businessName');
      const currency = answer('currency');
      const locale = answer('locale');
      const timeZone = answer('timeZone');
      const country = answer('country');
      if (businessName) organizationData.name = businessName;
      if (currency) organizationData.defaultCurrency = currency;
      if (locale) organizationData.defaultLocale = locale;
      if (timeZone) organizationData.timeZone = timeZone;
      if (country) organizationData.countryCode = country;
      await tx.organization.update({
        where: { id: tenantId },
        data: organizationData,
      });
      const firstBranch = await tx.branch.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      });
      if (firstBranch && (answer('branchName') || answer('branchCode'))) {
        const branchData: Prisma.BranchUpdateInput = { version: { increment: 1 } };
        const branchName = answer('branchName');
        const branchCode = answer('branchCode');
        if (branchName) branchData.name = branchName;
        if (branchCode) branchData.code = branchCode;
        if (timeZone) branchData.timeZone = timeZone;
        await tx.branch.update({
          where: { tenantId_id: { tenantId, id: firstBranch.id } },
          data: branchData,
        });
      }
      const completed = await tx.organizationOnboarding.update({
        where: { tenantId },
        data: {
          completedAt: new Date(),
          currentStep: 5,
          status: 'COMPLETED',
          version: { increment: 1 },
        },
      });
      await this.event(tx, tenantId, actorUserId, 'ONBOARDING_COMPLETED', 'onboarding', tenantId, {
        templateKey: state.template.key,
        templateVersion: state.template.version,
      });
      return completed;
    });
  }

  private assertOnboardingAnswers(answers: Record<string, unknown>) {
    const journeyStep = typeof answers.journeyStep === 'number' ? answers.journeyStep : 0;
    const present = (key: string) =>
      typeof answers[key] === 'string' && String(answers[key]).trim().length > 0;
    if (journeyStep >= 2 && !present('businessName'))
      throw new BadRequestException('Escribe el nombre de tu negocio para continuar.');
    for (const [key, message] of [
      ['country', 'Selecciona el país de tu negocio para continuar.'],
      ['currency', 'Selecciona la moneda de tu negocio para continuar.'],
      ['locale', 'Selecciona el idioma de tu equipo para continuar.'],
      ['timeZone', 'Selecciona la zona horaria para continuar.'],
    ] as const)
      if (journeyStep >= 4 && !present(key)) throw new BadRequestException(message);
    if (journeyStep >= 5 && !present('branchName'))
      throw new BadRequestException('Escribe el nombre de la sucursal principal para continuar.');
    if (journeyStep >= 8 && answers.catalogChoice === 'empty') {
      const product =
        answers.customProduct && typeof answers.customProduct === 'object'
          ? (answers.customProduct as Record<string, unknown>)
          : {};
      if (typeof product.name !== 'string' || !product.name.trim())
        throw new BadRequestException('Escribe el nombre del producto para continuar.');
      if (typeof product.category !== 'string' || !product.category.trim())
        throw new BadRequestException('Selecciona o escribe una categoría para continuar.');
      if (typeof product.price !== 'string' || Number(product.price) <= 0)
        throw new BadRequestException('Confirma un precio mayor a cero para continuar.');
    }
  }

  restartOnboarding(tenantId: string, actorUserId: string, version: number) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'onboarding.manage', 'onboarding');
      const result = await tx.organizationOnboarding.updateMany({
        where: { tenantId, version },
        data: {
          answers: {},
          businessType: null,
          completedAt: null,
          currentStep: 1,
          status: 'DRAFT',
          templateKey: null,
          templateVersion: null,
          version: { increment: 1 },
        },
      });
      this.assertUpdated(result.count);
      await this.event(tx, tenantId, actorUserId, 'ONBOARDING_RESTARTED', 'onboarding', tenantId);
      return tx.organizationOnboarding.findUniqueOrThrow({ where: { tenantId } });
    });
  }

  setFeature(
    tenantId: string,
    actorUserId: string,
    featureKey: string,
    enabled: boolean,
    version: number,
  ) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'feature_flags.update', 'feature_flag');
      const result = await tx.organizationFeature.updateMany({
        where: { featureKey, tenantId, version },
        data: { enabled, version: { increment: 1 } },
      });
      this.assertUpdated(result.count);
      await this.event(tx, tenantId, actorUserId, 'FEATURE_CHANGED', 'feature', featureKey, {
        enabled,
      });
      return tx.organizationFeature.findUniqueOrThrow({
        where: { tenantId_featureKey: { featureKey, tenantId } },
      });
    });
  }

  invitations(tenantId: string) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      const rows = await tx.organizationInvitation.findMany({
        where: { tenantId },
        include: { branches: true },
        orderBy: { createdAt: 'desc' },
      });
      return rows.map((row) =>
        this.invitationView(
          row,
          row.branches.map(({ branchId }) => branchId),
        ),
      );
    });
  }

  createInvitation(
    tenantId: string,
    actorUserId: string,
    input: InvitationInput,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'invitation.create', 'invitation');
      if (input.roleKey === 'OWNER') {
        const actorMembership = await tx.membership.findUnique({
          where: { tenantId_principalId: { principalId: actorUserId, tenantId } },
          include: { authorizationRoles: true },
        });
        const actorIsOwner =
          actorMembership?.status === 'ACTIVE' &&
          actorMembership.authorizationRoles.some(({ roleKey }) => roleKey === 'OWNER');
        if (!actorIsOwner) {
          throw new ForbiddenException('Only an Owner can invite another Owner');
        }
      }
      await this.assertInvitationInput(tx, tenantId, input);
      await tx.organizationInvitation.updateMany({
        where: { normalizedEmail: input.email.trim().toLowerCase(), status: 'PENDING', tenantId },
        data: { revokedAt: new Date(), status: 'REVOKED', version: { increment: 1 } },
      });
      const invitation = await tx.organizationInvitation.create({
        data: {
          accessScope: input.accessScope,
          email: input.email.trim(),
          expiresAt,
          invitedByUserId: actorUserId,
          normalizedEmail: input.email.trim().toLowerCase(),
          roleKey: input.roleKey,
          tenantId,
          tokenHash,
        },
      });
      if (input.branchIds.length)
        await tx.organizationInvitationBranch.createMany({
          data: input.branchIds.map((branchId) => ({
            branchId,
            invitationId: invitation.id,
            tenantId,
          })),
        });
      const organization = await tx.organization.findUniqueOrThrow({ where: { id: tenantId } });
      await this.event(
        tx,
        tenantId,
        actorUserId,
        'INVITATION_CREATED',
        'invitation',
        invitation.id,
        { roleKey: input.roleKey },
      );
      return {
        invitation: this.invitationView(invitation, input.branchIds),
        organizationName: organization.name,
      };
    });
  }

  rotateInvitation(
    tenantId: string,
    invitationId: string,
    actorUserId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'invitation.resend', 'invitation');
      const result = await tx.organizationInvitation.updateMany({
        where: { id: invitationId, status: 'PENDING', tenantId },
        data: { expiresAt, resendCount: { increment: 1 }, tokenHash, version: { increment: 1 } },
      });
      this.assertUpdated(result.count);
      const [invitation, organization] = await Promise.all([
        tx.organizationInvitation.findUniqueOrThrow({
          where: { tenantId_id: { id: invitationId, tenantId } },
          include: { branches: true },
        }),
        tx.organization.findUniqueOrThrow({ where: { id: tenantId } }),
      ]);
      await this.event(tx, tenantId, actorUserId, 'INVITATION_RESENT', 'invitation', invitationId);
      return {
        email: invitation.email,
        invitation: this.invitationView(
          invitation,
          invitation.branches.map(({ branchId }) => branchId),
        ),
        organizationName: organization.name,
      };
    });
  }

  revokeInvitation(tenantId: string, invitationId: string, actorUserId: string, version: number) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'invitation.revoke', 'invitation');
      const result = await tx.organizationInvitation.updateMany({
        where: { id: invitationId, status: 'PENDING', tenantId, version },
        data: { revokedAt: new Date(), status: 'REVOKED', version: { increment: 1 } },
      });
      this.assertUpdated(result.count);
      await this.event(tx, tenantId, actorUserId, 'INVITATION_REVOKED', 'invitation', invitationId);
      const invitation = await tx.organizationInvitation.findUniqueOrThrow({
        where: { tenantId_id: { id: invitationId, tenantId } },
        include: { branches: true },
      });
      return this.invitationView(
        invitation,
        invitation.branches.map(({ branchId }) => branchId),
      );
    });
  }

  acceptInvitation(tenantId: string, userId: string, normalizedEmail: string, tokenHash: string) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      const invitation = await tx.organizationInvitation.findFirst({
        where: { normalizedEmail, status: 'PENDING', tenantId, tokenHash },
        include: { branches: true },
      });
      if (!invitation || invitation.expiresAt <= new Date())
        throw new ForbiddenException('Invitation invalid or expired');
      const claimed = await tx.organizationInvitation.updateMany({
        where: {
          id: invitation.id,
          normalizedEmail,
          status: 'PENDING',
          tenantId,
          tokenHash,
          expiresAt: { gt: new Date() },
        },
        data: {
          acceptedAt: new Date(),
          acceptedByUserId: userId,
          status: 'ACCEPTED',
          version: { increment: 1 },
        },
      });
      if (claimed.count !== 1) throw new ForbiddenException('Invitation invalid or expired');
      const existingMembership = await tx.membership.findUnique({
        where: { tenantId_principalId: { principalId: userId, tenantId } },
      });
      if (existingMembership) throw new ConflictException('User is already a member');
      const legacyRole =
        invitation.roleKey === 'ADMINISTRATOR'
          ? 'ADMIN'
          : invitation.roleKey === 'READ_ONLY'
            ? 'ACCOUNTANT'
            : invitation.roleKey;
      const membership = await tx.membership.create({
        data: {
          accessScope: invitation.accessScope,
          principalId: userId,
          role: legacyRole as 'OWNER',
          tenantId,
        },
      });
      await tx.membershipAuthorizationRole.create({
        data: { membershipId: membership.id, roleKey: invitation.roleKey, tenantId },
      });
      if (invitation.branches.length)
        await tx.membershipBranchScope.createMany({
          data: invitation.branches.map(({ branchId }) => ({
            branchId,
            membershipId: membership.id,
            tenantId,
          })),
        });
      await this.event(tx, tenantId, userId, 'INVITATION_ACCEPTED', 'invitation', invitation.id);
      return membership;
    });
  }

  updateMembership(
    tenantId: string,
    membershipId: string,
    actorUserId: string,
    input: Parameters<ControlPlaneRepository['updateMembership']>[3],
  ) {
    return withTenantTransaction(this.database, tenantId, async (tx) => {
      await this.authorize(tx, actorUserId, tenantId, 'membership.update', 'membership');
      const current = await tx.membership.findUnique({
        where: { tenantId_id: { id: membershipId, tenantId } },
      });
      if (!current) throw new NotFoundException('Membership not found');
      const actorMembership = await tx.membership.findUnique({
        where: { tenantId_principalId: { principalId: actorUserId, tenantId } },
        include: { authorizationRoles: true },
      });
      const actorIsOwner =
        actorMembership?.status === 'ACTIVE' &&
        actorMembership.authorizationRoles.some(({ roleKey }) => roleKey === 'OWNER');
      const targetIsOwner = current.role === 'OWNER';
      if (!actorIsOwner && (targetIsOwner || input.roleKey === 'OWNER')) {
        throw new ForbiddenException('Only an Owner can assign or modify ownership');
      }
      if (input.status === 'REVOKED') {
        await this.authorize(tx, actorUserId, tenantId, 'membership.revoke', 'membership');
      }
      if (current.role === 'OWNER' && (input.status !== 'ACTIVE' || input.roleKey !== 'OWNER')) {
        const owners = await tx.membership.count({
          where: { role: 'OWNER', status: 'ACTIVE', tenantId },
        });
        if (owners <= 1) throw new ConflictException('Organization requires an active Owner');
      }
      const legacyRole =
        input.roleKey === 'ADMINISTRATOR'
          ? 'ADMIN'
          : input.roleKey === 'READ_ONLY'
            ? 'ACCOUNTANT'
            : input.roleKey;
      const result = await tx.membership.updateMany({
        where: { id: membershipId, tenantId, version: input.version },
        data: {
          accessScope: input.accessScope,
          role: legacyRole as 'OWNER',
          status: input.status,
          version: { increment: 1 },
        },
      });
      this.assertUpdated(result.count);
      await tx.membershipAuthorizationRole.deleteMany({ where: { membershipId, tenantId } });
      await tx.membershipAuthorizationRole.create({
        data: { membershipId, roleKey: input.roleKey, tenantId },
      });
      await tx.membershipBranchScope.deleteMany({ where: { membershipId, tenantId } });
      if (input.branchIds.length)
        await tx.membershipBranchScope.createMany({
          data: input.branchIds.map((branchId) => ({ branchId, membershipId, tenantId })),
        });
      await this.event(
        tx,
        tenantId,
        actorUserId,
        'MEMBERSHIP_UPDATED',
        'membership',
        membershipId,
        { roleKey: input.roleKey, status: input.status },
      );
      return tx.membership.findUniqueOrThrow({
        where: { tenantId_id: { id: membershipId, tenantId } },
      });
    });
  }

  private async assertInvitationInput(
    tx: DatabaseTransaction,
    tenantId: string,
    input: InvitationInput,
  ) {
    const role = await tx.authorizationRoleDefinition.findUnique({ where: { key: input.roleKey } });
    if (!role) throw new BadInput('Unknown role');
    if (input.accessScope === 'RESTRICTED' && input.branchIds.length === 0)
      throw new BadInput('Restricted invitation requires a branch');
    const branches = await tx.branch.count({
      where: { id: { in: [...input.branchIds] }, status: 'ACTIVE', tenantId },
    });
    if (branches !== new Set(input.branchIds).size) throw new BadInput('Invalid branch scope');
  }

  private stringArray(value: unknown): string[] {
    if (!Array.isArray(value) || !value.every((item) => typeof item === 'string'))
      throw new ConflictException('Template features are invalid');
    return value;
  }

  private authorize(
    transaction: DatabaseTransaction,
    userId: string,
    tenantId: string,
    permission: string,
    type: string,
    branchId?: string,
    status?: string,
  ) {
    return assertTransactionalAuthorization(transaction, {
      permission,
      resource: {
        type,
        ...(branchId === undefined ? {} : { branchId }),
        ...(status === undefined ? {} : { status }),
      },
      tenantId,
      userId,
    });
  }

  private assertUpdated(count: number) {
    if (count !== 1) throw new ConflictException('Resource version changed');
  }

  private event(
    tx: DatabaseTransaction,
    tenantId: string,
    actorUserId: string,
    type: string,
    targetType: string,
    targetId: string,
    metadata: Record<string, unknown> = {},
  ) {
    return tx.controlPlaneEvent.create({
      data: {
        actorUserId,
        metadata: this.json(metadata),
        outcome: 'SUCCESS',
        targetId,
        targetType,
        tenantId,
        type,
      },
    });
  }

  private json(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private invitationView(
    invitation: Readonly<{
      id: string;
      tenantId: string;
      email: string;
      roleKey: string;
      accessScope: string;
      status: string;
      expiresAt: Date;
      acceptedAt: Date | null;
      revokedAt: Date | null;
      resendCount: number;
      version: number;
      createdAt: Date;
      updatedAt: Date;
    }>,
    branchIds: readonly string[],
  ) {
    return {
      acceptedAt: invitation.acceptedAt,
      accessScope: invitation.accessScope,
      branchIds,
      createdAt: invitation.createdAt,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      id: invitation.id,
      resendCount: invitation.resendCount,
      revokedAt: invitation.revokedAt,
      roleKey: invitation.roleKey,
      status:
        invitation.status === 'PENDING' && invitation.expiresAt <= new Date()
          ? 'EXPIRED'
          : invitation.status,
      tenantId: invitation.tenantId,
      updatedAt: invitation.updatedAt,
      version: invitation.version,
    };
  }
}

class BadInput extends ConflictException {}
