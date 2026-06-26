import bcrypt from 'bcryptjs';
import { normalizeEmail, validateNewUser } from '@/backend/modules/users/domain/user';
import { createUser, findUserByEmail } from '@/backend/modules/users/infra/user.repository';
import { createSessionToken } from './session';

export async function registerUser(input) {
  const validationError = validateNewUser(input);

  if (validationError) {
    return { ok: false, status: 400, message: validationError };
  }

  const name = String(input.name).trim();
  const email = normalizeEmail(input.email);
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return { ok: false, status: 409, message: 'Já existe uma conta com este e-mail.' };
  }

  const passwordHash = await bcrypt.hash(String(input.password), 12);
  const user = await createUser({ name, email, passwordHash });

  return {
    ok: true,
    user: { id: user.id, name: user.name, email: user.email },
    lists: [],
    token: createSessionToken(user),
  };
}
