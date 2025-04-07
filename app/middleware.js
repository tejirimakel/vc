import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
  const protectedRoutes = ["/mobile", "/news", "/ecopy", "/stream", "/video"];

  // Check if the requested path is in the protected routes
  if (protectedRoutes.some((path) => url.pathname.startsWith(path))) {
    // Check if the app is in PWA mode or if the user has installed it (via cookies or user-agent)
    const isPwaInstalled =
      req.headers.get("sec-ch-ua-mobile") || req.cookies.get("pwa-installed");

    // If not installed as PWA, redirect to home page or show a custom message
    if (!isPwaInstalled) {
      return NextResponse.redirect(new URL("/", req.url)); // Redirect to home
    }
  }

  return NextResponse.next();
}

// Apply middleware to the protected routes
export const config = {
  matcher: ["/mobile/:path*", "/news/:path*", "/ecopy/:path*", "/stream/:path*", "/video/:path*"],
};
