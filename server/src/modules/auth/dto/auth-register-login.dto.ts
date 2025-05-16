import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../../utils/transformers/lower-case.transformer';
import { VerifiedEnum } from '../../statuses/statuses.enum';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class RegisterResponseDto {
  @ApiProperty()
  userId: number;

  @ApiProperty({ enum: VerifiedEnum })
  isVerified: VerifiedEnum;

  @ApiProperty({ description: 'Two-factor authentication secret' })
  twoFactorSecret: string;

  @ApiProperty({
    description: 'QR code data URL for authenticator app scanning',
  })
  qrCodeDataURL: string;
}
