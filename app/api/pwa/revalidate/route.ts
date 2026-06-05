import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { secret, urls, tags } = await req.json();

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (Array.isArray(tags)) {
    tags.forEach((tag: string) => revalidateTag(tag));
  }
  if (Array.isArray(urls)) {
    urls.forEach((url: string) => revalidatePath(url));
  }

  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
