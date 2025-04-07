import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
  const protectedRoutes = ["/mobile", "/news", "/ecopy", "/stream", "/video"];

  // Detect if the request is coming from a web browser
  const userAgent = req.headers.get("user-agent") || "";
  const isBrowser = /Chrome|Safari|Firefox|Edge|Opera|MSIE|Trident/.test(userAgent);

  if (protectedRoutes.some((path) => url.pathname.startsWith(path)) && isBrowser) {
    return NextResponse.redirect(new URL("/", req.url)); // Redirect unauthorized access
  }

  return NextResponse.next();
}

// Apply middleware only to the specified routes
export const config = {
  matcher: ["/mobile/:path*", "/news/:path*", "/ecopy/:path*", "/stream/:path*", "/video/:path*"],
};
