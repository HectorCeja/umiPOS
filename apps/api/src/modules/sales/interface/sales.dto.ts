import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsDate,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';
export class SalesTenantPath {
  @IsUUID() organizationId!: string;
}
export class SalePath extends SalesTenantPath {
  @IsUUID() saleId!: string;
}
export class PaymentAttemptPath extends SalePath {
  @IsUUID() paymentAttemptId!: string;
}
export class SalesListQuery {
  @IsUUID() @IsOptional() branchId?: string;
}
export class SalesAdminQueryDto extends SalesListQuery {
  @IsString() @MaxLength(120) @IsOptional() status?: string;
  @IsString() @MaxLength(160) @IsOptional() search?: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsOptional() businessDate?: string;
  @IsString() @MaxLength(40) @IsOptional() paymentMethod?: string;
  @Type(() => Number) @IsInt() @Min(1) @IsOptional() page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) @IsOptional() pageSize = 25;
}
export class CreateSaleDto {
  @IsUUID() branchId!: string;
  @Matches(/^[A-Z]{3}$/) currency!: string;
  @IsIn(['WEB_POS', 'FLUTTER_POS', 'UMI', 'API', 'IMPORT']) channel!:
    | 'WEB_POS'
    | 'FLUTTER_POS'
    | 'UMI'
    | 'API'
    | 'IMPORT';
  @Type(() => Date) @IsDate() businessDate!: Date;
  @IsString() @MaxLength(200) @IsOptional() externalReference?: string;
  @IsString() @MaxLength(1000) @IsOptional() notes?: string;
}
export class AddSaleItemDto {
  @IsUUID() productVariantId!: string;
  @Matches(/^(?!0(?:\.0{1,6})?$)(?:0|[1-9]\d{0,13})(?:\.\d{1,6})?$/) quantity!: string;
  @IsString() @MaxLength(500) @IsOptional() notes?: string;
}
export class PaymentDto {
  @IsIn(['CASH', 'CARD_EXTERNAL', 'BANK_TRANSFER', 'OTHER']) method!: string;
  @Matches(/^[1-9]\d*$/) amountMinor!: string;
  @Matches(/^[1-9]\d*$/) @IsOptional() tenderedMinor?: string;
  @IsString() @MaxLength(200) @IsOptional() providerReference?: string;
}
export class ReasonDto {
  @IsString() @MinLength(1) @MaxLength(500) reason!: string;
}
export class RefundLineDto {
  @IsUUID() saleItemId!: string;
  @Matches(/^(0|[1-9]\d{0,13})(\.\d{1,6})?$/) quantity!: string;
  @Matches(/^[1-9]\d*$/) amountMinor!: string;
  @IsIn(['AVAILABLE', 'DAMAGED', 'QUARANTINE', 'DISCARDED']) destination!:
    | 'AVAILABLE'
    | 'DAMAGED'
    | 'QUARANTINE'
    | 'DISCARDED';
  @IsString() @MinLength(1) @MaxLength(500) reason!: string;
}
export class RefundDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RefundLineDto)
  lines!: RefundLineDto[];
}
export class SalesPolicyDto {
  [key: string]: unknown;
  @IsBoolean() @IsOptional() allowWithoutInventory?: boolean;
  @IsBoolean() @IsOptional() allowNegativeStock?: boolean;
  @IsBoolean() @IsOptional() automaticReservation?: boolean;
  @IsInt() @Min(1) @Max(86400) @IsOptional() reservationTtlSeconds?: number;
  @IsBoolean() @IsOptional() allowDiscounts?: boolean;
  @IsInt() @Min(0) @Max(10000) @IsOptional() maximumDiscountBasisPoints?: number;
  @IsInt() @Min(0) @Max(10000) @IsOptional() requireSupervisorAboveBasisPoints?: number;
  @IsBoolean() @IsOptional() allowManualPrice?: boolean;
  @IsBoolean() @IsOptional() allowSuspendedSales?: boolean;
  @IsInt() @Min(1) @Max(604800) @IsOptional() suspendedSaleTtlSeconds?: number;
  @IsBoolean() @IsOptional() allowCancellation?: boolean;
  @IsBoolean() @IsOptional() allowRefund?: boolean;
  @Matches(/^[A-Z]{3}$/) @IsOptional() currency?: string;
  @IsIn(['HALF_UP', 'HALF_EVEN', 'DOWN']) @IsOptional() roundingMode?: string;
  @IsArray()
  @IsIn(['CASH', 'CARD_EXTERNAL', 'BANK_TRANSFER', 'OTHER'], { each: true })
  @IsOptional()
  enabledPaymentMethods?: string[];
}
