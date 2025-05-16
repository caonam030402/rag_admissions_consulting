import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ValidateTwoFactorAuthDto {
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

  @ApiProperty({
    type: String,
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
