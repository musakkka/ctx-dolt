import { PromptForm } from "./_components/PromptForm";
import { getPromptDetails } from "@/actions/getPromptDetails";

export default async function ChannelPromptsRootPage({
  params,
}: {
  params: { channelId: string; promptId: string };
}) {
  const { channelId, promptId } = params;
  // console.log({ promptId });

  if (promptId === "new") {
    return (
      <div className="flex-col w-full">
        <div className="flex-1 space-y-4 p-8 pt-6 w-full">
          <h1 className="text-xl font-bold">Create Prompt</h1>

          <PromptForm channelId={channelId} />
        </div>
      </div>
    );
  }

  const promptDetails = await getPromptDetails(promptId);

  return (
    <div className="flex-1 flex w-full">
      <div className="flex-1 space-y-4 p-8 pt-6 w-full">
        <h1 className="text-xl font-bold">Edit Prompt</h1>
        <PromptForm
          channelId={channelId}
          initialData={{
            promptTitle: promptDetails.promptTitle,
            promptContent: promptDetails.promptContent,
          }}
          promptId={promptId}
        />
      </div>
    </div>
  );
}
