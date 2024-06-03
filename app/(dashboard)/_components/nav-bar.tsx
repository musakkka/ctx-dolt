"use client";

import { UserButton } from "@clerk/nextjs";


const NavBar = () => {


  return (
    <div className="flex items-center gap-x-4 p-5">
      <div className="hidden lg:flex lg:flex-1">
      </div>
      <div className="block lg:hidden flex-1">
      </div>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

export default NavBar;
