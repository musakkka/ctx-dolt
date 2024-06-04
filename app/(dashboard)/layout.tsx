import { ClerkLoaded } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import SideBar from "./_components/sidebar";
import OrgSideBar from "./_components/organization-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <main className="flex h-full">
      <SideBar />
      <div className="ml-[230px] flex-1 h-full bg-[#17172C]">
        <div className="flex gap-x-3 h-full">
          <OrgSideBar/>
          <div className="h-full flex-1 min-h-screen ml-[180px] border-r-4">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
