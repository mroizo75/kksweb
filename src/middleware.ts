import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
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

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check authentication for admin and min-side routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/min-side")) {
    const session = await auth();

    if (!session) {
      const loginUrl = pathname.startsWith("/admin")
        ? "/admin/login"
        : "/min-side/logg-inn";
      
      return NextResponse.redirect(
        new URL(`${loginUrl}?callbackUrl=${encodeURIComponent(pathname)}`, request.url)
      );
    }

    // For admin routes, check if user is admin
    if (pathname.startsWith("/admin")) {
      // Admin check happens in the admin layout
      return NextResponse.next();
    }

    // For min-side routes, check license status
    if (pathname.startsWith("/min-side") && !pathname.startsWith("/min-side/logg-inn")) {
      // License check will be done via API call from the page
      // We can't do database queries in middleware in Next.js 15
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
