"use server";

import { Content } from "@/models/Content";
import { mongooseConnect } from "@/libs/mongoose";
import { revalidateTag } from "next/cache";

interface ContentData {
  contentGenerationScript: string;
  contentGenerationScriptApproved: boolean;
  contentGenerationVoiceOverUrl?: string;
  contentGenerationVoiceOverUrlApproved: boolean;
  contentGenerationCaptions?: string;
  contentGenerationCaptionsApproved: boolean;
  contentGenerationBackgroundVideoUrl?: string;
  contentGenerationBackgroundVideoUrlApproved: boolean;
  contentPublishingTitle?: string;
  contentPublishingDescription?: string;
  contentPublishingFinalVideoUrl?: string;
  finalPublishingYoutubeUrl?: string;
  status?: string;
  reviewCounts?: string;
  correctionsToBeMade?: object[];
  contentId?: string;
  channelId?: string;
}

export const createContent = async (data: ContentData): Promise<{ success: boolean; message: string }> => {
  try {
    await mongooseConnect();
    const newContent = await Content.create({
      content_generation_script: data.contentGenerationScript,
      content_generation_script_approved: data.contentGenerationScriptApproved,
      content_generation_voice_over_url: data.contentGenerationVoiceOverUrl,
      content_generation_voice_over_url_approved: data.contentGenerationVoiceOverUrlApproved,
      content_generation_captions: data.contentGenerationCaptions,
      content_generation_captions_approved: data.contentGenerationCaptionsApproved,
      content_generation_background_video_url: data.contentGenerationBackgroundVideoUrl,
      content_generation_background_video_url_approved: data.contentGenerationBackgroundVideoUrlApproved,
      content_publishing_title: data.contentPublishingTitle,
      content_publishing_description: data.contentPublishingDescription,
      content_publishing_final_video_url: data.contentPublishingFinalVideoUrl,
      final_publishing_youtube_url: data.finalPublishingYoutubeUrl,
      status: data.status,
      review_counts: data.reviewCounts,
      corrections_to_be_made: data.correctionsToBeMade,
      account_id: data.channelId,
      prompt_id: "66563158aa66b9928466743c"
    });
    console.log({newContent})
    revalidateTag("get-channel-content");

    return { success: true, message: "Content Created Successfully!" };
  } catch (error) {
    console.error("Error creating content:", error);
    return { success: false, message: "Error creating content!" };
  }
};

export const updateContent = async (data: ContentData): Promise<{ success: boolean; message: string; data?: object }> => {
  try {
    await mongooseConnect();
    const updatedData = await Content.updateOne(
      {
        _id: data.contentId,
      },
      {
        content_generation_script: data.contentGenerationScript,
        content_generation_script_approved: data.contentGenerationScriptApproved,
        content_generation_voice_over_url: data.contentGenerationVoiceOverUrl,
        content_generation_voice_over_url_approved: data.contentGenerationVoiceOverUrlApproved,
        content_generation_captions: data.contentGenerationCaptions,
        content_generation_captions_approved: data.contentGenerationCaptionsApproved,
        content_generation_background_video_url: data.contentGenerationBackgroundVideoUrl,
        content_generation_background_video_url_approved: data.contentGenerationBackgroundVideoUrlApproved,
        content_publishing_title: data.contentPublishingTitle,
        content_publishing_description: data.contentPublishingDescription,
        content_publishing_final_video_url: data.contentPublishingFinalVideoUrl,
        final_publishing_youtube_url: data.finalPublishingYoutubeUrl,
        status: data.status,
        review_counts: data.reviewCounts,
        corrections_to_be_made: data.correctionsToBeMade,
      });
    revalidateTag("get-channel-content");

    return { success: true, message: "Content Updated Successfully!" };
  } catch (error) {
    console.error("Error updating content:", error);
    return { success: false, message: "Error updating content!" };
  }
};
