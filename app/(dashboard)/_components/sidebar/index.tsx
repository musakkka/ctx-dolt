"use client";

import React, { useEffect, useState } from "react";
import { NewButton } from "./new-button";
import { List } from "./list";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input"; 
import logo from "@/public/logo.svg"
import { useClerk } from '@clerk/nextjs';


import { cn } from "@/lib/utils";

const font = Poppins({ subsets: ["latin"], weight: ["600"] });


const SideBar = () => {
  const [isClient, setIsClient] = useState(false);
  const { signOut } = useClerk();


  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <aside className="fixed z-[1] left-0 bg-[#0E1026] h-full flex px-3 pt-2 flex-col gap-y-4 text-white ">
      <Link href="/">
        <div className="flex items-center gap-x-2">
          <Image src={logo} alt="Logo" width={30} height={30} className="w-16 h-16" />
          <span className={cn("font-semibold text-2xl text-[#6D66FF]", font.className)}>
            CTX001
          </span>
        </div>
      </Link>
      <div className="w-full relative">
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                className="w-full max-w-[516px] pl-9 bg-transparent border-gray-500 focus:border-gray-500"
                placeholder="Search Boards" 
                // onChange={handleChange}
                // value={value}
            />
        </div>
     <div className="space-y-20">
     <div className="ml-1">
        <div className="text-xl text-gray-600 mb-4 font-bold">CHANNELS</div>
        <List />
      </div>
      <div className="w-full flex-1">
      <div className="text-xl text-gray-600 mb-4 font-bold flex-col items-center space-y-6">ACTIONS</div>

        <NewButton />
        <div>


        <button onClick={() => signOut({ redirectUrl: '/' })}>
      Sign out
    </button>

        </div>
      </div>
     </div>
    </aside>
  );
};

export default SideBar;
