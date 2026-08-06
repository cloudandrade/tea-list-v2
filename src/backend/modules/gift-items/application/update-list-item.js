import { findGiftListByIdForUser, updateGiftListCounters } from '@/backend/modules/gift-lists/infra/gift-list.repository';
import { summarizeGiftItemsByList, updateGiftItem } from '../infra/gift-item.repository';
import { resolvePixFields } from './resolve-pix-fields';

function normalizeText(value) {
  return String(value || '').trim();
}

export async function updateListItem({ listId, itemId, userId, input }) {
  const list = await findGiftListByIdForUser(listId, userId);

  if (!list) {
    return { ok: false, status: 404, message: 'Lista não encontrada.' };
  }

  const name = normalizeText(input?.name);

  if (name.length < 2) {
    return { ok: false, status: 400, message: 'Informe o nome do item.' };
  }

  const pixFields = await resolvePixFields({ userId, input, excludeItemId: itemId });

  if (!pixFields.ok) {
    return { ok: false, status: pixFields.status, message: pixFields.message };
  }

  const item = await updateGiftItem({
    listId,
    itemId,
    userId,
    input: {
      name,
      price: Number(input?.price || 0),
      quantity: Math.max(Number(input?.quantity || 1), 1),
      description: normalizeText(input?.description),
      imageUrl: String(input?.imageUrl || ''),
      pixEnabled: pixFields.pixEnabled,
      pixKey: pixFields.pixKey,
      pixQrCodeUrl: pixFields.pixQrCodeUrl,
      pixQrCodeHash: pixFields.pixQrCodeHash,
    },
  });

  if (!item) {
    return { ok: false, status: 404, message: 'Item não encontrado.' };
  }

  const counters = await summarizeGiftItemsByList(listId);
  await updateGiftListCounters(listId, counters);

  return { ok: true, item, counters };
}
