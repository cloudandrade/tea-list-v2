import { updateGiftListForUser } from '../infra/gift-list.repository';

function normalizeText(value) {
  return String(value || '').trim();
}

export async function updateGiftList({ listId, userId, input }) {
  const title = normalizeText(input?.title);

  if (title.length < 3) {
    return { ok: false, status: 400, message: 'Informe um título para a lista.' };
  }

  const displayMode = ['blocks', 'detailed', 'compact'].includes(input?.displayMode) ? input.displayMode : 'blocks';

  const list = await updateGiftListForUser(listId, userId, {
    title,
    subtitle: normalizeText(input?.subtitle),
    type: normalizeText(input?.type) || 'Outro',
    message: normalizeText(input?.message),
    displayMode,
    coverImageUrl: String(input?.coverImageUrl || ''),
    theme: normalizeText(input?.theme) || 'general',
    colorPalette: normalizeText(input?.colorPalette) || 'terracotta',
    backgroundPattern: normalizeText(input?.backgroundPattern) || 'plain',
  });

  if (!list) {
    return { ok: false, status: 404, message: 'Lista não encontrada.' };
  }

  return { ok: true, list };
}
