import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UsersService } from '../users/users.service';
import { User } from '../users/domain/user';

@Injectable()
export class TwoFactorAuthService {
  constructor(private readonly usersService: UsersService) {}

  async generateTwoFactorSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email || `user-${user.id}`,
      'Your App Name',
      secret,
    );

    await this.usersService.update(user.id, {
      twoFactorSecret: secret,
    });

    return {
      secret,
      otpauthUrl,
    };
  }

  async generateQrCodeDataURL(otpauthUrl: string) {
    return await toDataURL(otpauthUrl);
  }

  async enableTwoFactorAuth(userId: number, otpCode: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.twoFactorSecret) {
      return false;
    }

    const isCodeValid = this.verifyTwoFactorAuthCode(
      otpCode,
      user.twoFactorSecret,
    );

    if (!isCodeValid) {
      return false;
    }

    await this.usersService.update(userId, {
      isTwoFactorEnabled: true,
    });

    return true;
  }

  async disableTwoFactorAuth(userId: number) {
    await this.usersService.update(userId, {
      isTwoFactorEnabled: false,
      twoFactorSecret: null,
    });

    return true;
  }

  verifyTwoFactorAuthCode(otpCode: string, secret: string) {
    return authenticator.verify({
      token: otpCode,
      secret,
    });
  }
}
