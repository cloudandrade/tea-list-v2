import { listGiftItemsByList } from '@/backend/modules/gift-items/infra/gift-item.repository';
import { findGiftListByIdForUser } from '../infra/gift-list.repository';

export async function getUserGiftList({ listId, userId }) {
  const list = await findGiftListByIdForUser(listId, userId);

  if (!list) {
    return { ok: false, status: 404, message: 'Lista não encontrada.' };
  }

  const items = await listGiftItemsByList(list.id);
  return { ok: true, list, items };
}
