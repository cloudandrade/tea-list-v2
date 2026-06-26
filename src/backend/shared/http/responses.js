import { NextResponse } from 'next/server';

export function json(data, init = {}) {
  return NextResponse.json(data, init);
}

export function badRequest(message, details = null) {
  return json({ error: message, details }, { status: 400 });
}

export function unauthorized(message = 'Sessão inválida ou expirada.') {
  return json({ error: message }, { status: 401 });
}

export function conflict(message) {
  return json({ error: message }, { status: 409 });
}
