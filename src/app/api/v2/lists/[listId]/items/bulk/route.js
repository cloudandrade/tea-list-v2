import { getCurrentUser } from '@/backend/modules/auth/application/get-current-user';
import { bulkUpdateListItems } from '@/backend/modules/gift-items/application/bulk-update-list-items';
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

  const { listId } = await params;
  const result = await bulkUpdateListItems({ listId, userId: user.id, input: body });

  if (!result.ok) {
    return json({ error: result.message }, { status: result.status });
  }

  return json({
    updatedCount: result.updatedCount,
    items: result.items,
    counters: result.counters,
  });
}
