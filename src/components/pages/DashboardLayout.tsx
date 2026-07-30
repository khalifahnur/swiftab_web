"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/auth/AuthContext";
import { RestaurantSetupModal } from "@/components/multiform/Container";
import { useEffect, useState } from "react";
import { FullScreenLoader } from "@/components/Loading/FullScreen";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { Header } from "@/components/Sidebar/Header";

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