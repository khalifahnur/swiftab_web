"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { user } = useAuth();
  const { toggleSidebar, isMobile } = useSidebar();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  
  const firstName = user?.name?.split(" ")[0] || "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b border-gray-200 bg-white/70 backdrop-blur-xl px-4 sm:px-5 shrink-0 transition-all">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-gray-600 hover:text-teal-700 bg-transparent rounded-sm h-8 w-8 hover:bg-black/5">
            <SidebarTrigger />
          </Button>
        )}
        <div className="hidden lg:block text-[13px] font-semibold text-gray-700 select-none">
         {user?.restaurantName || "Swiftab"} Workspace
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="hidden lg:flex text-[12px] font-medium text-gray-500 mr-2 whitespace-nowrap px-2 py-1">
          {today}
        </div>
        
        <Button variant="ghost" size="icon" className="rounded-sm h-8 w-8 text-gray-600 hover:text-teal-700 hover:bg-black/5 transition-colors">
          <Search className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-sm h-8 w-8 text-gray-600 hover:text-teal-700 hover:bg-black/5 relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-teal-600 rounded-full border border-white"></span>
        </Button>
        
        <div className="h-4 w-px bg-gray-300 mx-2 hidden sm:block"></div>
        
        <Avatar className="h-7 w-7 border border-gray-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity rounded-sm ml-1">
          <AvatarImage src={user?.image || ""} alt={user?.name || "User"} className="rounded-sm" />
          <AvatarFallback className="bg-teal-700 text-white font-semibold text-[10px] rounded-sm">
            {firstName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
