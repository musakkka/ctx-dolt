import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { getChannelPrompts } from "@/actions/getChannelPrompts";
import { unstable_cache } from "next/cache";
import { revalidateTag } from 'next/cache'



// Create a cached version of the getChannelPrompts function
const getCachedChannelPrompts = unstable_cache(
  async (channelId) => await getChannelPrompts(channelId),
  ["get-chanel-prompts"],
  {
    tags: ["get-chanel-prompts"],
  }
);

export const PromptList = async ({ channelId }: { channelId: string }) => {
  // Fetch prompts from the server
  const prompts = await getCachedChannelPrompts(channelId);
    // const prompts = await getChannelPrompts(channelId);
    revalidateTag('get-chanel-prompts')



  return (
    <div className="relative w-full h-[calc(100vh-90px)] overflow-y-auto mr-2 hide-scrollbar">
      <div className="sticky top-0 w-[97.5%] space-y-4 bg-[#0E1026] rounded-xl p-3 z-10">
        <div className="">
          <Search className="absolute top-[30px] left-6 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="w-full pl-9 bg-transparent border-gray-500 focus:border-gray-500 text-white"
            placeholder="Search Prompts..."
          />
        </div>
        <div>
          <p className="text-xl text-gray-500 font-bold">CHANNEL PROMPTS</p>
        </div>
      </div>
      <div className="mt-4 mr-6">
        <div className="grid grid-cols-1 gap-4 mt-4">
          {prompts.map((prompt) => (
            <Link key={prompt._id} 
            href={`/channel/${channelId}/prompts/${prompt._id}`}
            >
              <Card className="bg-[#0E1026] border-none cursor-pointer">
                <CardHeader className="space-y-4">
                  <CardTitle className="text-white text-xl">
                    {prompt.promptTitle}
                  </CardTitle>
                  <Separator />
                  <CardDescription className="text-white text-lg">
                    {prompt.promptContent}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptList;
