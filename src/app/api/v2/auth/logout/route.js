import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/backend/modules/auth/application/session';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
