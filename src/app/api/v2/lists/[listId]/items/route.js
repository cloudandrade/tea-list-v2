import { getCurrentUser } from '@/backend/modules/auth/application/get-current-user';
import { createListItem } from '@/backend/modules/gift-items/application/create-list-item';
import { listGiftItemsByList } from '@/backend/modules/gift-items/infra/gift-item.repository';
import { findGiftListByIdForUser } from '@/backend/modules/gift-lists/infra/gift-list.repository';
import { badRequest, json, unauthorized } from '@/backend/shared/http/responses';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const { listId } = await params;
  const list = await findGiftListByIdForUser(listId, user.id);

  if (!list) {
    return json({ error: 'Lista não encontrada.' }, { status: 404 });
  }

  const items = await listGiftItemsByList(listId);
  return json({ items });
}

export async function POST(request, { params }) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const { listId } = await params;
  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest('Corpo da requisição inválido.');
  }

  const result = await createListItem({ listId, userId: user.id, input: body });

  if (!result.ok) {
    return json({ error: result.message }, { status: result.status });
  }

  return json({ item: result.item, counters: result.counters }, { status: 201 });
}
