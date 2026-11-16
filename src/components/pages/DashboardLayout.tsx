"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from "@/components/auth/AuthContext";
import { RestaurantSetupModal } from "@/components/multiform/Container";
import { FullScreenLoader } from "@/components/Loading/FullScreen";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { Header } from "@/components/Sidebar/Header";
import { useLiveEvents } from "@/hooks/useLiveEvents";
import { Button } from "@/components/ui/button";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isError, refreshUser } = useAuth();
  const router = useRouter();

  const hasRestaurant = Boolean(user?.restaurantId);
  const live = useLiveEvents(hasRestaurant);

  // The dashboard is for signed-in admins only.
  useEffect(() => {
    if (!isLoading && !isError && !user) {
      router.replace("/signin");
    }
  }, [isLoading, isError, user, router]);

  if (isError) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900">We couldn't load your dashboard</h1>
        <p className="max-w-sm text-sm text-gray-500">
          The server didn't respond. Check your connection, then try again.
        </p>
        <Button onClick={() => refreshUser()} className="h-10 rounded-lg bg-teal px-5 text-white hover:bg-teal-deep">
          Try again
        </Button>
      </div>
    );
  }

  if (isLoading || !user) {
    return <FullScreenLoader />;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0f1115]">
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-gray-50 text-gray-900">
        <Header live={live} />
        <div className="min-w-0 flex-1">{hasRestaurant ? children : <SetupPrompt />}</div>
      </SidebarInset>

      {/* Nothing in the dashboard works until the restaurant exists, so the
          wizard stays open until it is completed. */}
      <RestaurantSetupModal isOpen={!hasRestaurant} />
    </div>
  );
}

function SetupPrompt() {
  return (
    <div className="flex h-[60vh] items-center justify-center p-8 text-center text-sm text-gray-500">
      Finish setting up your restaurant to open the dashboard.
    </div>
  );
}
