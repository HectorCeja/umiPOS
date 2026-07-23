import { costMethods, manualMovementTypes, stockStates } from '@nexo/inventory';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export class TenantPath {
  @IsUUID() organizationId!: string;
}
export class LocationPath extends TenantPath {
  @IsUUID() locationId!: string;
}
export class ReservationPath extends TenantPath {
  @IsUUID() reservationId!: string;
}
export class TransferPath extends TenantPath {
  @IsUUID() transferId!: string;
}
export class AvailabilityQuery {
  @IsUUID() variantId!: string;
  @IsUUID() locationId!: string;
}
export class LocationDto {
  @IsUUID() branchId!: string;
  @IsUUID() @IsOptional() parentId?: string;
  @IsIn(['BRANCH', 'WAREHOUSE', 'ZONE', 'SHELF', 'BIN']) type!:
    | 'BRANCH'
    | 'WAREHOUSE'
    | 'ZONE'
    | 'SHELF'
    | 'BIN';
  @IsString() @MinLength(1) @MaxLength(80) code!: string;
  @IsString() @MinLength(1) @MaxLength(160) name!: string;
}
export class UpdateLocationDto {
  @IsUUID() @IsOptional() branchId?: string;
  @IsIn(['BRANCH', 'WAREHOUSE', 'ZONE', 'SHELF', 'BIN']) @IsOptional() type?:
    | 'BRANCH'
    | 'WAREHOUSE'
    | 'ZONE'
    | 'SHELF'
    | 'BIN';
  @IsString() @MinLength(1) @MaxLength(80) @IsOptional() code?: string;
  @IsString() @MinLength(1) @MaxLength(160) @IsOptional() name?: string;
  @IsBoolean() @IsOptional() active?: boolean;
}
export class MovementDto {
  @IsUUID() variantId!: string;
  @IsUUID() locationId!: string;
  @IsIn(manualMovementTypes) type!: (typeof manualMovementTypes)[number];
  @IsIn(stockStates) state!: (typeof stockStates)[number];
  @Matches(/^-?(0|[1-9]\d{0,13})(\.\d{1,6})?$/) quantity!: string;
  @Matches(/^(0|[1-9]\d{0,13})(\.\d{1,6})?$/) @IsOptional() unitCost?: string;
  @Matches(/^[A-Z]{3}$/) @IsOptional() currency?: string;
  @IsString() @MinLength(1) @MaxLength(500) reason!: string;
  @Type(() => Date) @IsDate() occurredAt!: Date;
  @IsString() @MinLength(8) @MaxLength(160) idempotencyKey!: string;
}
export class ReservationDto {
  @IsUUID() variantId!: string;
  @IsUUID() locationId!: string;
  @Matches(/^(0|[1-9]\d{0,13})(\.\d{1,6})?$/) quantity!: string;
  @IsString() @MinLength(1) @MaxLength(80) sourceType!: string;
  @IsString() @MinLength(1) @MaxLength(160) sourceId!: string;
  @Type(() => Date) @IsDate() expiresAt!: Date;
  @IsString() @MinLength(8) @MaxLength(160) idempotencyKey!: string;
}
export class ReleaseDto {
  @IsString() @MinLength(1) @MaxLength(500) reason!: string;
  @IsString() @MinLength(8) @MaxLength(150) idempotencyKey!: string;
}
export class TransferDto {
  @IsUUID() variantId!: string;
  @IsUUID() fromLocationId!: string;
  @IsUUID() toLocationId!: string;
  @Matches(/^(0|[1-9]\d{0,13})(\.\d{1,6})?$/) quantity!: string;
  @IsString() @MinLength(8) @MaxLength(150) idempotencyKey!: string;
}
export class CompleteDto {
  @IsString() @MinLength(8) @MaxLength(150) idempotencyKey!: string;
}
export class CountDto {
  @IsUUID() variantId!: string;
  @IsUUID() locationId!: string;
  @Matches(/^(0|[1-9]\d{0,13})(\.\d{1,6})?$/) countedQuantity!: string;
  @IsString() @MinLength(1) @MaxLength(500) reason!: string;
  @IsString() @MinLength(8) @MaxLength(160) idempotencyKey!: string;
}
export class PolicyDto {
  @IsUUID() variantId!: string;
  @IsBoolean() allowNegative!: boolean;
  @IsIn(['FIFO']) costMethod!: (typeof costMethods)[number];
  @Matches(/^(0|[1-9]\d{0,13})(\.\d{1,6})?$/) @IsOptional() standardUnitCost?: string;
}
