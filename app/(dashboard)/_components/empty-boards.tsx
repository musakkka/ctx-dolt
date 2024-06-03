"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { api } from "@/convex/_generated/api"
import { useOrganization } from "@clerk/nextjs"
import { useApiMutation } from "@/hooks/use-api-mutation"
import { toast } from "sonner"
import { useRouter } from "next/navigation"



export const EmptyBoards = () => {
  const router = useRouter();
  const { organization} = useOrganization();
  const {mutate, pending} = useApiMutation(api.board.create);

  const onClick = () => {
     if (!organization) return;

     mutate({
      orgId: organization.id,
      title: "Untitled",
     })
     .then((id) => {
      toast.success("Board Created!");
      router.push(`/board/${id}`);
     })
     .catch(() => {
      toast.error("Failed to create board");
     })
  };

  return (
    <div className="justify-center text-center">
        <Image
        src="./note.svg"
        alt="Empty"
        width={200}
        height={200}
        />  
        <h2 className="text-2xl font-semibold mt-6">
            Create Your First Board
        </h2>
        <p className="text-muted-foreground text-sm mt-2">
            Start By Creating A Board For Your Organization..
        </p>
        <div className="mt-6">
          <Button disabled={pending} onClick={onClick} size="lg">
              Create Board
          </Button>
        </div>
    </div>
  )
}
