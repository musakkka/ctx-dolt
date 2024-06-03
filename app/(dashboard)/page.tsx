"use client"

import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";

export default function DashboardRootPage() {

  return (
    <div className="flex-1 h-[calc(100%-80px)] p-6 ">
      <div className="w-full relative">
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                className="w-full max-w-[516px] pl-9 bg-transparent border-gray-500 focus:border-gray-500"
                placeholder="Search Boards" 
                // onChange={handleChange}
                // value={value}
            />
        </div>
    </div>
  );
}