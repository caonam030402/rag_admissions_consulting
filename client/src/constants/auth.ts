import { authService } from "@/services/auth";

export enum ETriggerCredentials {
  LOGIN_ADMIN = "login_admin",
  LOGIN_USER = "login_user",
  OTP = "otp",
}

export const listCredential = (
  credentials: Partial<Record<string, unknown>>
) => {
  const list = {
    [ETriggerCredentials.OTP]: authService.confirmOtp({
      user: {
        id: Number(credentials.userId),
      },
      code: Number(credentials.code),
    }),
    [ETriggerCredentials.LOGIN_ADMIN]: authService.loginWithEmail({
      email: credentials.email as string,
      password: credentials.password as string,
      otpCode: credentials.otpCode as string | undefined,
    }),
    [ETriggerCredentials.LOGIN_USER]: authService.loginWithEmail({
      email: credentials.email as string,
      password: credentials.password as string,
    }),
  };
  return list[credentials.trigger as ETriggerCredentials];
};
