import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length, MaxLength, ValidateNested } from 'class-validator';

export class OrganizationIdDto {
  @IsUUID()
  organizationId!: string;
}

export class AuthorizationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class EvaluationResourceDto {
  @IsString()
  @Length(1, 80)
  type!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;
}

export class PermissionEvaluationDto {
  @IsString()
  @Length(3, 100)
  permission!: string;

  @ValidateNested()
  @Type(() => EvaluationResourceDto)
  resource!: EvaluationResourceDto;
}
