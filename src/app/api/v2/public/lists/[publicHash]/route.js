import { getPublicGiftList } from '@/backend/modules/gift-lists/application/get-public-gift-list';
import { json } from '@/backend/shared/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const { publicHash } = await params;
  const result = await getPublicGiftList(publicHash);

  if (!result.ok) {
    return json({ error: result.message }, { status: result.status });
  }

  return json({ list: result.list, items: result.items });
}
