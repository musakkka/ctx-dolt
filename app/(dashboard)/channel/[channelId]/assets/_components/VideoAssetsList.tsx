import React from "react";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { getChannelAssets } from "@/actions/getChannelAssets";
import { NewAssetWithList } from "./NewAssetWithList";

const getCachedChannelAssets = unstable_cache(
  async (channelId) => await getChannelAssets(channelId),
  ["get-channel-assets"],
  {
    tags: ["get-channel-assets"],
  }
);

export const VideoAssetsList = async ({ channelId }: { channelId: string }) => {
  const assets = await getCachedChannelAssets(channelId);
  revalidateTag('get-channel-assets')

  return (
    <div className="text-white mb-24 mt-10">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white text-3xl font-bold">Videos</p>
      </div>
      <NewAssetWithList channelId={channelId} assets={assets} />
    </div>
  );
};

export default VideoAssetsList;
