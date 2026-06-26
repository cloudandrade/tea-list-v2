import { getCurrentUser } from '@/backend/modules/auth/application/get-current-user';
import { deleteListItem } from '@/backend/modules/gift-items/application/delete-list-item';
import { updateListItem } from '@/backend/modules/gift-items/application/update-list-item';
import { badRequest, json, unauthorized } from '@/backend/shared/http/responses';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest('Corpo da requisição inválido.');
  }

  const { listId, itemId } = await params;
  const result = await updateListItem({ listId, itemId, userId: user.id, input: body });

  if (!result.ok) {
    return json({ error: result.message }, { status: result.status });
  }

  return json({ item: result.item, counters: result.counters });
}

export async function DELETE(_request, { params }) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const { listId, itemId } = await params;
  const result = await deleteListItem({ listId, itemId, userId: user.id });

  if (!result.ok) {
    return json({ error: result.message }, { status: result.status });
  }

  return json({ ok: true, counters: result.counters });
}
