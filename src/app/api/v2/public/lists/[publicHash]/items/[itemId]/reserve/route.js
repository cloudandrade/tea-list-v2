import { reservePublicItem } from '@/backend/modules/gift-items/application/reserve-public-item';
import { badRequest, json } from '@/backend/shared/http/responses';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return badRequest('Corpo da requisição inválido.');
  }

  const { publicHash, itemId } = await params;
  const result = await reservePublicItem({ publicHash, itemId, input: body });

  if (!result.ok) {
    return json({ error: result.message }, { status: result.status });
  }

  return json({ item: result.item, counters: result.counters });
}
