import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
  const protectedRoutes = ["/mobile", "/news", "/ecopy", "/stream", "/video"];

  // Check if the requested path is in the protected routes
  if (protectedRoutes.some((path) => url.pathname.startsWith(path))) {
    // Check if the app is in PWA mode (installed and standalone)
    const isStandalone = req.headers.get("sec-ch-ua-mobile") || req.cookies.get("pwa-installed");

    // If the app is in standalone mode, allow access to the mobile interface
    if (isStandalone) {
      return NextResponse.redirect(new URL("/mobile", req.url)); // Redirect to /mobile in PWA mode
    } else {
      // If the app is not in standalone mode, redirect to homepage to install the app
      return NextResponse.redirect(new URL("/", req.url)); // Redirect to home to install the app
    }
  }

  return NextResponse.next();
}

// Apply middleware to the protected routes
export const config = {
  matcher: ["/mobile/:path*", "/news/:path*", "/ecopy/:path*", "/stream/:path*", "/video/:path*"],
};
