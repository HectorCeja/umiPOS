import { barcodeTypes, productTypes } from '@nexo/product';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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
export class ProductPathDto {
  @IsUUID() organizationId!: string;
  @IsUUID() @IsOptional() productId?: string;
}
export class ProductItemPathDto {
  @IsUUID() organizationId!: string;
  @IsUUID() productId!: string;
}
export class ProductMediaPathDto extends ProductItemPathDto {
  @IsUUID() mediaId!: string;
}
export class CreateProductDto {
  @IsString() @MinLength(1) @MaxLength(200) @Matches(/\S/u) name!: string;
  @IsIn(productTypes) type!: (typeof productTypes)[number];
  @IsString() @MaxLength(100) @IsOptional() sku?: string;
  @IsString() @MaxLength(100) @IsOptional() shortName?: string;
  @IsString() @MaxLength(10000) @IsOptional() description?: string;
  @IsString() @MaxLength(16) @IsOptional() unitCode?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() searchTerms?: string[];
  @IsUUID() @IsOptional() categoryId?: string;
  @IsString() @MaxLength(40) @IsOptional() iconKey?: string;
}
export class UpdateProductDto {
  @IsString() @MinLength(1) @MaxLength(200) @Matches(/\S/u) @IsOptional() name?: string;
  @IsIn(productTypes) @IsOptional() type?: (typeof productTypes)[number];
  @IsString() @MaxLength(100) @IsOptional() shortName?: string;
  @IsString() @MaxLength(10000) @IsOptional() description?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() searchTerms?: string[];
  @IsString() @MaxLength(100) @IsOptional() sku?: string;
  @IsUUID() @IsOptional() categoryId?: string;
  @IsString() @MaxLength(80) @IsOptional() iconKey?: string;
  @Type(() => Number) @IsInt() @Min(1) version!: number;
}
export class VersionDto {
  @Type(() => Number) @IsInt() @Min(1) version!: number;
}
export class VariantDto {
  @IsString() @MinLength(1) @MaxLength(200) @Matches(/\S/u) name!: string;
  @IsString() @MaxLength(100) @IsOptional() sku?: string;
  @IsObject() optionValues!: Record<string, string>;
}
export class CategoryDto {
  @IsString() @MinLength(1) @MaxLength(160) @Matches(/\S/u) name!: string;
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug!: string;
  @IsUUID() @IsOptional() parentId?: string;
  @Type(() => Number) @IsInt() @Min(0) @Max(1000000) @IsOptional() sortOrder?: number;
}
export class BarcodeDto {
  @IsIn(barcodeTypes) type!: (typeof barcodeTypes)[number];
  @IsString() @MaxLength(256) value!: string;
  @IsUUID() @IsOptional() variantId?: string;
  @IsBoolean() @IsOptional() isPrimary?: boolean;
}
export class PriceDto {
  @IsUUID() variantId!: string;
  @IsString() amount!: string;
  @Matches(/^[A-Z]{3}$/) currency!: string;
  @IsString() @MaxLength(80) @IsOptional() taxProfileKey?: string;
  @IsString() @MaxLength(16) @IsOptional() unitCode?: string;
}
export class MediaDto {
  @IsIn(['image/jpeg', 'image/png', 'image/webp']) contentType!:
    | 'image/jpeg'
    | 'image/png'
    | 'image/webp';
  @IsString() @MinLength(1) @MaxLength(500) altText!: string;
  @Matches(/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/) fileName!: string;
  @IsUUID() @IsOptional() variantId?: string;
}
export class CompleteMediaDto {
  @IsUUID() mediaId!: string;
}
