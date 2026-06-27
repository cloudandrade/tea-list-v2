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

export function createList(payload) {
  return requestJson('/api/v2/lists', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getList(listId) {
  return requestJson(`/api/v2/lists/${listId}`);
}

export function updateList(listId, payload) {
  return requestJson(`/api/v2/lists/${listId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteList(listId) {
  return requestJson(`/api/v2/lists/${listId}`, {
    method: 'DELETE',
  });
}

export function createListItem(listId, payload) {
  return requestJson(`/api/v2/lists/${listId}/items`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateListItem(listId, itemId, payload) {
  return requestJson(`/api/v2/lists/${listId}/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteListItem(listId, itemId) {
  return requestJson(`/api/v2/lists/${listId}/items/${itemId}`, {
    method: 'DELETE',
  });
}

export function getPublicList(publicHash) {
  return requestJson(`/api/v2/public/lists/${publicHash}`);
}

export function reservePublicItem(publicHash, itemId, payload) {
  return requestJson(`/api/v2/public/lists/${publicHash}/items/${itemId}/reserve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
