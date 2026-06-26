import { getCurrentUser } from '@/backend/modules/auth/application/get-current-user';
import { createGiftList } from '@/backend/modules/gift-lists/application/create-gift-list';
import { listUserGiftLists } from '@/backend/modules/gift-lists/application/list-user-gift-lists';
import { badRequest, json, unauthorized } from '@/backend/shared/http/responses';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const lists = await listUserGiftLists(user.id);
  return json({ lists });
}

export async function POST(request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest('Corpo da requisição inválido.');
  }

  const result = await createGiftList(user.id, body);

  if (!result.ok) {
    return badRequest(result.message);
  }

  return json({ list: result.list }, { status: 201 });
}
