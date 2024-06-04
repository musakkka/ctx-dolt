import { model, Schema, models } from "mongoose";

const AssetSchema = new Schema({
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["image", "video"],
  },
  url: {
    type: String,
    required: true,
  },
  account_id: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

export const Asset = models?.Asset || model('Asset', AssetSchema);
