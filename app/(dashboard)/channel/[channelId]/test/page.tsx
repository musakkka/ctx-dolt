"use client"

import AudioEditor from "@/app/(dashboard)/_components/AudioEditor";
import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";

export default function DashboardRootPage() {
  const audioUrl = '/audio.mp3'; // Replace with the actual path to your audio file

  return (
    <div className="flex-1 h-[calc(100%-80px)] p-6 ">
    <div>
      <h1 className="text-white text-xl font-bold">Audio Editor</h1>
      <AudioEditor audioUrl={audioUrl} />
    </div>
    </div>
  );
}