import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const mode = process.argv[2] ?? 'reset';
const allowed = new Set([
  'reset',
  'progress',
  'new-user',
  'new-organization',
  'new-business',
  'alpha2',
]);
if (!allowed.has(mode)) throw new Error(`Modo no soportado: ${mode}`);
if (process.env.NODE_ENV === 'production')
  throw new Error('Owner onboarding tools are local-only.');

const ownerId = '41000000-0000-4000-8000-000000000001';
const alphaId = '10000000-0000-4000-8000-000000000001';
const suffix = Date.now().toString(36);
const userId = randomUUID();
const tenantId = randomUUID();
const membershipId = randomUUID();
const branchId = randomUUID();

const statements = {
  alpha2: `
    DELETE FROM sessions WHERE user_id='43000000-0000-4000-8000-000000000001';
    DELETE FROM devices WHERE user_id='43000000-0000-4000-8000-000000000001';
    DELETE FROM product_outbox WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM product_events WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM product_media WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM product_prices WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM product_barcodes WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM inventory_snapshots WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM inventory_cost_layers WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM inventory_movements WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM inventory_reservations WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM inventory_transfers WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM inventory_policies WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM product_variants WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM products WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM product_categories WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM inventory_locations WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    DELETE FROM branches WHERE tenant_id='13000000-0000-4000-8000-000000000001';
    UPDATE organization_onboarding SET status='DRAFT', current_step=1, answers='{}'::jsonb, completed_at=NULL, version=version+1, updated_at=now() WHERE tenant_id='13000000-0000-4000-8000-000000000001' RETURNING tenant_id;`,
  reset: `UPDATE organization_onboarding SET status='DRAFT', current_step=1, answers='{}'::jsonb, completed_at=NULL, version=version+1, updated_at=now() WHERE tenant_id='${alphaId}' RETURNING tenant_id;`,
  progress: `UPDATE organization_onboarding SET status='DRAFT', current_step=1, answers='{}'::jsonb, completed_at=NULL, version=version+1, updated_at=now() WHERE tenant_id='${alphaId}' RETURNING tenant_id;`,
  'new-user': `
    INSERT INTO users(id,email,normalized_email,display_name,given_name,family_name,locale,time_zone,regional_format,status,status_changed_at,email_verified_at,preferences,metadata,feature_overrides,created_at,updated_at)
    SELECT '${userId}','owner.${suffix}@nexo.local','owner.${suffix}@nexo.local','Owner Nuevo ${suffix}','Owner','Nuevo','es-MX','America/Mazatlan','es-MX','ACTIVE',now(),now(),'{}','{}','{}',now(),now() FROM users WHERE id='${ownerId}';
    INSERT INTO password_credentials(user_id,hash,salt,algorithm,memory_kib,passes,parallelism,algorithm_version,must_change,changed_at,created_at,updated_at)
    SELECT '${userId}',hash,salt,algorithm,memory_kib,passes,parallelism,algorithm_version,false,now(),now(),now() FROM password_credentials WHERE user_id='${ownerId}';
    INSERT INTO user_emails(id,user_id,address,normalized_address,status,is_primary,verified_at,created_at,updated_at)
    VALUES(gen_random_uuid(),'${userId}','owner.${suffix}@nexo.local','owner.${suffix}@nexo.local','VERIFIED',true,now(),now(),now());
    INSERT INTO memberships(id,tenant_id,principal_id,role,access_scope,status,version,created_at,updated_at)
    VALUES('${membershipId}','${alphaId}','${userId}','OWNER','ALL_BRANCHES','ACTIVE',1,now(),now());
    INSERT INTO membership_authorization_roles(id,tenant_id,membership_id,role_key,scope,created_at,updated_at)
    VALUES(gen_random_uuid(),'${alphaId}','${membershipId}','OWNER','ORGANIZATION',now(),now());
    SELECT 'owner.${suffix}@nexo.local';`,
  'new-organization': `
    INSERT INTO organizations(id,slug,name,status,country_code,default_locale,default_currency,time_zone,branding,settings,address,date_format,time_format,money_format,regional_settings,version,created_at,updated_at)
    VALUES('${tenantId}','owner-clean-${suffix}','Negocio limpio ${suffix}','ACTIVE','MX','es-MX','MXN','America/Mazatlan','{}','{}','{}','DD/MM/YYYY','24h','symbol-before','{}',1,now(),now());
    INSERT INTO memberships(id,tenant_id,principal_id,role,access_scope,status,version,created_at,updated_at)
    VALUES('${membershipId}','${tenantId}','${ownerId}','OWNER','ALL_BRANCHES','ACTIVE',1,now(),now());
    INSERT INTO membership_authorization_roles(id,tenant_id,membership_id,role_key,scope,created_at,updated_at)
    VALUES(gen_random_uuid(),'${tenantId}','${membershipId}','OWNER','ORGANIZATION',now(),now());
    INSERT INTO organization_onboarding(tenant_id,status,current_step,answers,version,created_at,updated_at)
    VALUES('${tenantId}','DRAFT',1,'{}',1,now(),now());
    SELECT '${tenantId}';`,
  'new-business': `
    INSERT INTO users(id,email,normalized_email,display_name,given_name,family_name,locale,time_zone,regional_format,status,status_changed_at,email_verified_at,preferences,metadata,feature_overrides,created_at,updated_at)
    SELECT '${userId}','owner.${suffix}@nexo.local','owner.${suffix}@nexo.local','Owner Nuevo ${suffix}','Owner','Nuevo','es-MX','America/Mazatlan','es-MX','ACTIVE',now(),now(),'{}','{}','{}',now(),now() FROM users WHERE id='${ownerId}';
    INSERT INTO password_credentials(user_id,hash,salt,algorithm,memory_kib,passes,parallelism,algorithm_version,must_change,changed_at,created_at,updated_at)
    SELECT '${userId}',hash,salt,algorithm,memory_kib,passes,parallelism,algorithm_version,false,now(),now(),now() FROM password_credentials WHERE user_id='${ownerId}';
    INSERT INTO user_emails(id,user_id,address,normalized_address,status,is_primary,verified_at,created_at,updated_at)
    VALUES(gen_random_uuid(),'${userId}','owner.${suffix}@nexo.local','owner.${suffix}@nexo.local','VERIFIED',true,now(),now(),now());
    INSERT INTO organizations(id,slug,name,status,country_code,default_locale,default_currency,time_zone,branding,settings,address,date_format,time_format,money_format,regional_settings,version,created_at,updated_at)
    VALUES('${tenantId}','owner-clean-${suffix}','Negocio limpio ${suffix}','ACTIVE','MX','es-MX','MXN','America/Mazatlan','{}','{}','{}','DD/MM/YYYY','24h','symbol-before','{}',1,now(),now());
    INSERT INTO memberships(id,tenant_id,principal_id,role,access_scope,status,version,created_at,updated_at)
    VALUES('${membershipId}','${tenantId}','${userId}','OWNER','ALL_BRANCHES','ACTIVE',1,now(),now());
    INSERT INTO membership_authorization_roles(id,tenant_id,membership_id,role_key,scope,created_at,updated_at)
    VALUES(gen_random_uuid(),'${tenantId}','${membershipId}','OWNER','ORGANIZATION',now(),now());
    INSERT INTO branches(tenant_id,id,code,name,status,time_zone,locale,currency,business_hours,settings,version,created_at,updated_at)
    VALUES('${tenantId}','${branchId}','MAIN','Sucursal principal','ACTIVE','America/Mazatlan','es-MX','MXN','{}','{}',1,now(),now());
    INSERT INTO organization_onboarding(tenant_id,status,current_step,answers,version,created_at,updated_at)
    VALUES('${tenantId}','DRAFT',1,'{}',1,now(),now());
    SELECT '${tenantId}';`,
};

const result = spawnSync(
  'docker',
  [
    'compose',
    'exec',
    '-T',
    'postgres',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    'nexo_admin',
    '-d',
    'nexo',
    '-At',
  ],
  { input: `BEGIN; ${statements[mode]} COMMIT;`, encoding: 'utf8' },
);
if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}
const output = result.stdout.trim().split('\n').filter(Boolean).at(-2) ?? result.stdout.trim();
console.log(`Owner onboarding preparado (${mode}).`);
if (mode === 'new-user' || mode === 'new-business') {
  console.log(`Usuario: owner.${suffix}@nexo.local`);
  console.log('Contraseña: la credencial local de alpha.owner@nexo.local');
  if (mode === 'new-business') {
    console.log(`Organización: Negocio limpio ${suffix}`);
    console.log(`ID: ${tenantId}`);
  }
} else if (mode === 'new-organization') {
  console.log(`Organización: Negocio limpio ${suffix}`);
  console.log(`ID: ${tenantId}`);
} else if (mode === 'alpha2') {
  console.log('Usuario: alpha2.owner@nexo.local');
  console.log('Contraseña: la credencial local autorizada de Alpha');
  console.log('Onboarding limpio: paso 1');
} else {
  console.log(`Organización reiniciada: ${output || alphaId}`);
}
console.log('Abre http://localhost:3000/control-plane/onboarding');
