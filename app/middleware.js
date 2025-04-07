import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
  const protectedRoutes = ["/mobile", "/news", "/ecopy", "/stream", "/video"];

  // Check if the requested path is in the protected routes
  if (protectedRoutes.some((path) => url.pathname.startsWith(path))) {
    // Detect if the app is installed as a PWA or in standalone mode
    const isPwaSupported =
      req.headers.get("sec-ch-ua-mobile") || req.cookies.get("pwa-installed");

    if (!isPwaSupported) {
      return NextResponse.redirect(new URL("/", req.url)); // Redirect unauthorized users
    }
  }

  return NextResponse.next();
}

// Apply middleware only to the specified routes
export const config = {
  matcher: ["/mobile/:path*", "/news/:path*", "/ecopy/:path*", "/stream/:path*", "/video/:path*"],
};
