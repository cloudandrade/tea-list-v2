import { deleteGiftItemsByList } from '@/backend/modules/gift-items/infra/gift-item.repository';
import { deleteGiftListForUser, findGiftListByIdForUser } from '../infra/gift-list.repository';

export async function deleteGiftList({ listId, userId }) {
  const list = await findGiftListByIdForUser(listId, userId);

  if (!list) {
    return { ok: false, status: 404, message: 'Lista não encontrada.' };
  }

  await deleteGiftItemsByList({ listId, userId });
  const deleted = await deleteGiftListForUser(listId, userId);

  if (!deleted) {
    return { ok: false, status: 404, message: 'Lista não encontrada.' };
  }

  return { ok: true };
}
