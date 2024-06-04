import { getContentDetails } from "@/actions/getContentDetails";
import { ContentForm } from "./_components/ContentForm";

export default async function ChannelPromptsRootPage({
  params,
}: {
  params: { channelId: string; contentId: string };
}) {
  const { channelId, contentId } = params;

  if (contentId === "new") {
    return (
      <div className="flex-1 w-full h-[calc(100vh-90px)] overflow-y-auto mr-2 hide-scrollbar">
        <div className="flex-1 space-y-4 p-8 pt-6 w-full">
          <h1 className="text-xl font-bold">Create Prompt</h1>
          <ContentForm channelId={channelId} />
        </div>
      </div>
    );
  }

  let contentDetails;
  try {
    contentDetails = await getContentDetails(contentId);
  } catch (error) {
    return (
      <div className="flex-col w-full">
        <div className="flex-1 space-y-4 p-8 pt-6 w-full">
          <h1 className="text-xl font-bold">Error</h1>
          <p>Error loading content details.</p>
        </div>
      </div>
    );
  }

  const initialData = {
    contentGenerationScript: contentDetails.content_generation_script,
    contentGenerationScriptApproved: contentDetails.content_generation_script_approved,
    contentGenerationVoiceOverUrl: contentDetails.content_generation_voice_over_url,
    contentGenerationVoiceOverUrlApproved: contentDetails.content_generation_voice_over_url_approved,
    contentGenerationCaptions: contentDetails.content_generation_captions,
    contentGenerationCaptionsApproved: contentDetails.content_generation_captions_approved,
    contentGenerationBackgroundVideoUrl: contentDetails.content_generation_background_video_url,
    contentGenerationBackgroundVideoUrlApproved: contentDetails.content_generation_background_video_url_approved,
    contentPublishingTitle: contentDetails.content_publishing_title,
    contentPublishingDescription: contentDetails.content_publishing_description,
    contentPublishingFinalVideoUrl: contentDetails.content_publishing_final_video_url,
    finalPublishingYoutubeUrl: contentDetails.final_publishing_youtube_url,
    status: contentDetails.status,
    reviewCounts: contentDetails.review_counts,
    correctionsToBeMade: contentDetails.corrections_to_be_made,
  };

  return (
    <div className="flex-1 w-full h-[calc(100vh-90px)] overflow-y-auto mr-2 hide-scrollbar">
      <div className="flex-1 space-y-4 p-8 pt-6 w-full">
        <h1 className="text-xl font-bold">Edit Prompt</h1>
        <ContentForm
          channelId={channelId}
          initialData={initialData}
          contentId={contentId}
        />
      </div>
    </div>
  );
}
