"use client";

import { deletePrompt } from "@/actions/promptActions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SquareArrowOutUpRight, Trash } from "lucide-react";
import { revalidateTag } from "next/cache";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from 'date-fns'; // Import date-fns for formatting


type PromptCardProps = {
  prompt: {
    _id: string;
    promptContent: string;
    promptTitle: string;
    created_at: string;
    updated_at: string;
  };
  channelId: string;
};

const PromptCard: React.FC<PromptCardProps> = ({ prompt, channelId }) => {
  const createdAt = format(new Date(prompt.created_at), 'do MMMM yyyy \'at\' h:mmaaa');
  const updatedAt = format(new Date(prompt.updated_at), 'do MMMM yyyy \'at\' h:mmaaa');
  const router = useRouter();
  console.log({prompt});
  
  const handleDelete = async (promptId: string) => {
    try {
      const response = await deletePrompt(promptId);
      if (response.success) {
        toast.success("Prompt deleted successfully!");
        router.push(`/channel/${channelId}/prompts/`);
        // Refresh content list
        revalidateTag("get-chanel-prompts");
      } else {
        toast.error("Failed to delete prompt");
      }
    } catch (error) {
      //   console.error('Error deleting prompt:', error);
      //   toast.error("Error deleting prompt");
    }
  };

  return (
    <Card className="bg-[#0E1026] border-none">
      <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
          <div
            className="text-red-500 cursor-pointer"
            onClick={() => handleDelete(prompt._id)}
          >
            <Trash />
          </div>
          <Link href={`/channel/${channelId}/prompts/${prompt._id}`} passHref>
            <div className="text-white">
              <SquareArrowOutUpRight />
            </div>
          </Link>
          </div>
        <CardTitle className="text-white text-lg">
          {prompt.promptTitle}
        </CardTitle>
        <Separator />
        <CardDescription className="text-white text-lg">
          {prompt.promptContent}
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

export default PromptCard;
