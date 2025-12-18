import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  // Block bots / crawlers from app-only routes
  const isBot = /bot|crawler|spider|crawling/i.test(ua);

  if (isBot && url.pathname.startsWith("/mobile")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/mobile/:path*"],
};
