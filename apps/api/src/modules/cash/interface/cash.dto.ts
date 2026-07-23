import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO4217CurrencyCode,
  IsISO8601,
  IsOptional,
  IsObject,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
export class CashTenantPath {
  @IsUUID() organizationId!: string;
}
export class CashSessionPath extends CashTenantPath {
  @IsUUID() sessionId!: string;
}
export class RegisterDto {
  @IsUUID() branchId!: string;
  @IsString() name!: string;
  @IsString() code!: string;
  @IsISO4217CurrencyCode() currency!: string;
  @IsOptional() @Matches(/^\d+$/) openingFloatMinor?: string;
}
export class UpdateRegisterDto {
  @IsString() name!: string;
  @IsIn(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ARCHIVED']) status!: string;
  @IsInt() @Min(1) version!: number;
}
export class DrawerDto {
  @IsUUID() branchId!: string;
  @IsString() name!: string;
  @IsString() code!: string;
  @IsOptional() @IsUUID() registerId?: string;
}
export class UpdateDrawerDto {
  @IsString() name!: string;
  @IsIn(['AVAILABLE', 'ASSIGNED', 'IN_USE', 'OUT_OF_SERVICE', 'ARCHIVED']) status!: string;
  @IsOptional() @IsUUID() registerId?: string;
  @IsInt() @Min(1) version!: number;
}
export class OpenSessionDto {
  @IsUUID() branchId!: string;
  @IsUUID() registerId!: string;
  @IsOptional() @IsUUID() drawerId?: string;
  @IsISO4217CurrencyCode() currency!: string;
  @IsISO8601({ strict: true }) businessDate!: string;
  @Matches(/^\d+$/) openingFloatMinor!: string;
  @IsString() idempotencyKey!: string;
  @IsUUID() correlationId!: string;
}
export class MovementDto {
  @IsIn(['CASH_IN', 'CASH_OUT', 'PAID_OUT', 'CHANGE_IN', 'CHANGE_OUT', 'WITHDRAWAL', 'DEPOSIT'])
  type!: string;
  @Matches(/^[1-9]\d*$/) amountMinor!: string;
  @IsISO4217CurrencyCode() currency!: string;
  @IsString() reason!: string;
  @IsOptional() @IsString() reference?: string;
  @IsString() idempotencyKey!: string;
  @IsUUID() correlationId!: string;
}
export class DenominationDto {
  @Matches(/^[1-9]\d*$/) denominationMinor!: string;
  @IsInt() @Min(0) quantity!: number;
}
export class CountDto {
  @IsISO4217CurrencyCode() currency!: string;
  @IsOptional() @Matches(/^\d+$/) totalMinor?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DenominationDto)
  denominations?: DenominationDto[];
  @IsString() idempotencyKey!: string;
}
export class IdempotencyDto {
  @IsString() idempotencyKey!: string;
}
export class CloseDto extends IdempotencyDto {
  @IsInt() @Min(1) version!: number;
  @IsOptional() @IsBoolean() force?: boolean;
  @IsOptional() @IsString() reason?: string;
}
export class TransitionSessionDto extends IdempotencyDto {
  @IsInt() @Min(1) version!: number;
  @IsString() reason!: string;
}
export class PolicyDto extends IdempotencyDto {
  @IsOptional() @IsUUID() branchId?: string;
  @IsOptional() @IsUUID() registerId?: string;
  @IsObject() configuration!: Record<string, unknown>;
}
export class ApprovalRequestDto extends IdempotencyDto {
  @IsUUID() branchId!: string;
  @IsString() actionType!: string;
  @IsUUID() resourceId!: string;
  @IsString() requiredPermission!: string;
  @IsOptional() @Matches(/^\d+$/) thresholdMinor?: string;
  @IsString() reason!: string;
  @IsISO8601() expiresAt!: string;
  @IsUUID() correlationId!: string;
}
export class ApprovalDecisionDto extends IdempotencyDto {
  @IsIn(['APPROVED', 'REJECTED', 'CANCELLED']) decision!: 'APPROVED' | 'REJECTED' | 'CANCELLED';
  @IsString() reason!: string;
  @IsInt() @Min(1) version!: number;
}
export class DepositDto extends IdempotencyDto {
  @Matches(/^[1-9]\d*$/) amountMinor!: string;
  @IsISO4217CurrencyCode() currency!: string;
  @IsString() destination!: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() bagReference?: string;
  @IsString() reason!: string;
  @IsOptional() @IsUUID() approvalId?: string;
  @IsUUID() correlationId!: string;
}
export class DepositTransitionDto extends IdempotencyDto {
  @IsIn(['HANDED_OVER', 'CONFIRMED_MANUALLY', 'CANCELLED']) status!:
    | 'HANDED_OVER'
    | 'CONFIRMED_MANUALLY'
    | 'CANCELLED';
  @IsString() reason!: string;
}
export class TransferDto extends IdempotencyDto {
  @IsUUID() sourceSessionId!: string;
  @IsUUID() destinationSessionId!: string;
  @Matches(/^[1-9]\d*$/) amountMinor!: string;
  @IsISO4217CurrencyCode() currency!: string;
  @IsString() reason!: string;
  @IsOptional() @IsUUID() approvalId?: string;
  @IsUUID() correlationId!: string;
}
export class ReopenDto extends IdempotencyDto {
  @IsInt() @Min(1) version!: number;
  @IsString() reason!: string;
  @IsUUID() approvalId!: string;
  @IsUUID() correlationId!: string;
}
export class InitiateHandoffDto extends IdempotencyDto {
  @IsUUID() incomingCashierId!: string;
  @IsString() reason!: string;
  @IsOptional() @IsString() notes?: string;
  @IsISO8601() expiresAt!: string;
  @IsUUID() correlationId!: string;
}
export class CountHandoffDto extends IdempotencyDto {
  @IsOptional() @Matches(/^\d+$/) totalMinor?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DenominationDto)
  denominations?: DenominationDto[];
  @IsInt() @Min(1) version!: number;
}
export class DecideHandoffDto extends IdempotencyDto {
  @IsIn(['ACCEPTED', 'REJECTED', 'CANCELLED']) decision!: 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  @IsString() reason!: string;
  @IsInt() @Min(1) version!: number;
}
export class CompleteHandoffDto extends IdempotencyDto {
  @IsOptional() @IsUUID() approvalId?: string;
  @IsInt() @Min(1) version!: number;
}
