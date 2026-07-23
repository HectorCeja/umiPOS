import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class OrganizationIdDto {
  @IsUUID() organizationId!: string;
}
export class BranchIdDto extends OrganizationIdDto {
  @IsUUID() branchId!: string;
}
export class InvitationIdDto extends OrganizationIdDto {
  @IsUUID() invitationId!: string;
}
export class MembershipIdDto extends OrganizationIdDto {
  @IsUUID() membershipId!: string;
}
export class FeatureKeyDto extends OrganizationIdDto {
  @Matches(/^[A-Z][A-Z0-9_]*$/) featureKey!: string;
}

export class VersionDto {
  @Type(() => Number) @IsInt() @Min(1) version!: number;
}

export class CreateOrganizationDto {
  @IsString() @MinLength(1) @MaxLength(160) name!: string;
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug!: string;
  @Matches(/^[A-Z]{2}$/) countryCode!: string;
  @Matches(/^[A-Z]{3}$/) defaultCurrency!: string;
  @IsString() @MaxLength(35) defaultLocale!: string;
  @IsString() @MaxLength(63) timeZone!: string;
  @IsIn([
    'RETAIL_STORE',
    'RESTAURANT',
    'COFFEE_SHOP',
    'BARBER_SHOP',
    'BEAUTY_SALON',
    'TATTOO_STUDIO',
    'SERVICE_BUSINESS',
    'OTHER',
  ])
  businessType!:
    | 'RETAIL_STORE'
    | 'RESTAURANT'
    | 'COFFEE_SHOP'
    | 'BARBER_SHOP'
    | 'BEAUTY_SALON'
    | 'TATTOO_STUDIO'
    | 'SERVICE_BUSINESS'
    | 'OTHER';
  @IsOptional() @IsString() templateKey?: string;
}

export class UpdateOrganizationDto extends VersionDto {
  @IsOptional() @IsString() @MaxLength(160) name?: string;
  @IsOptional() @IsString() @MaxLength(32) legalTaxId?: string;
  @IsOptional() @IsObject() branding?: Record<string, unknown>;
  @IsOptional() @IsObject() address?: Record<string, unknown>;
  @IsOptional() @Matches(/^[A-Z]{2}$/) countryCode?: string;
  @IsOptional() @Matches(/^[A-Z]{3}$/) defaultCurrency?: string;
  @IsOptional() @IsString() defaultLocale?: string;
  @IsOptional() @IsString() timeZone?: string;
  @IsOptional() @IsString() dateFormat?: string;
  @IsOptional() @IsIn(['12h', '24h']) timeFormat?: '12h' | '24h';
  @IsOptional() @IsString() moneyFormat?: string;
  @IsOptional() @IsObject() regionalSettings?: Record<string, unknown>;
}

export class BranchDto {
  @Matches(/^[A-Z0-9][A-Z0-9_-]{0,49}$/) code!: string;
  @IsString() @MinLength(1) @MaxLength(160) name!: string;
  @IsOptional() @IsString() timeZone?: string;
  @IsOptional() @IsString() locale?: string;
  @IsOptional() @Matches(/^[A-Z]{3}$/) currency?: string;
  @IsOptional() @IsObject() businessHours?: Record<string, unknown>;
  @IsOptional() @IsObject() settings?: Record<string, unknown>;
}
export class UpdateBranchDto extends BranchDto {
  @Type(() => Number) @IsInt() @Min(1) version!: number;
}

export class SaveOnboardingDto extends VersionDto {
  @IsInt() @Min(1) currentStep!: number;
  @IsIn([
    'RETAIL_STORE',
    'RESTAURANT',
    'COFFEE_SHOP',
    'BARBER_SHOP',
    'BEAUTY_SALON',
    'TATTOO_STUDIO',
    'SERVICE_BUSINESS',
    'OTHER',
  ])
  businessType!: CreateOrganizationDto['businessType'];
  @IsString() templateKey!: string;
  @IsObject() answers!: Record<string, unknown>;
}

export class FeatureUpdateDto extends VersionDto {
  @IsBoolean() enabled!: boolean;
}

export class InvitationDto {
  @IsEmail() @MaxLength(320) email!: string;
  @IsIn(['OWNER', 'ADMINISTRATOR', 'SUPERVISOR', 'CASHIER', 'EMPLOYEE', 'READ_ONLY'])
  roleKey!: string;
  @IsIn(['ALL_BRANCHES', 'RESTRICTED']) accessScope!: 'ALL_BRANCHES' | 'RESTRICTED';
  @IsArray() @IsUUID('4', { each: true }) branchIds!: string[];
}
export class AcceptInvitationDto {
  @IsString() @MinLength(32) @MaxLength(256) token!: string;
}
export class MembershipUpdateDto extends VersionDto {
  @IsIn(['OWNER', 'ADMINISTRATOR', 'SUPERVISOR', 'CASHIER', 'EMPLOYEE', 'READ_ONLY'])
  roleKey!: string;
  @IsIn(['ACTIVE', 'SUSPENDED', 'REVOKED']) status!: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  @IsIn(['ALL_BRANCHES', 'RESTRICTED']) accessScope!: 'ALL_BRANCHES' | 'RESTRICTED';
  @IsArray() @IsUUID('4', { each: true }) branchIds!: string[];
}
