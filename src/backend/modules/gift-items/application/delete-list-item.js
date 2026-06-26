import { findGiftListByIdForUser, updateGiftListCounters } from '@/backend/modules/gift-lists/infra/gift-list.repository';
import { deleteGiftItem, summarizeGiftItemsByList } from '../infra/gift-item.repository';

export async function deleteListItem({ listId, itemId, userId }) {
  const list = await findGiftListByIdForUser(listId, userId);

  if (!list) {
    return { ok: false, status: 404, message: 'Lista não encontrada.' };
  }

  const deleted = await deleteGiftItem({ listId, itemId, userId });

  if (!deleted) {
    return { ok: false, status: 404, message: 'Item não encontrado.' };
  }

  const counters = await summarizeGiftItemsByList(listId);
  await updateGiftListCounters(listId, counters);

  return { ok: true, counters };
}
