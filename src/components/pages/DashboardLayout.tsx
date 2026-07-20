"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "../auth/AuthContext";
import { RestaurantSetupModal } from "../multiform/Container";
import { useEffect, useState } from "react";
import { FullScreenLoader } from "../Loading/FullScreen";
import { AppSidebar } from "../Sidebar/app-sidebar";
import { Header } from "../Sidebar/Header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isNewUser, setIsNewUser] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user && !user.restaurantId) {
      setIsNewUser(true);
      setIsModalOpen(true);
    }
  }, [user]);

  if (isLoading || !user) {
    return <FullScreenLoader />;
  }

  return (
    <SidebarProvider>
      {/* Changed bg color to match the sidebar for a seamless floating inset effect */}
      <div className="flex min-h-screen w-full bg-[#0f1115] text-white overflow-hidden">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full w-full">
            <Header />
            <div className="flex-1 w-full overflow-y-hidden">
              {children}
            </div>
          </div>
        </SidebarInset>

        {isNewUser && (
          <RestaurantSetupModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        )}
      </div>
    </SidebarProvider>
  );
}