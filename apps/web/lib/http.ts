import 'server-only';
import { AppError } from '@easyrender/core';
import { NextResponse } from 'next/server';

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: 'Something went wrong', code: 'internal' }, { status: 500 });
}

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    return errorResponse(error);
  }
}
