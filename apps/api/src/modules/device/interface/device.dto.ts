import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class DeviceOrganizationPathDto {
  @IsUUID() organizationId!: string;
}
export class DevicePathDto extends DeviceOrganizationPathDto {
  @IsUUID() deviceId!: string;
}

export class CreateEnrollmentDto {
  @IsOptional() @IsUUID() branchId?: string;
  @IsString() @MinLength(8) @MaxLength(160) idempotencyKey!: string;
  @IsOptional() @IsObject() capabilities?: Record<string, unknown>;
  @IsOptional() @IsInt() @Min(1) @Max(30) expiresInMinutes?: number;
}

export class ConsumeEnrollmentDto {
  @IsString() @MinLength(40) @MaxLength(600) token!: string;
  @IsString() @MinLength(1) @MaxLength(160) name!: string;
  @IsString() @MinLength(1) @MaxLength(40) platform!: string;
  @IsString() @MinLength(1) @MaxLength(40) appVersion!: string;
  @Matches(/^[a-f0-9]{64}$/) fingerprintHash!: string;
  @IsString() @MinLength(8) @MaxLength(160) idempotencyKey!: string;
  @IsOptional() @IsObject() capabilities?: Record<string, unknown>;
}

export class DeviceStatusDto {
  @IsIn(['ACTIVE', 'DISABLED']) status!: 'ACTIVE' | 'DISABLED';
  @IsString() @MinLength(1) @MaxLength(500) reason!: string;
}

export class DeviceRevokeDto {
  @IsString() @MinLength(1) @MaxLength(500) reason!: string;
}

export class RotateCredentialDto {
  @IsString() @MinLength(8) @MaxLength(160) idempotencyKey!: string;
}
