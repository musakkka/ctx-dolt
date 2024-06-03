"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import { Hint } from "@/components/ui/hint";

interface Account {
  _id: string;
  account_name: string;
}

export const List: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/channels");
        setAccounts(response.data);

        // Redirect to the first channel if the current path is '/'
        if (pathname === '/' && response.data.length > 0) {
          router.push(`/channel/${response.data[0]._id}/prompts`);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, [pathname, router]);

  const handleIconClick = (id: string) => {
    router.push(`/channel/${id}/prompts`);
  };

  return (
    <ul className="space-y-2">
      {accounts.map((account) => {
        const isActive = pathname.includes(`/channel/${account._id}`);
        return (
          <li
            key={account._id}
            className={`flex items-center space-x-4 py-1 px-2 rounded-md cursor-pointer hover:scale-105 hover:opacity-100 ${
              isActive ? "bg-[#6D66FF]" : ""
            }`}
            onClick={() => handleIconClick(account._id)}
          >
            <Hint
              label={account.account_name}
              side="right"
              align="center"
              sideOffset={18}
            >
              <Building2 className="h-6 w-6 cursor-pointer transition-transform transform" />
            </Hint>
            <span className="text-lg font-medium">{account.account_name}</span>
          </li>
        );
      })}
    </ul>
  );
};
