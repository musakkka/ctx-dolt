import { Plus } from "lucide-react";
import VideosList from "./_components/VideosList";
import Link from 'next/link';
import { getChannelNameById } from "@/actions/getChannellInfo";

export const maxDuration = 59; // This function can run for a maximum of 59 seconds
export const dynamic = 'force-dynamic';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: {
    channelId: string;
  };
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const promptDetails = await getChannelNameById(params.channelId);
  const channelName = promptDetails.toUpperCase(); 
  // console.log({ promptDetails });

  return (
    <div className="h-full flex-1 min-h-screen border-r-4 overflow-hidden">
      <div className="flex flex-col pb-4 my-4 text-2xl font-bold text-gray-500 w-full overflow-hidden">
        <div className="mb-2 flex items-center justify-between w-full pr-10">
          <div>
            <p className="text-white">CHANNEL NAME: {channelName}</p>
          </div>
          <div className="flex items-center">
            <Link href={`/channel/${params.channelId}/videos/new`}>
              <div className="flex items-center cursor-pointer">
                <div className="bg-[#6D66FF] rounded-full p-1">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="px-2 py-1 rounded-md text-lg font-bold text-white">
                  Add New Content
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="flex w-full max-h-full overflow-hidden">
          <div className="relative border-r-4 w-1/2 flex items-center overflow-hidden">
            <VideosList channelId={params.channelId} />
          </div>
          <div className="flex flex-1 w-full h-[calc(100vh-90px)] overflow-y-auto mr-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
