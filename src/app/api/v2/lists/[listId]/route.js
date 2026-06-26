import { getCurrentUser } from '@/backend/modules/auth/application/get-current-user';
import { getUserGiftList } from '@/backend/modules/gift-lists/application/get-user-gift-list';
import { updateGiftList } from '@/backend/modules/gift-lists/application/update-gift-list';
import { badRequest, json, unauthorized } from '@/backend/shared/http/responses';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const { listId } = await params;
  const result = await getUserGiftList({ listId, userId: user.id });

  if (!result.ok) {
    return json({ error: result.message }, { status: result.status });
  }

  return json({ list: result.list, items: result.items });
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest('Corpo da requisição inválido.');
  }

  const { listId } = await params;
  const result = await updateGiftList({ listId, userId: user.id, input: body });

  if (!result.ok) {
    return json({ error: result.message }, { status: result.status });
  }

  return json({ list: result.list });
}
