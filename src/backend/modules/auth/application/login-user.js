import bcrypt from 'bcryptjs';
import { normalizeEmail } from '@/backend/modules/users/domain/user';
import { findUserByEmail } from '@/backend/modules/users/infra/user.repository';
import { createSessionToken } from './session';

export async function loginUser(input) {
  const email = normalizeEmail(input?.email);
  const password = String(input?.password || '');

  if (!email || !password) {
    return { ok: false, status: 400, message: 'Informe e-mail e senha.' };
  }

  const user = await findUserByEmail(email);
  const isPasswordValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !isPasswordValid) {
    return { ok: false, status: 401, message: 'E-mail ou senha inválidos.' };
  }

  return {
    ok: true,
    user: { id: user.id, name: user.name, email: user.email },
    token: createSessionToken(user),
  };
}
