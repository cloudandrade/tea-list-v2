import { listGiftListsByUser } from '../infra/gift-list.repository';

export async function listUserGiftLists(userId) {
  return listGiftListsByUser(userId);
}
