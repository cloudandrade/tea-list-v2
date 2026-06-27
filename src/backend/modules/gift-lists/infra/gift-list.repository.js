import crypto from 'crypto';
import { connectMongo } from '@/backend/shared/infra/mongodb/connect';
import { GiftListModel } from './mongoose/gift-list.model';

function toGiftList(document) {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    title: document.title,
    subtitle: document.subtitle,
    type: document.type,
    message: document.message,
    displayMode: document.displayMode,
    publicHash: document.publicHash,
    coverImageUrl: document.coverImageUrl,
    reservedItems: document.reservedItems,
    totalItems: document.totalItems,
    theme: document.theme,
    colorPalette: document.colorPalette,
    backgroundPattern: document.backgroundPattern,
    featured: document.featured,
    createdAt: document.createdAt,
  };
}

async function makePublicHash() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const hash = crypto.randomBytes(8).toString('base64url');
    const exists = await GiftListModel.exists({ publicHash: hash });

    if (!exists) {
      return hash;
    }
  }

  return crypto.randomUUID();
}

async function ensurePublicHash(document) {
  if (!document || document.publicHash) {
    return document;
  }

  document.publicHash = await makePublicHash();
  await document.save();
  return document;
}

export async function createGiftListForUser(userId, list) {
  await connectMongo();
  const created = await GiftListModel.create({ ...list, userId });
  return toGiftList(created);
}

export async function listGiftListsByUser(userId) {
  await connectMongo();
  const lists = await GiftListModel.find({ userId }).sort({ featured: -1, createdAt: 1 }).lean();
  return lists.map(toGiftList);
}

export async function findGiftListByIdForUser(listId, userId) {
  await connectMongo();
  const listDocument = await GiftListModel.findOne({ _id: listId, userId });
  const list = await ensurePublicHash(listDocument);
  return toGiftList(list);
}

export async function findGiftListByPublicHash(publicHash) {
  await connectMongo();
  const list = await GiftListModel.findOne({ publicHash });
  return toGiftList(list);
}

export async function updateGiftListCounters(listId, counters) {
  await connectMongo();
  const list = await GiftListModel.findByIdAndUpdate(listId, counters, { new: true }).lean();
  return toGiftList(list);
}

export async function updateGiftListForUser(listId, userId, data) {
  await connectMongo();
  const listDocument = await GiftListModel.findOneAndUpdate({ _id: listId, userId }, data, { new: true });
  const list = await ensurePublicHash(listDocument);
  return toGiftList(list);
}

export async function publicHashExists(publicHash) {
  await connectMongo();
  return Boolean(await GiftListModel.exists({ publicHash }));
}
