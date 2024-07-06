import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import VideoCard from "./VideoCard"; // Import the new client component
import { getChannelContent } from "@/actions/getChannelContent";
import { unstable_cache } from "next/cache";
import { revalidateTag } from 'next/cache';

// Create a cached version of the getChannelContent function
const getCachedChannelContent = unstable_cache(
  async (channelId) => await getChannelContent(channelId),
  ["get-channel-content"],
  {
    tags: ["get-channel-content"],
  }
);

export const VideosList = async ({ channelId }: { channelId: string }) => {
  // Fetch content from the server
  const contents = await getChannelContent(channelId);
  revalidateTag('get-channel-content');



  return (
    <div className="relative w-full h-[calc(100vh-90px)] overflow-y-auto mr-2 hide-scrollbar">
      <div className="sticky top-0 w-[97.5%] space-y-4 bg-[#0E1026] rounded-xl p-3 z-10">
        <div className="">
          <Search className="absolute top-[30px] left-6 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="w-full pl-9 bg-transparent border-gray-500 focus:border-gray-500 text-white"
            placeholder="Search Content..."
          />
        </div>
        <div>
          <p className="text-xl text-gray-500 font-bold">CHANNEL CONTENT</p>
        </div>
      </div>
      <div className="mt-4 mr-6">
        <div className="grid grid-cols-1 gap-4 mt-4">
          {contents.map((content) => (
            <VideoCard 
              key={content._id} 
              content={content} 
              channelId={channelId} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideosList;
