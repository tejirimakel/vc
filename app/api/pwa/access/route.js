import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE_MAX_AGE,
  ACCESS_COOKIE_NAME,
  createAccessToken,
} from '@/lib/pwaAccess';

const ALLOWED_LAUNCH_INTENTS = new Set(['standalone', 'install-accepted']);

function getAllowedOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return null;

  const requestOrigin = new URL(req.url).origin;
  if (origin === requestOrigin || origin === 'null') return origin;

  return false;
}

function applyCors(req, response) {
  const allowedOrigin = getAllowedOrigin(req);
  if (!allowedOrigin) return response;

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Headers', 'content-type, x-tvc-pwa-launch');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Max-Age', '600');
  response.headers.append('Vary', 'Origin');

  return response;
}

export async function OPTIONS(req) {
  if (getAllowedOrigin(req) === false) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return applyCors(req, new NextResponse(null, { status: 204 }));
}

export async function POST(req) {
  const launchIntent = req.headers.get('x-tvc-pwa-launch');

  if (getAllowedOrigin(req) === false || !ALLOWED_LAUNCH_INTENTS.has(launchIntent)) {
    return applyCors(req, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
  }

  const token = await createAccessToken();

  if (!token) {
    return applyCors(
      req,
      NextResponse.json(
        { error: 'PWA access secret is not configured' },
        { status: 503 }
      )
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

  return applyCors(req, response);
}
