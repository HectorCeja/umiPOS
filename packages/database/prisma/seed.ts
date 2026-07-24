import * as crypto from 'node:crypto';

import {
  AUTHORIZATION_REGISTRY_VERSION,
  featureRegistry,
  permissionRegistry,
  rolePermissionRegistry,
  roleRegistry,
  type RoleKey,
} from '@nexo/authorization';
import { PrismaPg } from '@prisma/adapter-pg';
import { validateTemplate } from '@nexo/control-plane';

import { PrismaClient } from '../src/generated/client/client.js';

const databaseUrl = process.env.MIGRATION_DATABASE_URL;
if (databaseUrl === undefined)
  throw new Error('MIGRATION_DATABASE_URL is required to seed administrative fixtures');
const defaultLocale = process.env.IDENTITY_DEFAULT_LOCALE;
const defaultTimeZone = process.env.IDENTITY_DEFAULT_TIME_ZONE;
const defaultRegionalFormat = process.env.IDENTITY_DEFAULT_REGIONAL_FORMAT;
if (!defaultLocale || !defaultTimeZone || !defaultRegionalFormat) {
  throw new Error('Identity regional configuration is required to seed the database');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const testPassword = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

type Argon2Function = (
  algorithm: 'argon2id',
  parameters: {
    message: string;
    nonce: Buffer;
    parallelism: number;
    tagLength: number;
    memory: number;
    passes: number;
  },
  callback: (error: Error | null, derivedKey: Buffer) => void,
) => void;

const argon2 = (crypto as unknown as { argon2: Argon2Function }).argon2;

async function passwordCredential() {
  const salt = crypto.randomBytes(16);
  const hash = await new Promise<Buffer>((resolve, reject) => {
    argon2(
      'argon2id',
      {
        memory: 19_456,
        message: testPassword,
        nonce: salt,
        parallelism: 1,
        passes: 2,
        tagLength: 32,
      },
      (error, key) => {
        if (error === null) resolve(key);
        else reject(error);
      },
    );
  });
  return { hash: hash.toString('base64url'), salt: salt.toString('base64url') };
}

const organizations = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    slug: 'organization-alpha',
    name: 'Organization Alpha',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    slug: 'organization-beta',
    name: 'Organization Beta',
  },
] as const;

const personas = [
  ['41000000-0000-4000-8000-000000000001', 'alpha.owner@nexo.local', 'Alpha Owner', 'OWNER', 0],
  ['41000000-0000-4000-8000-000000000002', 'alpha.admin@nexo.local', 'Alpha Admin', 'ADMIN', 0],
  [
    '41000000-0000-4000-8000-000000000003',
    'alpha.supervisor@nexo.local',
    'Alpha Supervisor',
    'SUPERVISOR',
    0,
  ],
  [
    '41000000-0000-4000-8000-000000000004',
    'alpha.cashier@nexo.local',
    'Alpha Cashier',
    'CASHIER',
    0,
  ],
  [
    '41000000-0000-4000-8000-000000000005',
    'alpha.employee@nexo.local',
    'Alpha Employee',
    'EMPLOYEE',
    0,
  ],
  [
    '41000000-0000-4000-8000-000000000006',
    'alpha.readonly@nexo.local',
    'Alpha ReadOnly',
    'ACCOUNTANT',
    0,
  ],
  [
    '41000000-0000-4000-8000-000000000007',
    'alpha.lockout@nexo.local',
    'Alpha Lockout',
    'EMPLOYEE',
    0,
  ],
  ['42000000-0000-4000-8000-000000000001', 'beta.owner@nexo.local', 'Beta Owner', 'OWNER', 1],
  ['42000000-0000-4000-8000-000000000002', 'beta.admin@nexo.local', 'Beta Admin', 'ADMIN', 1],
  ['42000000-0000-4000-8000-000000000003', 'beta.cashier@nexo.local', 'Beta Cashier', 'CASHIER', 1],
  ['43000000-0000-4000-8000-000000000001', 'alpha2.owner@nexo.local', 'Alpha2 Owner', 'OWNER', 99],
] as const;

// These are official synthetic personas. Re-seeding resets only their volatile
// authentication evidence so real Compose E2E runs are repeatable.
const personaIds = personas.map(([id]) => id);
await prisma.$transaction([
  prisma.securityEvent.deleteMany({ where: { userId: { in: personaIds } } }),
  prisma.identityToken.deleteMany({ where: { userId: { in: personaIds } } }),
  prisma.session.deleteMany({ where: { userId: { in: personaIds } } }),
  prisma.device.deleteMany({ where: { userId: { in: personaIds } } }),
]);

// Seed is additive for established tenants. Acceptance preparation must never
// erase business data in Alpha/Beta (or any owner-created tenant). Stable
// fixtures below use deterministic upserts; only the dedicated Alpha2 QA
// tenant is reset explicitly and dependency-aware.

await prisma.platformMetadata.upsert({
  where: { key: 'foundation_version' },
  update: { value: '8' },
  create: { key: 'foundation_version', value: '8' },
});

const templateSeeds = [
  [
    'retail-store',
    'Retail Store',
    'RETAIL_STORE',
    ['POS', 'INVENTORY', 'REPORTS'],
    ['General', 'Promociones'],
  ],
  [
    'restaurant',
    'Restaurant',
    'RESTAURANT',
    ['POS', 'INVENTORY', 'KITCHEN', 'REPORTS'],
    ['Entradas', 'Platos', 'Bebidas'],
  ],
  [
    'coffee-shop',
    'Coffee Shop',
    'COFFEE_SHOP',
    ['POS', 'INVENTORY', 'KITCHEN', 'LOYALTY'],
    ['Café', 'Bebidas', 'Alimentos'],
  ],
  [
    'barber-shop',
    'Barber Shop',
    'BARBER_SHOP',
    ['POS', 'APPOINTMENTS', 'LOYALTY'],
    ['Cortes', 'Barba', 'Productos'],
  ],
  [
    'beauty-salon',
    'Beauty Salon',
    'BEAUTY_SALON',
    ['POS', 'APPOINTMENTS', 'LOYALTY'],
    ['Cabello', 'Uñas', 'Tratamientos'],
  ],
  [
    'tattoo-studio',
    'Tattoo Studio',
    'TATTOO_STUDIO',
    ['POS', 'APPOINTMENTS'],
    ['Tatuajes', 'Perforaciones', 'Cuidados'],
  ],
  [
    'service-business',
    'Service Business',
    'SERVICE_BUSINESS',
    ['POS', 'APPOINTMENTS', 'REPORTS'],
    ['Servicios'],
  ],
  ['other-business', 'Other Business', 'OTHER', ['POS'], ['General']],
] as const;

for (const [key, name, businessType, features, categories] of templateSeeds) {
  const suggestedPermissions = {
    ADMINISTRATOR: ['organization.update', 'branch.create', 'invitation.create'],
    OWNER: ['organization.archive', 'organization.update', 'membership.update'],
  };
  const template = validateTemplate({
    businessType,
    categorySuggestions: categories,
    features,
    initialSettings: { schemaVersion: 1, workflow: businessType.toLowerCase() },
    key,
    name,
    suggestedPermissions,
    version: 1,
  });
  await prisma.businessTemplate.upsert({
    where: { key },
    create: {
      businessType: template.businessType,
      categorySuggestions: [...categories],
      description: `${name} onboarding defaults`,
      features: [...features],
      initialSettings: { schemaVersion: 1, workflow: businessType.toLowerCase() },
      key,
      name,
      status: 'ACTIVE',
      suggestedPermissions,
      version: template.version,
    },
    update: {
      businessType: template.businessType,
      categorySuggestions: [...categories],
      features: [...features],
      initialSettings: { schemaVersion: 1, workflow: businessType.toLowerCase() },
      name,
      status: 'ACTIVE',
      suggestedPermissions,
      version: template.version,
    },
  });
}

for (const role of roleRegistry) {
  await prisma.authorizationRoleDefinition.upsert({
    where: { key: role.key },
    create: {
      ...role,
      registryVersion: AUTHORIZATION_REGISTRY_VERSION,
    },
    update: {
      description: role.description,
      name: role.name,
      registryVersion: AUTHORIZATION_REGISTRY_VERSION,
    },
  });
}

for (const feature of featureRegistry) {
  await prisma.authorizationFeatureDefinition.upsert({
    where: { key: feature.key },
    create: {
      ...feature,
      registryVersion: AUTHORIZATION_REGISTRY_VERSION,
    },
    update: {
      name: feature.name,
      registryVersion: AUTHORIZATION_REGISTRY_VERSION,
    },
  });
}

for (const permission of permissionRegistry) {
  await prisma.authorizationPermissionDefinition.upsert({
    where: { key: permission.key },
    create: {
      accessKind: permission.access,
      action: permission.action,
      description: permission.description,
      featureKey: 'feature' in permission ? permission.feature : null,
      key: permission.key,
      registryVersion: AUTHORIZATION_REGISTRY_VERSION,
      resource: permission.resource,
    },
    update: {
      accessKind: permission.access,
      action: permission.action,
      description: permission.description,
      featureKey: 'feature' in permission ? permission.feature : null,
      registryVersion: AUTHORIZATION_REGISTRY_VERSION,
      resource: permission.resource,
    },
  });
}

for (const [roleKey, grants] of Object.entries(rolePermissionRegistry) as readonly [
  RoleKey,
  (typeof rolePermissionRegistry)[RoleKey],
][]) {
  for (const grant of grants) {
    await prisma.authorizationRolePermission.upsert({
      where: {
        roleKey_permissionKey: { permissionKey: grant.permission, roleKey },
      },
      create: { permissionKey: grant.permission, roleKey, scope: grant.scope },
      update: { scope: grant.scope },
    });
  }
}

for (const [id, email, displayName] of personas) {
  const credential = await passwordCredential();
  const [givenName = displayName, ...familyNameParts] = displayName.split(' ');
  const familyName = familyNameParts.join(' ');
  const verified = email !== 'beta.admin@nexo.local';
  await prisma.user.upsert({
    where: { id },
    create: {
      id,
      displayName,
      givenName,
      familyName,
      email,
      normalizedEmail: email,
      emailVerifiedAt: verified ? new Date() : null,
      locale: defaultLocale,
      regionalFormat: defaultRegionalFormat,
      status: verified ? 'ACTIVE' : 'PENDING_VERIFICATION',
      statusReason: null,
      statusChangedAt: new Date(),
      failedLoginCount: 0,
      firstFailedLoginAt: null,
      lockedUntil: null,
      timeZone: defaultTimeZone,
      passwordChangedAt: new Date(),
      passwordCredential: { create: credential },
    },
    update: {
      displayName,
      givenName,
      familyName,
      email,
      normalizedEmail: email,
      emailVerifiedAt: verified ? new Date() : null,
      locale: defaultLocale,
      regionalFormat: defaultRegionalFormat,
      status: verified ? 'ACTIVE' : 'PENDING_VERIFICATION',
      statusReason: null,
      statusChangedAt: new Date(),
      failedLoginCount: 0,
      firstFailedLoginAt: null,
      lockedUntil: null,
      timeZone: defaultTimeZone,
      passwordCredential: { upsert: { create: credential, update: credential } },
    },
  });
  await prisma.userEmail.upsert({
    where: { normalizedAddress: email },
    create: {
      address: email,
      isPrimary: true,
      normalizedAddress: email,
      status: verified ? 'VERIFIED' : 'PENDING',
      userId: id,
      verifiedAt: verified ? new Date() : null,
    },
    update: {
      address: email,
      isPrimary: true,
      status: verified ? 'VERIFIED' : 'PENDING',
      verifiedAt: verified ? new Date() : null,
      revokedAt: null,
    },
  });
}

for (const [organizationIndex, organization] of organizations.entries()) {
  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${organization.id}, true)`;
    await transaction.organization.upsert({
      where: { id: organization.id },
      create: {
        ...organization,
        countryCode: 'MX',
        defaultCurrency: 'MXN',
        defaultLocale: 'es-MX',
        timeZone: 'America/Mexico_City',
      },
      update: { name: organization.name },
    });
    const mainBranchId = `20000000-0000-4000-8000-00000000000${String(organizationIndex + 1)}`;
    const mainBranch = await transaction.branch.upsert({
      // The seed owns this stable fixture identity. Looking it up by mutable
      // business code makes re-seeding fail after manual acceptance renames a
      // branch (the fixed UUID still exists, so create hits the primary key).
      where: { tenantId_id: { tenantId: organization.id, id: mainBranchId } },
      create: {
        id: mainBranchId,
        tenantId: organization.id,
        code: 'MAIN',
        name: 'Main Branch',
      },
      update: { code: 'MAIN', name: 'Main Branch' },
    });
    const salesPolicy = {
      currency: 'MXN',
      allowWithoutInventory: true,
      allowNegativeStock: false,
      automaticReservation: true,
      reservationTtlSeconds: 900,
      allowDiscounts: true,
      maximumDiscountBasisPoints: 2000,
      requireSupervisorAboveBasisPoints: 1000,
      allowManualPrice: false,
      allowSuspendedSales: true,
      suspendedSaleTtlSeconds: 3600,
      allowCancellation: true,
      allowRefund: true,
      roundingMode: 'HALF_UP',
      enabledPaymentMethods: ['CASH', 'CARD_EXTERNAL', 'BANK_TRANSFER'],
    };
    const existingSalesPolicy = await transaction.salesPolicyRecord.findFirst({
      where: { tenantId: organization.id, branchId: mainBranch.id },
    });
    if (existingSalesPolicy)
      await transaction.salesPolicyRecord.update({
        where: {
          tenantId_id: { tenantId: organization.id, id: existingSalesPolicy.id },
        },
        data: { configuration: salesPolicy },
      });
    else
      await transaction.salesPolicyRecord.create({
        data: {
          tenantId: organization.id,
          branchId: mainBranch.id,
          configuration: salesPolicy,
        },
      });
    await transaction.organizationOnboarding.upsert({
      where: { tenantId: organization.id },
      create: {
        answers: { seededPersona: true },
        businessType: 'RETAIL_STORE',
        completedAt: new Date(),
        currentStep: 5,
        status: 'COMPLETED',
        templateKey: 'retail-store',
        templateVersion: 1,
        tenantId: organization.id,
      },
      update: {},
    });
    for (const feature of featureRegistry) {
      const enabled = ['POS', 'INVENTORY', 'REPORTS', 'APPOINTMENTS'].includes(feature.key);
      await transaction.organizationFeature.upsert({
        where: {
          tenantId_featureKey: { featureKey: feature.key, tenantId: organization.id },
        },
        create: {
          enabled,
          featureKey: feature.key,
          tenantId: organization.id,
        },
        update: { enabled },
      });
    }
    for (const [id, , , role, personaOrganizationIndex] of personas) {
      if (personaOrganizationIndex !== organizationIndex) continue;
      const membership = await transaction.membership.upsert({
        where: { tenantId_principalId: { tenantId: organization.id, principalId: id } },
        create: { tenantId: organization.id, principalId: id, role },
        update: { role, status: 'ACTIVE' },
      });
      const authorizationRole: RoleKey =
        role === 'ADMIN' ? 'ADMINISTRATOR' : role === 'ACCOUNTANT' ? 'READ_ONLY' : role;
      // Official synthetic personas are security-test fixtures. Re-seeding must
      // remove role assignments left by a previous escalation probe while
      // preserving every non-fixture membership and all business data.
      await transaction.membershipAuthorizationRole.deleteMany({
        where: {
          membershipId: membership.id,
          roleKey: { not: authorizationRole },
          tenantId: organization.id,
        },
      });
      await transaction.membershipAuthorizationRole.upsert({
        where: {
          tenantId_membershipId_roleKey: {
            membershipId: membership.id,
            roleKey: authorizationRole,
            tenantId: organization.id,
          },
        },
        create: {
          membershipId: membership.id,
          roleKey: authorizationRole,
          scope: 'ORGANIZATION',
          tenantId: organization.id,
        },
        update: {
          branchId: null,
          customScope: null,
          scope: 'ORGANIZATION',
          validFrom: null,
          validUntil: null,
        },
      });
    }
  });
}

// Alpha2 is the permanent clean owner journey. It deliberately has its own
// tenant and no branches or business data. Re-seeding is the explicit reset;
// daily starts never mutate its onboarding progress.
const alpha2TenantId = '13000000-0000-4000-8000-000000000001';
const alpha2UserId = '43000000-0000-4000-8000-000000000001';
await prisma.$transaction(async (transaction) => {
  await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${alpha2TenantId}, true)`;
  await transaction.organization.upsert({
    where: { id: alpha2TenantId },
    create: {
      id: alpha2TenantId,
      slug: 'alpha2-clean-owner',
      name: 'Negocio nuevo Alpha2',
      status: 'ACTIVE',
      countryCode: 'MX',
      defaultCurrency: 'MXN',
      defaultLocale: 'es-MX',
      timeZone: 'America/Mazatlan',
    },
    update: { name: 'Negocio nuevo Alpha2', status: 'ACTIVE' },
  });
  const membership = await transaction.membership.upsert({
    where: { tenantId_principalId: { tenantId: alpha2TenantId, principalId: alpha2UserId } },
    create: { tenantId: alpha2TenantId, principalId: alpha2UserId, role: 'OWNER' },
    update: { role: 'OWNER', status: 'ACTIVE' },
  });
  await transaction.membershipAuthorizationRole.upsert({
    where: {
      tenantId_membershipId_roleKey: {
        tenantId: alpha2TenantId,
        membershipId: membership.id,
        roleKey: 'OWNER',
      },
    },
    create: {
      tenantId: alpha2TenantId,
      membershipId: membership.id,
      roleKey: 'OWNER',
      scope: 'ORGANIZATION',
    },
    update: { scope: 'ORGANIZATION', branchId: null, customScope: null },
  });
  await transaction.organizationOnboarding.upsert({
    where: { tenantId: alpha2TenantId },
    create: { tenantId: alpha2TenantId, status: 'DRAFT', currentStep: 1, answers: {} },
    update: { status: 'DRAFT', currentStep: 1, answers: {}, completedAt: null },
  });
  for (const feature of featureRegistry) {
    const enabled = ['POS', 'INVENTORY', 'REPORTS', 'APPOINTMENTS'].includes(feature.key);
    await transaction.organizationFeature.upsert({
      where: { tenantId_featureKey: { tenantId: alpha2TenantId, featureKey: feature.key } },
      create: { tenantId: alpha2TenantId, featureKey: feature.key, enabled },
      update: { enabled },
    });
  }
  await transaction.productOutbox.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.productEvent.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.productMedia.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.productPrice.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.productBarcode.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.inventorySnapshot.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.inventoryCostLayer.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.inventoryMovement.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.inventoryReservation.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.inventoryTransfer.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.inventoryPolicy.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.productVariant.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.product.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.productCategory.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.inventoryLocation.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.branch.deleteMany({ where: { tenantId: alpha2TenantId } });
  await transaction.organizationInvitation.deleteMany({ where: { tenantId: alpha2TenantId } });
});

await prisma.$disconnect();
