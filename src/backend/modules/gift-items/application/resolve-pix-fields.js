import crypto from 'crypto';
import { findPixQrCodeByHash } from '../infra/gift-item.repository';

function normalizeText(value) {
  return String(value || '').trim();
}

function hashPixQrCode(dataUrl) {
  return crypto.createHash('sha256').update(dataUrl).digest('hex');
}

export async function resolvePixFields({ userId, input, excludeItemId }) {
  const pixEnabled = Boolean(input?.pixEnabled);

  if (!pixEnabled) {
    return {
      ok: true,
      pixEnabled: false,
      pixKey: '',
      pixQrCodeUrl: '',
      pixQrCodeHash: '',
    };
  }

  const pixKey = normalizeText(input?.pixKey);

  if (!pixKey) {
    return { ok: false, status: 400, message: 'Informe a chave Pix.' };
  }

  const incomingQrCodeUrl = String(input?.pixQrCodeUrl || '');

  if (!incomingQrCodeUrl) {
    return {
      ok: true,
      pixEnabled: true,
      pixKey,
      pixQrCodeUrl: '',
      pixQrCodeHash: '',
    };
  }

  const pixQrCodeHash = hashPixQrCode(incomingQrCodeUrl);
  const existing = await findPixQrCodeByHash({
    userId,
    hash: pixQrCodeHash,
    excludeItemId,
  });

  return {
    ok: true,
    pixEnabled: true,
    pixKey,
    pixQrCodeUrl: existing?.pixQrCodeUrl || incomingQrCodeUrl,
    pixQrCodeHash,
  };
}
