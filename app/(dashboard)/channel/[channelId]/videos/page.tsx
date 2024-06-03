"use client"


import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChannelVideosRootPage({ params }: { params: { channelId: string } }) {
  const router = useRouter();

  const handleAddNewPrompt = () => {
    router.push(`/channel/${params.channelId}/videos/new`);
  };

  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
      <div className="mx-auto flex">
        {/* <UserButton afterSignOutUrl="/sign-in"/> */}
        <div className="flex items-center space-x-2" onClick={handleAddNewPrompt} style={{ cursor: 'pointer' }}>
          <div className="bg-[#6D66FF] rounded-full p-1">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div className="text-lg font-bold text-white">Add New Prompt</div>
        </div>
      </div>
    </div>
  );
}