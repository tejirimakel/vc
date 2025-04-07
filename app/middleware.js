import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
  const protectedRoutes = ["/mobile", "/video", "/ecopy", "/news", "/stream"];

  // Check if the requested path is in the protected routes
  if (protectedRoutes.some((path) => url.pathname.startsWith(path))) {
    // Check if the app is running in standalone mode (PWA mode) or in a browser
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isMobile = req.headers.get("sec-ch-ua-mobile");

    // If not in standalone mode (i.e., it's a web browser), redirect to the home page
    if (!isStandalone) {
      return NextResponse.redirect(new URL("/", req.url)); // Redirect to homepage if accessed via browser
    }
  }

  return NextResponse.next();
}

// Apply middleware to the protected routes
export const config = {
  matcher: ["/mobile/:path*", "/video/:path*", "/ecopy/:path*", "/news/:path*", "/stream/:path*"],
};
