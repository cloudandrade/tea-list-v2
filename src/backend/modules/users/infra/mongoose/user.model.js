import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: 'users-v2' },
);

export const UserModel = mongoose.models.UserV2 || mongoose.model('UserV2', userSchema, 'users-v2');
