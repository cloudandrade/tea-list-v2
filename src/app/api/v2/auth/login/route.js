import { NextResponse } from 'next/server';
import { loginUser } from '@/backend/modules/auth/application/login-user';
import { setSessionCookie } from '@/backend/modules/auth/application/session';
import { badRequest, json, unauthorized } from '@/backend/shared/http/responses';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest('Corpo da requisição inválido.');
  }

  const result = await loginUser(body);

  if (!result.ok) {
    return result.status === 401 ? unauthorized(result.message) : badRequest(result.message);
  }

  const response = NextResponse.json({ user: result.user });
  setSessionCookie(response, result.token);
  return response;
}

export function GET() {
  return json({ message: 'Use POST para entrar.' }, { status: 405 });
}
