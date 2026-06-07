import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/pwaAccess";

const PROTECTED_PAGE_PREFIXES = ["/mobile", "/news", "/ecopy", "/video", "/stream"];
const PROTECTED_API_PREFIXES = [
  "/api/news",
  "/api/ecopy",
  "/api/pdf",
  "/api/stream",
  "/api/youtube",
];

function pathStartsWith(pathname, prefixes) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(req) {
  const url = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";
  const pathname = url.pathname;

  const isBot = /bot|crawler|spider|crawling/i.test(ua);

  if (isBot && pathname.startsWith("/mobile")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const isProtectedPage = pathStartsWith(pathname, PROTECTED_PAGE_PREFIXES);
  const isProtectedApi = pathStartsWith(pathname, PROTECTED_API_PREFIXES);

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const hasAccess = await verifyAccessToken(token);

  if (hasAccess) {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    response.cookies.delete(ACCESS_COOKIE_NAME);
    return response;
  }

  const redirectUrl = new URL("/", req.url);
  redirectUrl.searchParams.set("access", "required");
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete(ACCESS_COOKIE_NAME);
  return response;
}

export const config = {
  matcher: [
    "/mobile/:path*",
    "/news/:path*",
    "/ecopy/:path*",
    "/video/:path*",
    "/stream/:path*",
    "/api/news/:path*",
    "/api/ecopy/:path*",
    "/api/pdf/:path*",
    "/api/stream/:path*",
    "/api/youtube/:path*",
  ],
};
