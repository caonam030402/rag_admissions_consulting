"use server";

import { ENameCookie, ENameLocalS, PATH } from "@/constants/common";
import { authService } from "@/services/auth";
import type { IAuthCredentials } from "@/types/auth";
import { clearCookies } from "@/utils/serverStorage";

import { signIn, signOut as _signOut, auth } from "./auth";
import { ERole } from "@/enums/auth";

export async function signInWithOAuth({
  provider,
}: {
  provider: "google" | "facebook";
}) {
  await signIn(provider, { redirectTo: "/" });
}

export async function authCredential<T>(body: IAuthCredentials & T) {
  try {
    return await signIn("credentials", body);
  } catch (error: any) {
    return {
      error: error.cause?.err?.message || error.cause,
    };
  }
}

export async function signOut() {
  await authService.logout();
  const session = await auth();
  const path =
    session?.user?.role.id === ERole.ADMIN ? PATH.LOGIN_ADMIN : PATH.LOGIN_USER;
  clearCookies({ key: ENameCookie.ACCESS_TOKEN });
  await _signOut({ redirectTo: path });
}
