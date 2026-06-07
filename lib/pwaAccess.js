export const ACCESS_COOKIE_NAME = 'tvc_pwa_access';
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const ACCESS_COOKIE_VERSION = 'v1';
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

function getAccessSecret() {
  const secret =
    process.env.PWA_ACCESS_SECRET ||
    process.env.APP_ACCESS_SECRET ||
    process.env.REVALIDATION_SECRET;

  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') {
    return 'development-only-pwa-access-secret';
  }
  return null;
}

function base64UrlEncode(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function createAccessToken(now = Date.now()) {
  const secret = getAccessSecret();
  if (!secret) return null;

  const payload = `${ACCESS_COOKIE_VERSION}.${now}`;
  const signature = await sign(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyAccessToken(token, now = Date.now()) {
  if (!token || typeof token !== 'string') return false;

  const secret = getAccessSecret();
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [version, issuedAtValue, signature] = parts;
  if (version !== ACCESS_COOKIE_VERSION) return false;

  const issuedAt = Number(issuedAtValue);
  if (!Number.isFinite(issuedAt)) return false;
  if (issuedAt > now + MAX_CLOCK_SKEW_MS) return false;
  if (now - issuedAt > ACCESS_COOKIE_MAX_AGE * 1000) return false;

  const expected = await sign(`${version}.${issuedAtValue}`, secret);
  return safeEqual(signature, expected);
}
