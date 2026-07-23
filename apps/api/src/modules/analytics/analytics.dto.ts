import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, Matches, Max, Min } from 'class-validator';

export class AnalyticsPathDto {
  @IsUUID() organizationId!: string;
}

export class AnalyticsQueryDto {
  @IsUUID() @IsOptional() branchId?: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsOptional() from?: string;
  @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsOptional() to?: string;
  @IsString() @Matches(/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)*$/) @IsOptional() timezone = 'UTC';
  @IsIn(['hour', 'day', 'week', 'month']) @IsOptional() interval = 'day';
  @Type(() => Number) @Min(1) @Max(100) @IsOptional() limit = 20;
}
