import { listGiftItemsByList, toPublicGiftItem } from '@/backend/modules/gift-items/infra/gift-item.repository';
import { findGiftListByPublicHash } from '../infra/gift-list.repository';

export async function getPublicGiftList(publicHash) {
  const list = await findGiftListByPublicHash(publicHash);

  if (!list) {
    return { ok: false, status: 404, message: 'Lista pública não encontrada.' };
  }

  const items = await listGiftItemsByList(list.id);
  return { ok: true, list, items: items.map(toPublicGiftItem) };
}
