import AudioEditor from "@/app/(dashboard)/_components/AudioEditor";
import { VideoAssetsList } from "./_components/VideoAssetsList";
import { getChannelNameById } from "@/actions/getChannellInfo";

interface ChannelAssetsRootPageProps {
  params: {
    channelId: string;
  };
}

export default async function ChannelAssetsRootPage({
  params,
}: ChannelAssetsRootPageProps) {
  const promptDetails = await getChannelNameById(params.channelId);
  const channelName = promptDetails.toUpperCase();

  return (
    <div className="flex-1 h-[calc(100%-80px)] p-6 ">
      <div>
        <div>
          <p className="text-white text-4xl font-bold">Assets for the channel : {channelName}</p>
        </div>
        <div>

          <VideoAssetsList />
        </div>
      </div>
    </div>
  );
}
