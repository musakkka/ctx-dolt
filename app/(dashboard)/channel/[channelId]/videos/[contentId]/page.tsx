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

  return (
    <div className="flex-1 w-full h-[calc(100vh-90px)] overflow-y-auto mr-2 hide-scrollbar">
      <div className="flex-1 space-y-4 p-8 pt-6 w-full">
        <h1 className="text-xl font-bold">Edit Prompt</h1>
        <ContentForm
          channelId={channelId}
          initialData={{
            contentGenerationScript: contentDetails.content_generation_script
          }}
          contentId={contentId}
        />
      </div>
    </div>
  );
}
