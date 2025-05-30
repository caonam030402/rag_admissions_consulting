import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";

import authConfig from "./configs/auth/config";
import { AppConfig } from "./configs/main/appConfig";
import { PATH, PUBLIC_PAGES } from "./constants/common";
import { EVerified } from "./enums/auth";

const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const { auth } = NextAuth(authConfig);

const authHandler = auth((req) => {
  const publicPathnameRegex = RegExp(
    `^(/(${AppConfig.locales.join("|")}))?(${PUBLIC_PAGES.flatMap((p) =>
      p === "/" ? ["", "/"] : `${p}(/.*)?`
    ).join("|")})/?$`,
    "i"
  );

  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);
  const isAuthenticated = !!req.auth;
  const isVerified = req.auth?.user?.isVerified === EVerified.VERIFIED;
  const userRole = req.auth?.user?.role;

  // Check if current path is admin or user area
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  const isUserPath = !isAdminPath && !isPublicPage;

  // Check if user is on login pages
  const isOnAdminLogin = req.nextUrl.pathname === PATH.LOGIN_ADMIN;
  const isOnUserLogin = req.nextUrl.pathname === PATH.LOGIN_USER;
  const isOnAnyLogin = isOnAdminLogin || isOnUserLogin;

  // If not authenticated and trying to access protected areas
  if (!isAuthenticated && !isPublicPage) {
    // Redirect to appropriate login based on the path being accessed
    if (isAdminPath) {
      return Response.redirect(new URL(PATH.LOGIN_ADMIN, req.nextUrl.origin));
    } else {
      return Response.redirect(new URL(PATH.LOGIN_USER, req.nextUrl.origin));
    }
  }

  // If authenticated but on wrong login page, redirect based on role
  if (isAuthenticated && isOnAnyLogin) {
    // Check user role and redirect appropriately
    if (userRole?.name === "Admin" || userRole?.id === 1) {
      return Response.redirect(new URL(PATH.OVERVIEW, req.nextUrl.origin));
    } else {
      // Redirect regular users to their default page (you can change this)
      return Response.redirect(new URL(PATH.CHATBOT, req.nextUrl.origin));
    }
  }

  // If authenticated but not verified, redirect to verify page (except for public pages and auth pages)
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

  // Role-based access control
  if (isAuthenticated && isVerified) {
    const isAdmin = userRole?.name === "Admin" || userRole?.id === 1;

    // If admin tries to access user-only areas, redirect to admin area
    if (isAdmin && isUserPath && req.nextUrl.pathname === PATH.CHATBOT) {
      return Response.redirect(new URL(PATH.OVERVIEW, req.nextUrl.origin));
    }

    // If regular user tries to access admin areas, redirect to user area
    if (!isAdmin && isAdminPath) {
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
