import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body: { secret?: string; urls?: unknown; tags?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { secret, urls, tags } = body;

  const envSecret = process.env.REVALIDATION_SECRET;
  if (!envSecret || !secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Timing-safe comparison to prevent secret enumeration
  const secretBuf = Buffer.from(secret as string);
  const envBuf = Buffer.from(envSecret);
  if (
    secretBuf.length !== envBuf.length ||
    !require('crypto').timingSafeEqual(secretBuf, envBuf)
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (Array.isArray(tags)) {
    (tags as string[]).forEach((tag) => revalidateTag(tag));
  }
  if (Array.isArray(urls)) {
    (urls as string[]).forEach((url) => revalidatePath(url));
  }

  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
