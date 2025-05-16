import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class TwoFactorAuthDto {
  @ApiProperty({
    type: String,
    description: 'Six-digit TOTP code from authenticator app',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{6}$/, {
    message: 'otpCode must be a 6-digit number',
  })
  otpCode: string;
}

export class ValidateTwoFactorAuthDto extends TwoFactorAuthDto {
  @ApiProperty({
    type: String,
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
