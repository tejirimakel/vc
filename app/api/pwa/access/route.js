import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE_MAX_AGE,
  ACCESS_COOKIE_NAME,
  createAccessToken,
} from '@/lib/pwaAccess';

const ALLOWED_LAUNCH_INTENTS = new Set(['standalone', 'install-accepted']);

function isSameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  return origin === new URL(req.url).origin;
}

export async function POST(req) {
  const launchIntent = req.headers.get('x-tvc-pwa-launch');

  if (!isSameOrigin(req) || !ALLOWED_LAUNCH_INTENTS.has(launchIntent)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await createAccessToken();

  if (!token) {
    return NextResponse.json(
      { error: 'PWA access secret is not configured' },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.headers.set('Cache-Control', 'no-store');
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  return response;
}
