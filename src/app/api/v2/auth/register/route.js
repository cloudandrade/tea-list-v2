import { NextResponse } from 'next/server';
import { registerUser } from '@/backend/modules/auth/application/register-user';
import { setSessionCookie } from '@/backend/modules/auth/application/session';
import { badRequest, conflict, json } from '@/backend/shared/http/responses';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest('Corpo da requisição inválido.');
  }

  const result = await registerUser(body);

  if (!result.ok) {
    return result.status === 409 ? conflict(result.message) : badRequest(result.message);
  }

  const response = NextResponse.json({ user: result.user, lists: result.lists }, { status: 201 });
  setSessionCookie(response, result.token);
  return response;
}

export function GET() {
  return json({ message: 'Use POST para criar uma conta.' }, { status: 405 });
}
