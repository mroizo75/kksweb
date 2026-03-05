import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = [
  "/",
  "/kurs",
  "/bht-medlem",
  "/klage",
  "/verify",
  "/min-side/logg-inn",
  "/admin/login",
  "/api/auth",
  "/api/public",
  "/api/webhooks",
  "/_next",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/min-side")) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    if (!token) {
      const loginUrl = pathname.startsWith("/admin")
        ? "/admin/login"
        : "/min-side/logg-inn";

      return NextResponse.redirect(
        new URL(`${loginUrl}?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
