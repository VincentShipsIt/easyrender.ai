import { advance } from '@easyrender/core';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

// The payload is not trusted: advance() re-reads the prediction from Replicate itself.
export async function POST(request: Request) {
  const id = new URL(request.url).searchParams.get('render');
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    await advance(id);
  } catch (error) {
    console.error('replicate webhook failed', id, error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
