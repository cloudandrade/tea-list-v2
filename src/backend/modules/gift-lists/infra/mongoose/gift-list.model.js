import mongoose, { Schema } from 'mongoose';

const MODEL_NAME = 'GiftListV2';

const giftListSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'UserV2',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    displayMode: {
      type: String,
      enum: ['blocks', 'detailed', 'compact'],
      default: 'blocks',
    },
    publicHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    reservedItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    theme: {
      type: String,
      default: 'general',
    },
    colorPalette: {
      type: String,
      default: 'terracotta',
    },
    backgroundPattern: {
      type: String,
      default: 'plain',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: 'gift-lists-v2' },
);

if (mongoose.models[MODEL_NAME]) {
  mongoose.deleteModel(MODEL_NAME);
}

export const GiftListModel = mongoose.model(MODEL_NAME, giftListSchema, 'gift-lists-v2');
