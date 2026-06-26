import mongoose, { Schema } from 'mongoose';

const reservationSchema = new Schema(
  {
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    guestPhone: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true, _id: true },
);

const giftItemSchema = new Schema(
  {
    listId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'GiftListV2',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'UserV2',
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    reservations: {
      type: [reservationSchema],
      default: [],
    },
  },
  { timestamps: true, collection: 'gift-items-v2' },
);

giftItemSchema.index({ listId: 1, createdAt: 1 });

export const GiftItemModel =
  mongoose.models.GiftItemV2 || mongoose.model('GiftItemV2', giftItemSchema, 'gift-items-v2');
