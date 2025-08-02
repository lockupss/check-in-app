import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
//commit1: Middleware to protect the admin dashboard and ensure only authenticated users can access it

export default withAuth(
  function middleware(request) {
    // Admin path protection
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const token = request.nextauth?.token;
      
      // Debug logging
      console.log(`[Middleware] Path: ${request.nextUrl.pathname}`);
      console.log(`[Middleware] Role: ${token?.role}`);
      
      // 1. Handle unauthenticated users
      if (!token) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      // 2. Handle non-admin users with consistent uppercase check
      if (token.role?.toUpperCase() !== "ADMIN") {
        console.log(`[Middleware] Unauthorized access attempt by ${token.email}`);
        const unauthorizedUrl = new URL("/auth/unauthorized", request.url);
        unauthorizedUrl.searchParams.set("from", request.nextUrl.pathname);
        return NextResponse.rewrite(unauthorizedUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
      error: "/auth/error"
    }
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};