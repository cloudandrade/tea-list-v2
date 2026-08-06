import { findGiftListByIdForUser, updateGiftListCounters } from '@/backend/modules/gift-lists/infra/gift-list.repository';
import { parseItemSelection } from '@/shared/parse-item-selection';
import { listGiftItemsByList, summarizeGiftItemsByList, updateGiftItem } from '../infra/gift-item.repository';
import { resolvePixFields } from './resolve-pix-fields';

function normalizeText(value) {
  return String(value || '').trim();
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

async function buildPartialPatch({ userId, item, fields }) {
  const patch = {};

  if (hasOwn(fields, 'name')) {
    const name = normalizeText(fields.name);
    if (name.length < 2) {
      return { ok: false, status: 400, message: 'Informe um nome válido para aplicar nos itens.' };
    }
    patch.name = name;
  }

  if (hasOwn(fields, 'price')) {
    const price = Number(fields.price);
    if (Number.isNaN(price) || price < 0) {
      return { ok: false, status: 400, message: 'Informe um preço válido.' };
    }
    patch.price = price;
  }

  if (hasOwn(fields, 'quantity')) {
    const quantity = Math.max(Number(fields.quantity || 1), 1);
    if (Number.isNaN(quantity)) {
      return { ok: false, status: 400, message: 'Informe uma quantidade válida.' };
    }
    patch.quantity = quantity;
  }

  if (hasOwn(fields, 'description')) {
    patch.description = normalizeText(fields.description);
  }

  if (hasOwn(fields, 'imageUrl')) {
    patch.imageUrl = String(fields.imageUrl || '');
  }

  const touchesPix = hasOwn(fields, 'pixEnabled') || hasOwn(fields, 'pixKey') || hasOwn(fields, 'pixQrCodeUrl');

  if (touchesPix) {
    const pixFields = await resolvePixFields({
      userId,
      excludeItemId: item.id,
      input: {
        pixEnabled: hasOwn(fields, 'pixEnabled') ? Boolean(fields.pixEnabled) : Boolean(item.pixEnabled),
        pixKey: hasOwn(fields, 'pixKey') ? fields.pixKey : item.pixKey || '',
        pixQrCodeUrl: hasOwn(fields, 'pixQrCodeUrl') ? fields.pixQrCodeUrl : item.pixQrCodeUrl || '',
      },
    });

    if (!pixFields.ok) {
      return { ok: false, status: pixFields.status, message: pixFields.message };
    }

    patch.pixEnabled = pixFields.pixEnabled;
    patch.pixKey = pixFields.pixKey;
    patch.pixQrCodeUrl = pixFields.pixQrCodeUrl;
    patch.pixQrCodeHash = pixFields.pixQrCodeHash;
  }

  return { ok: true, patch };
}

export async function bulkUpdateListItems({ listId, userId, input }) {
  const list = await findGiftListByIdForUser(listId, userId);

  if (!list) {
    return { ok: false, status: 404, message: 'Lista não encontrada.' };
  }

  const fields = input?.fields && typeof input.fields === 'object' ? input.fields : {};

  if (Object.keys(fields).length === 0) {
    return { ok: false, status: 400, message: 'Preencha ao menos um campo para aplicar na edição em lote.' };
  }

  const items = await listGiftItemsByList(listId);

  if (items.length === 0) {
    return { ok: false, status: 400, message: 'Esta lista não possui itens.' };
  }

  const selection = parseItemSelection(input?.selection, { maxNumber: items.length });

  if (!selection.ok) {
    return { ok: false, status: 400, message: selection.message };
  }

  const selectedItems = selection.numbers
    .map((number) => items[number - 1])
    .filter(Boolean);

  if (selectedItems.length === 0) {
    return { ok: false, status: 400, message: 'Nenhum item encontrado na seleção informada.' };
  }

  const updatedItems = [];

  for (const selectedItem of selectedItems) {
    const partial = await buildPartialPatch({
      userId,
      item: selectedItem,
      fields,
    });

    if (!partial.ok) {
      return partial;
    }

    if (Object.keys(partial.patch).length === 0) {
      continue;
    }

    const item = await updateGiftItem({
      listId,
      itemId: selectedItem.id,
      userId,
      input: partial.patch,
    });

    if (!item) {
      return { ok: false, status: 404, message: 'Item não encontrado durante a edição em lote.' };
    }

    updatedItems.push(item);
  }

  const counters = await summarizeGiftItemsByList(listId);
  await updateGiftListCounters(listId, counters);

  return {
    ok: true,
    updatedCount: updatedItems.length,
    numbers: selection.numbers,
    items: updatedItems,
    counters,
  };
}
