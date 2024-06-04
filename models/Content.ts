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
  },
  content_generation_script_approved: {
    type: Boolean,
  },
  content_generation_voice_over_url: {
    type: String,
  },
  content_generation_voice_over_url_approved: {
    type: Boolean,
  },
  content_generation_captions: {
    type: String,
  },
  content_generation_captions_approved: {
    type: Boolean,
  },
  content_generation_background_video_url: {
    type: String,
  },
  content_generation_background_video_url_approved: {
    type: Boolean,
  },
  content_publishing_title: {
    type: String,
  },
  content_publishing_description: {
    type: String,
  },
  content_publishing_final_video_url: {
    type: String,
  },
  final_publishing_youtube_url: {
    type: String,
  },
  status: {
    type: String,
  },
  review_counts: {
    type: String,
  },
  corrections_to_be_made: {
    type: [{ 
      type: Object 
    }],
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

export const Content = models?.Content || model('Content', ContentSchema);
