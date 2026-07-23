import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  IsObject,
  IsUrl,
  IsIn,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @Length(1, 128)
  password!: string;

  @IsBoolean()
  @IsOptional()
  rememberMe = false;

  @IsBoolean()
  @IsOptional()
  rememberDevice = false;

  @IsString()
  @Length(16, 128)
  deviceFingerprint!: string;

  @IsString()
  @Length(1, 160)
  deviceName!: string;
}

export class UpdateProfileDto {
  @IsString() @Length(1, 160) displayName!: string;
  @IsString() @Length(1, 100) givenName!: string;
  @IsString() @Length(1, 100) familyName!: string;
  @IsString() @Length(2, 35) locale!: string;
  @IsString() @Length(1, 63) timeZone!: string;
  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  @MaxLength(2048)
  avatarUrl?: string;
  @IsObject() preferences!: Record<string, unknown>;
}

export class PrepareProfileAvatarDto {
  @IsString() @IsIn(['image/png', 'image/jpeg', 'image/webp']) contentType!: string;
  @IsString() @Length(1, 180) fileName!: string;
  @IsInt() @Min(1) @Max(5_242_880) size!: number;
}

export class CompleteProfileAvatarDto {
  @IsString() @Length(20, 500) objectKey!: string;
}

export class EmailRequestDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;
}

export class PasswordResetCompleteDto {
  @IsString()
  @Length(32, 256)
  token!: string;

  @IsString()
  @Length(15, 128)
  password!: string;
}

export class TokenCompleteDto {
  @IsString()
  @Length(32, 256)
  token!: string;
}

export class SessionIdDto {
  @IsUUID()
  sessionId!: string;
}
