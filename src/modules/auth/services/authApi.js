'use client';

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível concluir a ação.');
  }

  return data;
}

export function login(payload) {
  return requestJson('/api/v2/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(payload) {
  return requestJson('/api/v2/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMe() {
  return requestJson('/api/v2/auth/me');
}

export function logout() {
  return requestJson('/api/v2/auth/logout', { method: 'POST' });
}

export function getLists() {
  return requestJson('/api/v2/lists');
}
