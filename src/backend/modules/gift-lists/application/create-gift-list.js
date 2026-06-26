import crypto from 'crypto';
import { createGiftListForUser, publicHashExists } from '../infra/gift-list.repository';

function normalizeText(value) {
  return String(value || '').trim();
}

async function generatePublicHash() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const hash = crypto.randomBytes(8).toString('base64url');
    const exists = await publicHashExists(hash);

    if (!exists) {
      return hash;
    }
  }

  return crypto.randomUUID();
}

export async function createGiftList(userId, input) {
  const title = normalizeText(input?.title);

  if (title.length < 3) {
    return { ok: false, status: 400, message: 'Informe um título para a lista.' };
  }

  const displayMode = ['blocks', 'detailed', 'compact'].includes(input?.displayMode) ? input.displayMode : 'blocks';

  const list = await createGiftListForUser(userId, {
    title,
    subtitle: normalizeText(input?.subtitle),
    type: normalizeText(input?.type) || 'Outro',
    message: normalizeText(input?.message),
    displayMode,
    publicHash: await generatePublicHash(),
    coverImageUrl: String(input?.coverImageUrl || ''),
    theme: normalizeText(input?.theme) || 'general',
    colorPalette: normalizeText(input?.colorPalette) || 'terracotta',
    backgroundPattern: normalizeText(input?.backgroundPattern) || 'plain',
    reservedItems: 0,
    totalItems: 0,
    featured: false,
  });

  return { ok: true, list };
}
