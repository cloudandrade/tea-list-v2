import { getCurrentUser } from '@/backend/modules/auth/application/get-current-user';
import { json, unauthorized } from '@/backend/shared/http/responses';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  return json({ user });
}
