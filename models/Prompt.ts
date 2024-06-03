import { model, Schema, models } from "mongoose";

const PromptSchema = new Schema({
  promptTitle: {
    type: String,
    required: true,
  },
  promptContent: {
    type: String,
    required: true,
  },
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true,
  },
  usage_count: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Ensure an index on the usage_count field
PromptSchema.index({ usage_count: 1 });

export const Prompt = models?.Prompt || model('Prompt', PromptSchema);
