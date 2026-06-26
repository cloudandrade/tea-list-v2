import { connectMongo } from '@/backend/shared/infra/mongodb/connect';
import { UserModel } from './mongoose/user.model';

function toUser(document) {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    name: document.name,
    email: document.email,
    passwordHash: document.passwordHash,
    createdAt: document.createdAt,
  };
}

export async function findUserByEmail(email) {
  await connectMongo();
  const user = await UserModel.findOne({ email }).lean();
  return toUser(user);
}

export async function findUserById(id) {
  await connectMongo();
  const user = await UserModel.findById(id).lean();
  return toUser(user);
}

export async function createUser({ name, email, passwordHash }) {
  await connectMongo();
  const user = await UserModel.create({ name, email, passwordHash });
  return toUser(user);
}
