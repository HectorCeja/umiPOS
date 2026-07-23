import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
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

export class PasswordResetRequestDto {
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

export class VerifyEmailDto {
  @IsString()
  @Length(32, 256)
  token!: string;
}

export class SessionIdDto {
  @IsUUID()
  sessionId!: string;
}

export class DeviceIdDto {
  @IsUUID()
  deviceId!: string;
}
