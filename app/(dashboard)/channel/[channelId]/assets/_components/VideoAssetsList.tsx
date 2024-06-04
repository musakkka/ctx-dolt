import React from "react";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { getChannelAssets } from "@/actions/getChannelAssets";
import { NewAssetWithList } from "./NewAssetWithList";
import NewAsset from "./NewAsset";
import AddFromYoutube from "./AddFromYoutube";

const getCachedChannelAssets = unstable_cache(
  async (channelId) => await getChannelAssets(channelId),
  ["get-channel-assets"],
  {
    tags: ["get-channel-assets"],
  }
);

export const VideoAssetsList = async ({ channelId }: { channelId: string }) => {
  const assets = await getCachedChannelAssets(channelId);

  // Convert MongoDB objects to plain objects
  const plainAssets = assets.map(asset => ({
    _id: asset._id.toString(),
    description: asset.description,
    type: asset.type,
    url: asset.url,
    account_id: asset.account_id.toString(),
    created_at: asset.created_at.toString(),
    updated_at: asset.updated_at.toString(),
  }));

  revalidateTag("get-channel-assets");

  return (
    <div className="text-white mb-24 mt-10">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white text-3xl font-bold">Videos</p>
        <div className="flex items-center justify-between">
          <NewAsset channelId={channelId} />
        </div>
        <div className="flex items-center justify-between">
          <AddFromYoutube channelId={channelId} />
        </div>
      </div>
      <NewAssetWithList channelId={channelId} assets={plainAssets} />
    </div>
  );
};

export default VideoAssetsList;
