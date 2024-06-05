"use client";

import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, SquareArrowOutUpRight } from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";
import { deleteContent } from "@/actions/contentActions"; // Import deleteContent action
import { revalidateTag } from "next/cache";
import { useRouter } from "next/navigation";
import { format } from 'date-fns'; // Import date-fns for formatting
import { Badge } from "@/components/ui/badge";


type VideoCardProps = {
  content: {
    _id: string;
    content_generation_script: string;
    created_at: string;
    updated_at: string;
  };
  channelId: string;
};

const VideoCard: React.FC<VideoCardProps> = ({ content, channelId }) => {
  const createdAt = format(new Date(content.created_at), 'do MMMM yyyy \'at\' h:mmaaa');
  const updatedAt = format(new Date(content.updated_at), 'do MMMM yyyy \'at\' h:mmaaa');
    const router = useRouter();

    const handleDelete = async (contentId: string) => {
        try {
          const response = await deleteContent(contentId);
          if (response.success) {
            toast.success("Content deleted successfully!");
            router.push(`/channel/${channelId}/videos/`)
            // Refresh content list
            revalidateTag('get-channel-content');
          } else {
            toast.error("Failed to delete content");
          }
        } catch (error) {
        //   console.error('Error deleting content:', error);
        //   toast.error("Error deleting content");
        }
      };
  return (
    <Card key={content._id} className="bg-[#0E1026] border-none">
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center justify-between">
          <div className="text-red-500 cursor-pointer" onClick={() => handleDelete(content._id)}>
            <Trash />
          </div>
          <Link href={`/channel/${channelId}/videos/${content._id}`} passHref>
            <div className="text-white">
              <SquareArrowOutUpRight />
            </div>
          </Link>
        </CardTitle>
        <CardDescription className="text-white text-lg">
          {content.content_generation_script}
        </CardDescription>
        <div className="flex space-x-2">
          <Badge className="text-white" variant="outline">
            Created : {createdAt}
          </Badge>
          <Badge className="text-white" variant="outline">
            Updated : {updatedAt}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
};

export default VideoCard;
