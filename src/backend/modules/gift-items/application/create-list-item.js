import { findGiftListByIdForUser, updateGiftListCounters } from '@/backend/modules/gift-lists/infra/gift-list.repository';
import { createGiftItems, summarizeGiftItemsByList } from '../infra/gift-item.repository';

function normalizeText(value) {
  return String(value || '').trim();
}

export async function createListItem({ listId, userId, input }) {
  const list = await findGiftListByIdForUser(listId, userId);

  if (!list) {
    return { ok: false, status: 404, message: 'Lista não encontrada.' };
  }

  const name = normalizeText(input?.name);

  if (name.length < 2) {
    return { ok: false, status: 400, message: 'Informe o nome do item.' };
  }

  const quantity = Math.max(Number(input?.quantity || 1), 1);
  const itemsToCreate = Array.from({ length: quantity }, () => ({
    listId,
    userId,
    name,
    price: Number(input?.price || 0),
    quantity: 1,
    description: normalizeText(input?.description),
    imageUrl: String(input?.imageUrl || ''),
  }));
  const items = await createGiftItems(itemsToCreate);

  const counters = await summarizeGiftItemsByList(listId);
  await updateGiftListCounters(listId, counters);

  return { ok: true, item: items[0], items, counters };
}
