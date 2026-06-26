import { cookies } from 'next/headers';
import { findUserById } from '@/backend/modules/users/infra/user.repository';
import { getSessionCookie, verifySessionToken } from './session';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = getSessionCookie(cookieStore);
  const session = verifySessionToken(token);

  if (!session) {
    return null;
  }

  const user = await findUserById(session.sub);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
