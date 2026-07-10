import { findGiftListByPublicHash, updateGiftListCounters } from '@/backend/modules/gift-lists/infra/gift-list.repository';
import { reserveGiftItem, summarizeGiftItemsByList, toPublicGiftItem } from '../infra/gift-item.repository';

function normalizeText(value) {
  return String(value || '').trim();
}

export async function reservePublicItem({ publicHash, itemId, input }) {
  const list = await findGiftListByPublicHash(publicHash);

  if (!list) {
    return { ok: false, status: 404, message: 'Lista pública não encontrada.' };
  }

  const guestName = normalizeText(input?.guestName);
  const guestPhone = normalizeText(input?.guestPhone);

  if (guestName.length < 2 || guestPhone.length < 8) {
    return { ok: false, status: 400, message: 'Informe nome e telefone para reservar.' };
  }

  const reservation = await reserveGiftItem({
    listId: list.id,
    itemId,
    guestName,
    guestPhone,
  });

  if (!reservation.ok) {
    return reservation;
  }

  const counters = await summarizeGiftItemsByList(list.id);
  await updateGiftListCounters(list.id, counters);

  return { ok: true, item: toPublicGiftItem(reservation.item), counters };
}
