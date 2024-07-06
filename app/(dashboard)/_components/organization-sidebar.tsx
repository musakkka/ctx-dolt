"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Cable, PaintBucket, Youtube } from "lucide-react";

const OrgSideBar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Extract the channel ID from the pathname
  const channelId = pathname.split("/")[2];

  // Determine if the current route is for videos, prompts, or assets
  const isVideosActive = pathname.includes(`/channel/${channelId}/videos`);
  const isPromptsActive = pathname.includes(`/channel/${channelId}/prompts`);
  const isAssetsActive = pathname.includes(`/channel/${channelId}/assets`);

  return (
    <div className="hidden lg:flex flex-col items-center justify-center h-screen w-[150px] fixed pl-5 pt-5 mx-4 border-r-4">
      <div className="space-y-3 w-full">
        <Button variant={isVideosActive ? "activePrimary" : "ghost"} className={isVideosActive ? "" : "hover:bg-transparent"}>
          <Link className="flex items-center" href={`/channel/${channelId}/videos`}>
            <Youtube className="h-4 w-4 mr-2 text-white" />
            <div className="text-white">Videos</div>
          </Link>
        </Button>
        {/* <Button variant={isPromptsActive ? "activePrimary" : "ghost"} className={isPromptsActive ? "" : "hover:bg-transparent"}>
          <Link className="flex items-center" href={`/channel/${channelId}/prompts`}>
            <Cable className="h-4 w-4 mr-2 text-white" />
            <div className="text-white">Prompts</div>
          </Link>
        </Button> */}
        <Button variant={isAssetsActive ? "activePrimary" : "ghost"} className={isAssetsActive ? "" : "hover:bg-transparent"}>
          <Link className="flex items-center hover:text-black" href={`/channel/${channelId}/assets`}>
            <PaintBucket className="h-4 w-4 mr-2 text-white" />
            <div className="text-white">Assets</div>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default OrgSideBar;
