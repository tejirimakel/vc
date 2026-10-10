// Canonical lists of route prefixes gated behind the PWA-access cookie.
// `middleware.js` imports these directly. `public/sw.js` keeps a hand-mirrored
// copy (it runs in a separate bundle and cannot import) — keep the two in sync.
export const PROTECTED_PAGE_PREFIXES = ['/mobile', '/news', '/ecopy', '/video', '/stream'];

export const PROTECTED_API_PREFIXES = [
  '/api/news',
  '/api/ecopy',
  '/api/pdf',
  '/api/stream',
  '/api/youtube',
];

export function pathStartsWith(pathname, prefixes) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
