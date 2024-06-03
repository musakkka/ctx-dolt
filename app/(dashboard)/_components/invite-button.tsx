import { Plus } from "lucide-react"
import { OrganizationProfile } from "@clerk/nextjs"

import {
    Dialog,
    DialogContent,
    DialogTrigger,
  
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export const InviteButton = () => {
  return (
    <Dialog>
        <DialogTrigger>
            <Button  variant="outline">
                <div className="space-x-2 items-center flex">
                <Plus className="h-4 w-4 " />
                <span>Invite Members</span>
                </div>
            </Button>
        </DialogTrigger>
        <DialogContent className="p-0 bg-transparent border-none max-w-[880px]">
            <OrganizationProfile routing="hash" />
        </DialogContent>
    </Dialog>
  );
}
