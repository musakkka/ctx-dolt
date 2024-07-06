"use client";

import AudioEditor from "@/app/(dashboard)/_components/AudioEditor";
import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { getAccessLevel } from "@/access_levels/accessLevels";

export default function DashboardRootPage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const accessLevel = getAccessLevel(email);

  console.log("User Form Clerk In Test Route", email);
  const audioUrl = '/audio.mp3'; // Replace with the actual path to your audio file

  return (
    <div className="flex-1 h-[calc(100%-80px)] p-6 ">
      <div>
        <h1 className="text-white text-xl font-bold">Audio Editor</h1>
        {accessLevel === 'SUPER_ADMIN' && <p className="text-green-500">You are a Super Admin!</p>}
        {accessLevel === 'CURATOR' && <p className="text-blue-500">You are a Curator!</p>}
        {accessLevel === 'USER' && <p className="text-gray-500">You are a User.</p>}
      </div>
    </div>
  );
}
