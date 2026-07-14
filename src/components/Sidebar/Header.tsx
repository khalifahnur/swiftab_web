"use client";

import { useAuth } from "../auth/AuthContext";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Bell, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { user } = useAuth();
  const { toggleSidebar, isMobile } = useSidebar();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const firstName = user?.name?.split(" ")[0] || "Admin";

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-8 pb-2  shrink-0">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-gray-900 bg-gray-100/50">
            <SidebarTrigger />
          </Button>
        )}
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            Hey, {firstName} <span className="animate-wave origin-bottom-right">👋</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Welcome back to your dashboard.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        <div className="hidden lg:block text-sm font-medium text-gray-500 mr-2 whitespace-nowrap">
          {today}
        </div>

        {/* <Button className="bg-[#d4f870] hover:bg-[#c2e65c] text-[#1a2e05] rounded-full px-5 h-10 font-bold shadow-sm shrink-0 transition-transform hover:scale-105">
          <Plus className="w-4 h-4 mr-1.5 stroke-3" />
          New Order
        </Button> */}

        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-200 text-gray-600 shrink-0 shadow-sm">
          <Search className="w-4 h-4" />
        </Button>

        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-200 text-gray-600 shrink-0 shadow-sm relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        <Avatar className="h-10 w-10 border border-gray-200 shrink-0">
          <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
          <AvatarFallback className="bg-gray-900 text-white font-bold">
            {firstName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}