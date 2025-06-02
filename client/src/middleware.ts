import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";

import authConfig from "./configs/auth/config";
import { AppConfig } from "./configs/main/appConfig";
import { PATH, PUBLIC_PAGES } from "./constants/common";
import { EVerified } from "./enums/auth";
import { RoleHelper } from "./utils/roleHelper";

const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const { auth } = NextAuth(authConfig);

const authHandler = auth((req) => {
  const publicPathnameRegex = RegExp(
    `^(/(${AppConfig.locales.join("|")}))?(${PUBLIC_PAGES.flatMap((p) =>
      p === "/" ? ["", "/"] : `${p}(/.*)?`,
    ).join("|")})/?$`,
    "i",
  );

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);
  const isAuthenticated = !!req.auth;
  const isVerified = req.auth?.user?.isVerified === EVerified.VERIFIED;
  const userRole = req.auth?.user?.role;

  // Check current path context
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  const isOnAdminLogin = req.nextUrl.pathname === PATH.LOGIN_ADMIN;
  const isOnUserLogin = req.nextUrl.pathname === PATH.LOGIN_USER;
  const isOnAnyLogin = isOnAdminLogin || isOnUserLogin;

  // 1. Handle unauthenticated users trying to access protected areas
  if (!isAuthenticated && !isPublicPage) {
    return Response.redirect(
      new URL(RoleHelper.getLoginPath(isAdminPath), req.nextUrl.origin),
    );
  }

  // 2. Handle authenticated users on login pages - redirect to appropriate dashboard
  if (isAuthenticated && isOnAnyLogin) {
    return Response.redirect(
      new URL(RoleHelper.getDefaultPath(userRole), req.nextUrl.origin),
    );
  }

  // 3. Handle unverified users - redirect to verification except for allowed pages
  if (
    isAuthenticated &&
    !isVerified &&
    !isPublicPage &&
    req.nextUrl.pathname !== PATH.VERIFY &&
    !isOnAnyLogin &&
    req.nextUrl.pathname !== PATH.REGISTER_USER
  ) {
    return Response.redirect(new URL(PATH.VERIFY, req.nextUrl.origin));
  }

  // 4. Role-based access control - prevent unauthorized access
  if (isAuthenticated && isVerified) {
    // Prevent admin from accessing user-only chatbot page (redirect to admin dashboard)
    if (RoleHelper.isAdmin(userRole) && req.nextUrl.pathname === PATH.CHATBOT) {
      return Response.redirect(new URL(PATH.OVERVIEW, req.nextUrl.origin));
    }

    // Prevent regular users from accessing admin areas
    if (!RoleHelper.isAdmin(userRole) && isAdminPath) {
      return Response.redirect(new URL(PATH.CHATBOT, req.nextUrl.origin));
    }
  }

  return intlMiddleware(req);
});

export default auth(async function middleware(req: NextRequest) {
  return (authHandler as any)(req);
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
