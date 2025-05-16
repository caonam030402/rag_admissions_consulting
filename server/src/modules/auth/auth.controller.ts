import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  Delete,
  SerializeOptions,
  Res,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  AuthRegisterLoginDto,
  RegisterResponseDto,
} from './dto/auth-register-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { NullableType } from '../../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { ConfirmOtpDto } from '../otps/dto/confirm-otp';
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
import { TwoFactorAuthService } from './two-factor-auth.service';
import {
  TwoFactorAuthDto,
  ValidateTwoFactorAuthDto,
} from './dto/two-factor-auth.dto';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }

  @Post('email/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: RegisterResponseDto,
    description: 'User registration successful, returns 2FA setup information',
  })
  async register(
    @Body() createUserDto: AuthRegisterLoginDto,
  ): Promise<RegisterResponseDto> {
    return this.service.register(createUserDto);
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.service.confirmEmail(confirmEmailDto.hash);
  }

  @Post('email/confirm/otp')
  @HttpCode(HttpStatus.CREATED)
  async confirmEmailOtp(
    @Body() confirmEmailOtp: ConfirmOtpDto,
    @Res({ passthrough: true }) response: ExpressResponse,
  ): Promise<LoginResponseDto> {
    return this.service.confirmEmailOtp(confirmEmailOtp, response);
  }

  @Post('email/confirm/new')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmNewEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.service.confirmNewEmail(confirmEmailDto.hash);
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: User,
  })
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<User>> {
    return this.service.me(request.user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<RefreshResponseDto> {
    return this.service.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    console.log(12312312);
    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
  })
  public update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    return this.service.update(request.user, userDto);
  }

  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request): Promise<void> {
    return this.service.softDelete(request.user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate 2FA secret',
    description: 'Generate a secret key for two-factor authentication',
  })
  async generateTwoFactorAuthSecret(@Request() request: RequestWithUser) {
    const { otpauthUrl, secret } =
      await this.twoFactorAuthService.generateTwoFactorSecret(request.user);

    const qrCodeDataURL =
      await this.twoFactorAuthService.generateQrCodeDataURL(otpauthUrl);

    return {
      secret,
      qrCodeDataURL,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enable 2FA',
    description: 'Enable two-factor authentication for the user',
  })
  async enableTwoFactorAuth(
    @Request() request: RequestWithUser,
    @Body() twoFactorAuthDto: TwoFactorAuthDto,
  ) {
    const isEnabled = await this.twoFactorAuthService.enableTwoFactorAuth(
      request.user.id,
      twoFactorAuthDto.otpCode,
    );

    if (!isEnabled) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          otpCode: 'Mã google không hợp lệ',
        },
      });
    }

    return {
      isTwoFactorEnabled: true,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disable 2FA',
    description: 'Disable two-factor authentication for the user',
  })
  async disableTwoFactorAuth(@Request() request: RequestWithUser) {
    await this.twoFactorAuthService.disableTwoFactorAuth(request.user.id);

    return {
      isTwoFactorEnabled: false,
    };
  }

  @Post('2fa/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate 2FA code',
    description: 'Validate a two-factor authentication code during login',
  })
  async validateTwoFactorAuth(
    @Body() validateTwoFactorAuthDto: ValidateTwoFactorAuthDto,
  ) {
    return this.service.validateTwoFactorAuth(validateTwoFactorAuthDto);
  }
}
