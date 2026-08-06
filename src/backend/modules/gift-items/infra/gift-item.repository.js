import { connectMongo } from '@/backend/shared/infra/mongodb/connect';
import { GiftItemModel } from './mongoose/gift-item.model';

export function getReservedQuantity(item) {
  return (item.reservations || []).reduce((total, reservation) => total + Number(reservation.quantity || 0), 0);
}

function toGiftItem(document) {
  if (!document) {
    return null;
  }

  const reservedQuantity = getReservedQuantity(document);

  return {
    id: document._id.toString(),
    listId: document.listId.toString(),
    userId: document.userId.toString(),
    name: document.name,
    price: document.price,
    quantity: document.quantity,
    description: document.description,
    imageUrl: document.imageUrl,
    pixEnabled: Boolean(document.pixEnabled),
    pixKey: document.pixKey || '',
    pixQrCodeUrl: document.pixQrCodeUrl || '',
    reservedQuantity,
    availableQuantity: Math.max(Number(document.quantity || 0) - reservedQuantity, 0),
    isReserved: reservedQuantity >= Number(document.quantity || 0),
    reservations: (document.reservations || []).map((reservation) => ({
      id: reservation._id?.toString(),
      guestName: reservation.guestName,
      guestPhone: reservation.guestPhone,
      quantity: reservation.quantity,
      createdAt: reservation.createdAt,
    })),
    createdAt: document.createdAt,
  };
}

export function toPublicGiftItem(item) {
  if (!item) {
    return null;
  }

  // Expõe só o nome de quem reservou (sem telefone) para o status "Presenteado por".
  const publicReservations = (item.reservations || []).map((reservation) => ({
    id: reservation.id,
    guestName: reservation.guestName,
    quantity: reservation.quantity,
    createdAt: reservation.createdAt,
  }));

  return {
    ...item,
    reservations: publicReservations,
  };
}

export async function findPixQrCodeByHash({ userId, hash, excludeItemId }) {
  if (!hash) {
    return null;
  }

  await connectMongo();
  const query = {
    userId,
    pixQrCodeHash: hash,
    pixQrCodeUrl: { $ne: '' },
  };

  if (excludeItemId) {
    query._id = { $ne: excludeItemId };
  }

  const document = await GiftItemModel.findOne(query).select('pixQrCodeUrl pixQrCodeHash').lean();

  if (!document?.pixQrCodeUrl) {
    return null;
  }

  return {
    pixQrCodeUrl: document.pixQrCodeUrl,
    pixQrCodeHash: document.pixQrCodeHash || hash,
  };
}

export async function createGiftItems(items) {
  await connectMongo();
  const createdItems = await GiftItemModel.insertMany(items);
  return createdItems.map(toGiftItem);
}

export async function listGiftItemsByList(listId) {
  await connectMongo();
  const items = await GiftItemModel.find({ listId }).sort({ createdAt: 1 }).lean();
  return items.map(toGiftItem);
}

export async function summarizeGiftItemsByList(listId) {
  const items = await listGiftItemsByList(listId);

  return {
    totalItems: items.length,
    reservedItems: items.filter((item) => item.isReserved).length,
  };
}

export async function reserveGiftItem({ listId, itemId, guestName, guestPhone }) {
  await connectMongo();
  const item = await GiftItemModel.findOne({ _id: itemId, listId });

  if (!item) {
    return { ok: false, status: 404, message: 'Item não encontrado.' };
  }

  const availableQuantity = Math.max(Number(item.quantity || 0) - getReservedQuantity(item), 0);

  if (availableQuantity <= 0) {
    return { ok: false, status: 409, message: 'Este item já foi reservado.' };
  }

  item.reservations.push({ guestName, guestPhone, quantity: 1 });
  await item.save();

  return { ok: true, item: toGiftItem(item) };
}

export async function updateGiftItem({ listId, itemId, userId, input }) {
  await connectMongo();
  const item = await GiftItemModel.findOne({ _id: itemId, listId, userId });

  if (!item) {
    return null;
  }

  if (input.name !== undefined) {
    item.name = input.name;
  }

  if (input.price !== undefined) {
    item.price = input.price;
  }

  if (input.quantity !== undefined) {
    item.quantity = input.quantity;
  }

  if (input.description !== undefined) {
    item.description = input.description;
  }

  if (input.imageUrl !== undefined) {
    item.imageUrl = input.imageUrl;
  }

  if (input.pixEnabled !== undefined) {
    item.pixEnabled = Boolean(input.pixEnabled);
  }

  if (input.pixKey !== undefined) {
    item.pixKey = input.pixKey;
  }

  if (input.pixQrCodeUrl !== undefined) {
    item.pixQrCodeUrl = input.pixQrCodeUrl;
  }

  if (input.pixQrCodeHash !== undefined) {
    item.pixQrCodeHash = input.pixQrCodeHash;
  }

  await item.save();
  return toGiftItem(item);
}

export async function deleteGiftItem({ listId, itemId, userId }) {
  await connectMongo();
  const result = await GiftItemModel.deleteOne({ _id: itemId, listId, userId });
  return result.deletedCount > 0;
}

export async function deleteGiftItemsByList({ listId, userId }) {
  await connectMongo();
  const result = await GiftItemModel.deleteMany({ listId, userId });
  return result.deletedCount;
}
