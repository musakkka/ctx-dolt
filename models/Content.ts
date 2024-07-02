import { model, Schema, models } from "mongoose";

const ContentSchema = new Schema({
  account_id: {
    type: Schema.Types.ObjectId,
    ref: 'Accounts',
    required: true,
  },
  prompt_id: {
    type: Schema.Types.ObjectId || "Generic",
    ref: 'Prompt',
    required: false,
  },
  content_generation_script: {
    type: String,
    default: '',
  },
  content_generation_script_approved: {
    type: Boolean,
    default: false,
  },
  content_generation_voice_over_url: {
    type: String,
    default: '',
  },
  content_generation_voice_over_url_approved: {
    type: Boolean,
    default: false,
  },
  content_generation_captions: {
    type: String,
    default: '',
  },
  content_generation_captions_approved: {
    type: Boolean,
    default: false,
  },
  content_generation_background_video_url: {
    type: String,
    default: '',
  },
  content_generation_background_video_url_approved: {
    type: Boolean,
    default: false,
  },
  content_publishing_title: {
    type: String,
    default: '',
  },
  content_publishing_description: {
    type: String,
    default: '',
  },
  content_publishing_final_video_url: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  keywords: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: '',
  },
  final_publishing_youtube_url: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
  review_counts: {
    type: String,
    default: '',
  },
  corrections_to_be_made: {
    type: [{ type: Object }],
    default: [],
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

export const Content = models?.Content || model('Content', ContentSchema);
